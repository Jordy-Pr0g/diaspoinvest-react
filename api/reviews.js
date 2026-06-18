/**
 * DiaspoInvest — API Avis clients
 * GET  /api/reviews → liste des avis approuvés
 * POST /api/reviews → soumettre un nouvel avis
 *
 * Stockage : data/reviews.json dans le dépôt GitHub (via GitHub API)
 * Répondre à un avis : éditer reviews.json directement sur GitHub,
 * ajouter le champ "reponse": "..." sur l'objet concerné.
 *
 * Variables Vercel requises : GITHUB_TOKEN (déjà présent)
 */

const REPO   = 'Jordy-Pr0g/diaspoinvest-react'
const FILE   = 'data/reviews.json'
const BRANCH = 'main'
const RAW    = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE}`

async function getReviews() {
  const r = await fetch(`${RAW}?t=${Date.now()}`)
  if (!r.ok) return []
  return r.json()
}

async function saveReviews(reviews, token) {
  // Lire le SHA actuel du fichier (requis par l'API GitHub pour les updates)
  const metaRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE}`,
    { headers: { Authorization: `token ${token}`, 'User-Agent': 'DiaspoInvest' } }
  )
  const meta = await metaRes.json()
  const sha  = meta.sha

  const content = Buffer.from(JSON.stringify(reviews, null, 2)).toString('base64')

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiaspoInvest',
      },
      body: JSON.stringify({
        message: `avis: nouvel avis de ${new Date().toISOString().slice(0,10)}`,
        content,
        sha,
        branch: BRANCH,
      }),
    }
  )
  return res.ok
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET — retourner les avis (sans les emails)
  if (req.method === 'GET') {
    try {
      const reviews = await getReviews()
      const safe = reviews.map(({ email: _email, ...rest }) => rest) // email non exposé
      res.setHeader('Cache-Control', 'no-store')
      return res.json(safe)
    } catch {
      return res.json([])
    }
  }

  // POST — soumettre un avis
  if (req.method === 'POST') {
    const { prenom, email, ville, pays, produit, texte, etoiles } = req.body || {}

    if (!email || !texte || !etoiles) {
      return res.status(400).json({ error: 'Champs obligatoires : email, texte, etoiles' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide' })
    }
    if (etoiles < 1 || etoiles > 5) {
      return res.status(400).json({ error: 'etoiles doit être entre 1 et 5' })
    }
    if (texte.length < 10 || texte.length > 800) {
      return res.status(400).json({ error: 'Avis entre 10 et 800 caractères' })
    }

    const token = (process.env.GITHUB_TOKEN || '').trim()
    if (!token) {
      return res.status(500).json({ error: 'Token GitHub manquant' })
    }

    try {
      const reviews = await getReviews()
      const nouvelAvis = {
        id:      Date.now(),
        prenom:  (prenom || '').trim().slice(0, 40),
        email:   email.trim().slice(0, 100), // stocké, jamais retourné en GET
        ville:   (pays || ville || '').trim().slice(0, 50),
        produit: (produit || '').trim().slice(0, 60),
        texte:   texte.trim().slice(0, 800),
        etoiles: Math.min(5, Math.max(1, parseInt(etoiles))),
        date:    new Date().toISOString().slice(0, 10),
        reponse: null, // Jordan ajoute manuellement dans GitHub
      }
      reviews.unshift(nouvelAvis) // les plus récents en premier
      const ok = await saveReviews(reviews, token)
      if (!ok) return res.status(502).json({ error: 'Erreur sauvegarde GitHub' })
      return res.status(201).json({ success: true })
    } catch (e) {
      return res.status(502).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
