// Vercel serverless function — création et envoi d'une campagne Brevo.
// Utilisé par le Cockpit (outil interne) pour envoyer la newsletter rédigée par Malik.
// Protégé par COCKPIT_SECRET pour éviter tout appel non autorisé.

const SENDER = { name: 'Jordan — DiaspoInvest', email: 'contact@diaspoinvest.fr' }
const LIST_IDS = [3] // "Newsletter DiaspoInvest"

function textToHtml(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const paragraphs = escaped
    .split(/\n{2,}/)
    .map(block => {
      const lines = block.split('\n').join('<br>')
      return `<p style="margin:0 0 16px;line-height:1.7;color:#333;">${lines}</p>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;">
    <div style="background:#0D1525;padding:24px 32px;">
      <div style="font-family:sans-serif;font-size:22px;font-weight:800;color:#C9A84C;letter-spacing:-0.5px;">
        Diaspo<span style="color:#fff;">Invest</span>
      </div>
    </div>
    <div style="padding:32px;">
      ${paragraphs}
    </div>
    <div style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;font-family:sans-serif;font-size:12px;color:#999;text-align:center;">
      Tu reçois cet email car tu t'es inscrit(e) sur diaspoinvest.fr.<br>
      <a href="{{unsubscribe}}" style="color:#999;">Se désabonner</a>
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
