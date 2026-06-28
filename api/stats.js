// Vercel serverless function — agrège les indicateurs du projet pour le Tableau de bord.
// Protégé par COCKPIT_SECRET (même clé que le Cockpit). Source : Brevo (abonnés par liste).
// Les données BRVM et la boucle de conversion sont lues côté front (api/brvm-data + Plausible).

const LISTES = {
  3: 'Newsletter',
  7: 'Intéressés',
  6: 'Acheteurs',
}

function kvStore() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

async function kvMget(store, keys) {
  if (!keys.length) return []
  try {
    const r = await fetch(`${store.url}/mget/${keys.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${store.token}` },
    })
    if (!r.ok) return keys.map(() => null)
    const d = await r.json()
    return (d.result || []).map(v => (v == null ? 0 : Number(v)))
  } catch {
    return keys.map(() => 0)
  }
}

// Construit la mesure d'audience maison : 30 derniers jours + totaux + ratio
async function buildAnalytics() {
  const store = kvStore()
  if (!store) return { disponible: false }

  const jours = []
  const dates = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dates.push(d)
  }
  const pvJour = await kvMget(store, dates.map(d => `pv:${d}`))
  dates.forEach((d, i) => jours.push({ date: d, pv: pvJour[i] || 0 }))

  const [pvTotal, quiz, achat, clic] = await kvMget(store, [
    'pv:total', 'ev:quiz_termine:total', 'ev:achat:total', 'ev:clic_produit:total',
  ])
  const ratio = quiz > 0 ? (achat / quiz) * 100 : null

  return {
    disponible: true,
    jours,
    totaux: { pv: pvTotal, quiz_termine: quiz, achat, clic_produit: clic },
    ratio,
  }
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

    const analytics = await buildAnalytics()

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    return res.status(200).json({
      genere_le: new Date().toISOString(),
      brevo: { listes, totalContacts },
      analytics,
    })
  } catch (e) {
    return res.status(502).json({ error: 'Brevo injoignable : ' + e.message })
  }
}
