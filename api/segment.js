// Vercel serverless function — ajoute un contact à la liste #7 (Intéressés) après segmentation J+16
const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim()
const LIST_INTERESSES = 7

const ALLOWED_ORIGINS = [
  'https://diaspoinvest.fr',
  'https://www.diaspoinvest.fr',
]

function isAllowedOrigin(req) {
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.some(o => referer.startsWith(o))
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { email, segment } = req.body

  if (!email || !['diaspora', 'uemoa', 'investisseur'].includes(segment)) {
    return res.status(400).json({ error: 'email et segment requis (diaspora | uemoa | investisseur)' })
  }

  const attributs = {
    diaspora:     { SEGMENT: 'DIASPORA_EUROPE' },
    uemoa:        { SEGMENT: 'UEMOA_AFRIQUE' },
    investisseur: { SEGMENT: 'DEJA_INVESTISSEUR' },
  }

  // Met à jour l'attribut de segmentation du contact
  const updateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ attributes: attributs[segment] }),
  })

  // Ajoute à la liste #7 si diaspora ou uemoa (déclenche l'automation B)
  if (segment !== 'investisseur') {
    await fetch(`https://api.brevo.com/v3/contacts/lists/${LIST_INTERESSES}/contacts/add`, {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: [email] }),
    })
  }

  if (!updateRes.ok && updateRes.status !== 204) {
    return res.status(500).json({ error: 'Erreur mise à jour contact' })
  }

  return res.status(200).json({ ok: true })
}
