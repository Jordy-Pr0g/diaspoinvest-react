// Vercel serverless function — création et envoi d'une campagne Brevo.
// Utilisé par le Cockpit (outil interne) pour envoyer la newsletter rédigée par Malik.
// Protégé par COCKPIT_SECRET pour éviter tout appel non autorisé.

const SENDER = { name: 'Jordan — DiaspoInvest', email: 'contact@diaspoinvest.fr' }
const LIST_IDS = [3] // "Newsletter DiaspoInvest"

const SECTION_LABELS = {
  INTRO: { label: null, color: null },
  'CE QUI A BOUGÉ': { label: '📊 Ce qui a bougé', color: '#1a3a2a' },
  SIGNAL: { label: '🔍 Signal de la semaine', color: '#1a2a3a' },
  CONSEIL: { label: '💡 Conseil', color: '#2a1a3a' },
  CTA: { label: null, color: null, isCta: true },
  QUESTION: { label: '💬 Question de la semaine', color: '#1a2a1a' },
  SIGNATURE: { label: null, color: null, isSignature: true },
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function linkify(str) {
  return esc(str).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#C9A84C;font-weight:700;">$1</a>'
  )
}

function parseSection(raw) {
  const match = raw.match(/^(OBJET|PREHEADER|INTRO|CE QUI A BOUGÉ|SIGNAL|CONSEIL|CTA|QUESTION|SIGNATURE)\s*[:\-]?\s*/i)
  if (!match) return { key: null, content: raw.trim() }
  return {
    key: match[1].toUpperCase().trim(),
    content: raw.slice(match[0].length).trim(),
  }
}

function renderParagraphs(text) {
  return text.split(/\n{2,}/).map(block => {
    const lines = block.split('\n').map(linkify).join('<br>')
    return `<p style="margin:0 0 14px;font-size:16px;line-height:1.75;color:#2d2d2d;font-family:Georgia,serif;">${lines}</p>`
  }).join('')
}

function textToHtml(text) {
  // Découpe par sections
  const rawSections = text.split(/\n(?=(?:OBJET|PREHEADER|INTRO|CE QUI A BOUGÉ|SIGNAL|CONSEIL|CTA|QUESTION|SIGNATURE)\s*[:\-]?)/i)
  const sections = rawSections.map(parseSection).filter(s => s.content.length > 0)

  let introHtml = ''
  let bodyHtml = ''

  for (const s of sections) {
    const key = s.key
    const content = s.content

    if (!key || key === 'OBJET' || key === 'PREHEADER') continue

    if (key === 'INTRO') {
      introHtml = `<div style="padding:0 0 24px;">${renderParagraphs(content)}</div>`
      continue
    }

    if (key === 'SIGNATURE') {
      bodyHtml += `
        <div style="margin-top:32px;padding-top:24px;border-top:2px solid #f0f0f0;">
          <p style="margin:0;font-size:15px;color:#444;font-family:Georgia,serif;font-style:italic;">${linkify(content)}</p>
        </div>`
      continue
    }

    if (key === 'CTA') {
      // Extraire l'URL s'il y en a une
      const urlMatch = content.match(/(https?:\/\/[^\s]+)/)
      const url = urlMatch ? urlMatch[1] : 'https://diaspoinvest.gumroad.com/l/tocir'
      const ctaText = esc(content.replace(/(https?:\/\/[^\s]+)/g, '').trim()) || 'Obtenir le Tracker Dashboard'
      bodyHtml += `
        <div style="margin:28px 0;padding:24px;background:#0D1525;border-radius:10px;text-align:center;">
          <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.8);font-family:Georgia,serif;line-height:1.6;">${ctaText}</p>
          <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0D1525;font-weight:800;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;">
            Obtenir le Tracker Dashboard &rarr;
          </a>
          <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;">19,99&nbsp;&euro; &mdash; offre valable jusqu'&agrave; fin juillet 2026</p>
        </div>`
      continue
    }

    const meta = SECTION_LABELS[key] || {}
    const bg = meta.color || '#f8f8f8'
    const label = meta.label || key

    bodyHtml += `
      <div style="margin:0 0 24px;border-radius:10px;overflow:hidden;">
        <div style="background:${bg};padding:10px 20px;">
          <span style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;letter-spacing:0.5px;">${label}</span>
        </div>
        <div style="padding:20px;background:#fafafa;border:1px solid #ebebeb;border-top:none;border-radius:0 0 10px 10px;">
          ${renderParagraphs(content)}
        </div>
      </div>`
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DiaspoInvest Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0D1525;padding:24px 32px;display:block;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-family:Arial,sans-serif;font-size:24px;font-weight:900;color:#C9A84C;letter-spacing:-0.5px;">Diaspo</span><span style="font-family:Arial,sans-serif;font-size:24px;font-weight:900;color:#ffffff;">Invest</span>
          </td>
          <td align="right">
            <span style="font-size:12px;color:rgba(255,255,255,0.35);font-family:Arial,sans-serif;">Newsletter BRVM</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Intro -->
    <div style="padding:32px 32px 8px;">
      ${introHtml}
    </div>

    <!-- Sections -->
    <div style="padding:0 32px 32px;">
      ${bodyHtml}
    </div>

    <!-- Disclaimer -->
    <div style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;">
      <p style="margin:0 0 8px;font-size:11px;color:#999;font-family:Arial,sans-serif;line-height:1.6;">
        DiaspoInvest est un projet &eacute;ducatif ind&eacute;pendant, non affili&eacute; &agrave; la BRVM ni au CREPMF. Ce contenu ne constitue pas un conseil en investissement. Investir comporte un risque de perte en capital.
      </p>
      <p style="margin:0;font-size:11px;color:#bbb;font-family:Arial,sans-serif;text-align:center;">
        Tu re&ccedil;ois cet email car tu t'es inscrit(e) sur <a href="https://diaspoinvest.fr" style="color:#C9A84C;">diaspoinvest.fr</a> &nbsp;&bull;&nbsp;
        <a href="{{unsubscribe}}" style="color:#bbb;">Se d&eacute;sabonner</a>
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
