// Vercel serverless function — création et envoi d'une campagne Brevo.
// Utilisé par le Cockpit (outil interne) pour envoyer la newsletter rédigée par Malik.
// Protégé par COCKPIT_SECRET pour éviter tout appel non autorisé.

const SENDER = { name: 'Jordan de DiaspoInvest', email: 'contact@diaspoinvest.fr' }
const LIST_IDS = [3] // "Newsletter DiaspoInvest"

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderBody(text, chartImg = '') {
  // Supprime les lignes OBJET/PREHEADER et le séparateur ---
  let cleaned = text
    .replace(/^OBJET\s*:.+$/im, '')
    .replace(/^PREHEADER\s*:.+$/im, '')
    .replace(/^---+$/m, '')
    .trim()

  // Filet de sécurité : aucun tiret long/moyen ne doit subsister dans le texte
  cleaned = cleaned.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',')

  // Graphique BRVM, inséré juste avant la signature (pas tout à la fin)
  const chartBlock = chartImg ? `
    <div style="margin:30px 0 8px;">
      <div style="font-family:Georgia,serif;font-size:13px;color:#888;margin:0 0 10px;">Le marché en bref, variation des secteurs BRVM</div>
      <img src="${chartImg}" width="100%" style="display:block;width:100%;max-width:520px;height:auto;border:1px solid #eee;border-radius:10px;" alt="Variation des secteurs BRVM" />
      <div style="font-size:11px;color:#bbb;font-family:Arial,sans-serif;margin-top:6px;">Source : brvm.org et sikafinance.com, sur diaspoinvest.fr</div>
    </div>` : ''
  let chartDone = false

  // Détecte le bloc CTA : ligne entre crochets contenant une URL Gumroad
  // Ex: [Faire mon propre calcul (19,99 €) → https://...]
  const ctaRegex = /\[([^\]]+https?:\/\/[^\]]+)\]/g
  const internalLinkRegex = /(https?:\/\/diaspoinvest\.fr\/[^\s<"]+)/g

  let html = ''
  const paragraphs = cleaned.split(/\n{2,}/)

  for (const block of paragraphs) {
    const trimmed = block.trim()
    if (!trimmed) continue

    // Bloc CTA Gumroad — carte produit illustrée. Gère 1 OU 2 versions (Europe ET UEMOA),
    // séparées par "|", pour ne jamais exclure une partie de l'audience.
    const ctaMatch = trimmed.match(/^\[([^\]]*https?:\/\/diaspoinvest\.gumroad[^\]]*)\]$/)
    if (ctaMatch) {
      const inner = ctaMatch[1]
      const IMG = { oxxzda: 'produit-guide.jpg', dpqvqo: 'produit-guide.jpg', tocir: 'produit-tracker.jpg', ecspxh: 'produit-pack.jpg', cvkcwo: 'produit-pack.jpg' }
      const parts = inner.split('|').map(s => s.trim()).filter(p => /https?:\/\//.test(p))
      const firstKey = (inner.match(/gumroad\.com\/l\/(\w+)/) || [])[1] || ''
      const img = IMG[firstKey]
      const imgRow = img
        ? `<tr><td style="padding:0;"><img src="https://diaspoinvest.fr/${img}" width="100%" style="display:block;width:100%;max-width:520px;height:auto;border:0;" alt="Produit DiaspoInvest" /></td></tr>`
        : ''
      const buttons = parts.map(p => {
        const u = (p.match(/https?:\/\/[^\s\]]+/) || ['#'])[0]
        const lbl = esc(p.replace(/https?:\/\/[^\s\]]+/g, '').replace(/[→>]/g, '').trim()) || 'Découvrir'
        return `<a href="${u}" style="display:inline-block;margin:6px;background:#0D2B1E;color:#C9A84C;font-weight:800;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:0.2px;">${lbl} &rarr;</a>`
      }).join('')
      const note = parts.length > 1
        ? `<div style="font-size:13px;color:#666;font-family:Arial,sans-serif;margin-bottom:12px;">Choisis ta version selon où tu vis :</div>`
        : ''
      html += `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:34px 0;border:1px solid #ece7d8;border-radius:14px;overflow:hidden;background:#fbf9f3;">
          ${imgRow}
          <tr><td align="center" style="padding:22px 24px;">
            ${note}${buttons}
          </td></tr>
        </table>`
      continue
    }

    // Repère de placement du graphique : Malik écrit [GRAPHIQUE] où il veut le voir
    if (/^\[graphique\]$/i.test(trimmed)) {
      if (chartImg && !chartDone) { html += chartBlock; chartDone = true }
      continue
    }

    // Question interactive de fin : "SONDAGE: question | option A | option B | option C"
    // Chaque option ouvre une réponse pré-remplie (les réponses boostent l'engagement et la délivrabilité).
    const sondageMatch = trimmed.match(/^SONDAGE\s*:\s*(.+)$/is)
    if (sondageMatch) {
      const parts = sondageMatch[1].split('|').map(s => s.trim()).filter(Boolean)
      const question = parts.shift() || 'Et toi, où en es-tu ?'
      const buttons = parts.slice(0, 4).map(o => {
        const mailto = `mailto:contact@diaspoinvest.fr?subject=${encodeURIComponent('Sondage newsletter')}&body=${encodeURIComponent(o)}`
        return `<a href="${mailto}" style="display:inline-block;margin:6px 8px 0 0;background:#ffffff;border:1px solid #C9A84C;color:#0D2B1E;font-weight:700;font-size:14px;padding:11px 18px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;">${esc(o)} &rarr;</a>`
      }).join('')
      html += `
        <div style="margin:34px 0;padding:24px;background:#f6f4ec;border:1px solid #ece7d8;border-radius:12px;">
          <p style="margin:0 0 14px;font-size:17px;font-weight:700;color:#0D2B1E;font-family:Georgia,serif;line-height:1.5;">${esc(question)}</p>
          <div>${buttons}</div>
          <p style="margin:16px 0 0;font-size:12px;color:#999;font-family:Arial,sans-serif;">Clique, ça ouvre ta messagerie. Un mot suffit, je lis chaque réponse.</p>
        </div>`
      continue
    }

    // Signature "À très vite" ou "Jordan," — on insère le graphique juste avant
    if (/^(À très vite|A très vite|Jordan,)/i.test(trimmed)) {
      if (chartImg && !chartDone) { html += chartBlock; chartDone = true }
      html += `
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:15px;color:#555;font-family:Georgia,serif;line-height:1.7;">${esc(trimmed).replace(/\n/g, '<br>')}</p>
          <p style="margin:10px 0 0;font-size:13px;color:#C9A84C;font-family:Arial,sans-serif;font-weight:700;">diaspoinvest.fr</p>
        </div>`
      continue
    }

    // Sous-titre de dossier : ligne courte unique, sans lien, sans ponctuation de fin
    // (ex : "Ce que tu possèdes vraiment ?", "Pour qui, dans quels cas ?")
    const estSousTitre = !trimmed.includes('\n') && trimmed.length <= 72 && !/https?:\/\//.test(trimmed) && (trimmed.endsWith('?') || !/[.!:]$/.test(trimmed))
    if (estSousTitre) {
      html += `<h3 style="margin:30px 0 12px;font-family:Georgia,serif;font-size:19px;font-weight:700;color:#0D2B1E;padding-left:12px;border-left:3px solid #C9A84C;line-height:1.4;">${esc(trimmed)}</h3>`
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

  if (chartImg && !chartDone) html += chartBlock
  return html
}

