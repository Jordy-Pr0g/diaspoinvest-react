// Vercel serverless function — création et envoi d'une campagne Brevo.
// Utilisé par le Cockpit (outil interne) pour envoyer la newsletter rédigée par Malik.
// Protégé par COCKPIT_SECRET pour éviter tout appel non autorisé.

const SENDER = { name: 'Jordan — DiaspoInvest', email: 'contact@diaspoinvest.fr' }
const LIST_IDS = [3] // "Newsletter DiaspoInvest"

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderBody(text) {
  // Supprime les lignes OBJET/PREHEADER et le séparateur ---
  const cleaned = text
    .replace(/^OBJET\s*:.+$/im, '')
    .replace(/^PREHEADER\s*:.+$/im, '')
    .replace(/^---+$/m, '')
    .trim()

  // Détecte le bloc CTA : ligne entre crochets contenant une URL Gumroad
  // Ex: [Faire mon propre calcul (19,99 €) → https://...]
  const ctaRegex = /\[([^\]]+https?:\/\/[^\]]+)\]/g
  const internalLinkRegex = /(https?:\/\/diaspoinvest\.fr\/[^\s<"]+)/g

  let html = ''
  const paragraphs = cleaned.split(/\n{2,}/)

  for (const block of paragraphs) {
    const trimmed = block.trim()
    if (!trimmed) continue

    // Bloc CTA Gumroad
    const ctaMatch = trimmed.match(/^\[([^\]]*https?:\/\/diaspoinvest\.gumroad[^\]]*)\]$/)
    if (ctaMatch) {
      const inner = ctaMatch[1]
      const urlMatch = inner.match(/(https?:\/\/[^\s\]]+)/)
      const url = urlMatch ? urlMatch[1] : '#'
      const label = esc(inner.replace(/(https?:\/\/[^\s\]]+)/g, '').replace(/[→>]/g, '').trim())
      html += `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
          <tr><td align="center">
            <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0D1525;font-weight:800;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:0.2px;">
              ${label || 'Accéder au produit'} &rarr;
            </a>
          </td></tr>
        </table>`
      continue
    }

    // Signature "À très vite" ou "Jordan,"
    if (/^(À très vite|A très vite|Jordan,)/i.test(trimmed)) {
      html += `
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:15px;color:#555;font-family:Georgia,serif;line-height:1.7;">${esc(trimmed).replace(/\n/g, '<br>')}</p>
        </div>`
      continue
    }

    // Paragraphe normal — linkifie les liens DiaspoInvest
    const lines = trimmed.split('\n').map(line => {
      return esc(line).replace(
        /https?:\/\/diaspoinvest\.(fr|gumroad\.com)\/[^\s<&]+/g,
        url => `<a href="${url}" style="color:#C9A84C;font-weight:600;text-decoration:underline;">${url}</a>`
      )
    }).join('<br>')

    html += `<p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#2d2d2d;font-family:Georgia,serif;">${lines}</p>`
  }

  return html
}

function textToHtml(text) {
  const bodyHtml = renderBody(text)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DiaspoInvest Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header avec logo -->
    <div style="background:#0D1525;padding:20px 32px;text-align:center;">
      <img src="https://diaspoinvest.fr/logo-email.jpg" alt="DiaspoInvest" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
    </div>

    <!-- Corps lettre -->
    <div style="padding:36px 40px 28px;">
      ${bodyHtml}
    </div>

    <!-- Footer légal -->
    <div style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;">
      <p style="margin:0 0 8px;font-size:11px;color:#aaa;font-family:Arial,sans-serif;line-height:1.6;text-align:center;">
        DiaspoInvest est un projet &eacute;ducatif ind&eacute;pendant, non affili&eacute; &agrave; la BRVM ni au CREPMF.<br>
        Ce contenu ne constitue pas un conseil en investissement. Investir comporte un risque de perte en capital.
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#ccc;font-family:Arial,sans-serif;text-align:center;">
        Tu re&ccedil;ois cet email car tu t'es inscrit(e) sur <a href="https://diaspoinvest.fr" style="color:#C9A84C;">diaspoinvest.fr</a>
        &nbsp;&bull;&nbsp;
        <a href="{{unsubscribe}}" style="color:#ccc;">Se d&eacute;sabonner</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

function extractSubject(text) {
  const match = text.match(/OBJET\s*[:\-]?\s*(.+)/i)
  if (match) return match[1].trim().slice(0, 150)
  const firstLine = text.split('\n').find(l => l.trim().length > 5)
  return firstLine ? firstLine.trim().slice(0, 150) : 'Newsletter DiaspoInvest'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Protection par secret cockpit
  const secret = process.env.COCKPIT_SECRET
  const authHeader = req.headers['x-cockpit-secret'] || ''
  if (secret && authHeader !== secret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  const { content, subject: subjectOverride, scheduledAt, testEmail } = req.body || {}
  if (!content || typeof content !== 'string' || content.trim().length < 50) {
    return res.status(400).json({ error: 'Contenu newsletter manquant ou trop court.' })
  }

  const apiKey = (process.env.BREVO_API_KEY || '').trim()
  if (!apiKey) return res.status(500).json({ error: 'BREVO_API_KEY non configurée.' })

  const subject = subjectOverride || extractSubject(content)
  const htmlContent = textToHtml(content)

  // Mode test : envoi transactionnel direct sans créer de campagne
  if (testEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return res.status(400).json({ error: 'Adresse email de test invalide.' })
    }
    try {
      const testRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email: testEmail }],
          subject: `[TEST] ${subject}`,
          htmlContent: htmlContent.replace('{{unsubscribe}}', '#'),
        }),
      })
      if (!testRes.ok) {
        const err = await testRes.json().catch(() => ({}))
        return res.status(502).json({ error: err.message || `Brevo erreur ${testRes.status}` })
      }
      return res.status(200).json({ success: true, test: true, to: testEmail, subject })
    } catch {
      return res.status(502).json({ error: 'Brevo injoignable lors de l\'envoi test.' })
    }
  }

  // 1) Créer la campagne
  const campaignName = `Newsletter ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
  let campaignId
  try {
    const createRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        name: campaignName,
        subject,
        sender: SENDER,
        recipients: { listIds: LIST_IDS },
        htmlContent,
        ...(scheduledAt ? { scheduledAt } : {}),
      }),
    })
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}))
      return res.status(502).json({ error: err.message || `Brevo erreur ${createRes.status}` })
    }
    const data = await createRes.json()
    campaignId = data.id
  } catch (e) {
    return res.status(502).json({ error: 'Brevo injoignable lors de la création.' })
  }

  // 2) Envoyer immédiatement (si pas de date programmée)
  if (!scheduledAt) {
    try {
      const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`, {
        method: 'POST',
        headers: { 'api-key': apiKey, accept: 'application/json' },
      })
      if (!sendRes.ok) {
        const err = await sendRes.json().catch(() => ({}))
        return res.status(502).json({ error: err.message || `Brevo send erreur ${sendRes.status}`, campaignId })
      }
    } catch {
      return res.status(502).json({ error: 'Brevo injoignable lors de l\'envoi.', campaignId })
    }
  }

  return res.status(200).json({ success: true, campaignId, subject, scheduled: !!scheduledAt })
}
