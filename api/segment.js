// Vercel serverless function — ajoute un contact à la liste #7 (Intéressés) après segmentation J+16
const BREVO_API_KEY = process.env.BREVO_API_KEY
const LIST_INTERESSES = 7

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
