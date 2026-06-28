// Vercel serverless function — agrège les indicateurs du projet pour le Tableau de bord.
// Protégé par COCKPIT_SECRET (même clé que le Cockpit). Source : Brevo (abonnés par liste).
// Les données BRVM et la boucle de conversion sont lues côté front (api/brvm-data + Plausible).

const LISTES = {
  3: 'Newsletter',
  7: 'Intéressés',
  6: 'Acheteurs',
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.COCKPIT_SECRET
  const authHeader = req.headers['x-cockpit-secret'] || ''
  if (secret && authHeader !== secret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  const apiKey = (process.env.BREVO_API_KEY || '').trim()
  if (!apiKey) return res.status(500).json({ error: 'BREVO_API_KEY non configurée.' })

  const headers = { 'api-key': apiKey, accept: 'application/json' }

  try {
    // Toutes les listes en un appel (totalSubscribers fourni par Brevo)
    const r = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0', { headers })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return res.status(502).json({ error: err.message || `Brevo erreur ${r.status}` })
    }
    const data = await r.json()
    const byId = {}
    for (const l of data.lists || []) byId[l.id] = l.totalSubscribers || 0

    const listes = Object.entries(LISTES).map(([id, nom]) => ({
      id: Number(id),
      nom,
      abonnes: byId[id] || 0,
    }))

    // Total contacts (tous, dédupliqués) — appel léger limit=1 pour le compteur
    let totalContacts = null
    try {
      const rc = await fetch('https://api.brevo.com/v3/contacts?limit=1&offset=0', { headers })
      if (rc.ok) { const dc = await rc.json(); totalContacts = dc.count ?? null }
    } catch { /* best-effort */ }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({
      genere_le: new Date().toISOString(),
      brevo: { listes, totalContacts },
    })
  } catch (e) {
    return res.status(502).json({ error: 'Brevo injoignable : ' + e.message })
  }
}