function textToHtml(text, chartImg = '') {
  const bodyHtml = renderBody(text, chartImg)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DiaspoInvest Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#eceae4;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.10);">

    <!-- Header : logo horizontal foncé sur fond blanc (pas de rectangle), + nom de domaine -->
    <div style="background:#ffffff;padding:26px 32px 18px;text-align:center;border-bottom:3px solid #C9A84C;">
      <img src="https://diaspoinvest.fr/logo-email.jpg" alt="DiaspoInvest" width="220" style="display:block;margin:0 auto;width:220px;max-width:80%;height:auto;" />
      <div style="margin-top:10px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#0D2B1E;font-weight:700;">diaspoinvest.fr</div>
    </div>

    <!-- Corps lettre -->
    <div style="padding:36px 40px 20px;">
      ${bodyHtml}
    </div>

    <!-- Footer légal -->
    <div style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;">
      <p style="margin:0 0 8px;font-size:11px;color:#aaa;font-family:Arial,sans-serif;line-height:1.6;text-align:center;">
        DiaspoInvest est un projet &eacute;ducatif ind&eacute;pendant, non affili&eacute; &agrave; la BRVM ni &agrave; l'AMF-UMOA.<br>
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

// Construit l'URL d'un graphique BRVM (secteurs) via QuickChart, à partir des données live.
// L'image est rendue par QuickChart côté serveur : on n'a qu'à fournir l'URL.
async function buildBrvmChartUrl() {
  try {
    const r = await fetch('https://diaspoinvest.fr/api/brvm-data')
    if (!r.ok) return ''
    const d = await r.json()
    const idx = d.indices || {}
    const exclus = ['BRVM - COMPOSITE', 'BRVM - PRESTIGE', 'BRVM - PRINCIPAL', 'BRVM – COMPOSITE TOTAL RETURN']
    const sect = Object.entries(idx)
      .filter(([k]) => k.startsWith('BRVM - ') && !exclus.includes(k))
      .map(([k, v]) => ({ n: k.replace('BRVM - ', ''), v: Number(v.variation_pct) }))
      .filter(s => !Number.isNaN(s.v))
      .sort((a, b) => b.v - a.v)
      .slice(0, 7)
    if (!sect.length) return ''
    const config = {
      type: 'horizontalBar',
      data: {
        labels: sect.map(s => s.n),
        datasets: [{ data: sect.map(s => s.v), backgroundColor: sect.map(s => (s.v >= 0 ? '#3FB870' : '#E5484D')) }],
      },
      options: {
        legend: { display: false },
        title: { display: true, text: 'Variation des secteurs (%)' },
        scales: { xAxes: [{ ticks: { fontColor: '#666' } }], yAxes: [{ ticks: { fontColor: '#333' } }] },
      },
    }
    return 'https://quickchart.io/chart?w=560&h=300&bkg=white&c=' + encodeURIComponent(JSON.stringify(config))
  } catch { return '' }
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
  const chartUrl = await buildBrvmChartUrl()
  const htmlContent = textToHtml(content, chartUrl)

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
