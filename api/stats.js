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
  const [pvJour, achJour, revJour] = await Promise.all([
    kvMget(store, dates.map(d => `pv:${d}`)),
    kvMget(store, dates.map(d => `ev:achat:${d}`)),
    kvMget(store, dates.map(d => `rev:${d}`)),
  ])
  dates.forEach((d, i) => jours.push({ date: d, pv: pvJour[i] || 0, achat: achJour[i] || 0, revenu: (revJour[i] || 0) / 100 }))

  const [pvTotal, quiz, achat, clic, revTotal] = await kvMget(store, [
    'pv:total', 'ev:quiz_termine:total', 'ev:achat:total', 'ev:clic_produit:total', 'rev:total',
  ])
  const ratio = quiz > 0 ? (achat / quiz) * 100 : null

  return {
    disponible: true,
    jours,
    totaux: { pv: pvTotal, quiz_termine: quiz, achat, clic_produit: clic, revenu: revTotal / 100 },
    ratio,
  }
}

// POST = enregistre une vue de page (corps vide) ou un event (corps {e:"..."}).
// Public (pas de secret) car appelé par le tracker du site. Dégrade si KV absent.
async function track(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const store = kvStore()
  if (!store) return res.status(200).json({ ok: false, reason: 'kv-non-configure' })

  let body = req.body || {}
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  // Reset admin (protégé par la clé) : remet à zéro totaux + 60 derniers jours.
  if (body && body.reset === true) {
    const secret = process.env.COCKPIT_SECRET
    if (secret && (req.headers['x-cockpit-secret'] || '') !== secret) return res.status(403).json({ ok: false })
    const keys = ['pv:total', 'ev:quiz_termine:total', 'ev:achat:total', 'ev:clic_produit:total', 'rev:total']
    for (let i = 0; i < 60; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      keys.push(`pv:${d}`, `ev:quiz_termine:${d}`, `ev:achat:${d}`, `ev:clic_produit:${d}`, `rev:${d}`)
    }
    try {
      await fetch(`${store.url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${store.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(keys.map(k => ['DEL', k])),
      })
    } catch { /* silencieux */ }
    return res.status(200).json({ ok: true, reset: true })
  }

  const e = (body.e || '').toString().slice(0, 40).replace(/[^a-z0-9_]/gi, '')
  const day = new Date().toISOString().slice(0, 10)
  const keys = e ? [`ev:${e}:${day}`, `ev:${e}:total`] : [`pv:${day}`, `pv:total`]
  // Montant d'un achat (en centimes) -> revenu cumulé
  const montant = Math.max(0, Math.round(Number(body.montant) || 0))
  try {
    await Promise.all([
      ...keys.map(k =>
        fetch(`${store.url}/incr/${encodeURIComponent(k)}`, { headers: { Authorization: `Bearer ${store.token}` } })
      ),
      ...(montant > 0 ? [`rev:${day}`, 'rev:total'].map(k =>
        fetch(`${store.url}/incrby/${encodeURIComponent(k)}/${montant}`, { headers: { Authorization: `Bearer ${store.token}` } })
      ) : []),
    ])
  } catch { /* silencieux : ne jamais casser la navigation */ }
  return res.status(200).json({ ok: true })
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Origin', '*'); return res.status(200).end() }
  if (req.method === 'POST') return track(req, res) // mesure d'audience (public)
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
