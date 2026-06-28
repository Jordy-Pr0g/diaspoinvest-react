// Mesure d'audience maison (sans cookie), stockée dans Vercel KV (Redis Upstash).
// Reçoit une vue de page (corps vide) ou un event (corps {e:"quiz_termine"}).
// Incrémente des compteurs journaliers + totaux. Dégrade en silence si KV non configuré.
//
// Variables d'env (injectées automatiquement par Vercel quand tu crées un store KV) :
//   KV_REST_API_URL / KV_REST_API_TOKEN  (ou UPSTASH_REDIS_REST_URL / _TOKEN)

function kv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

export default async function handler(req, res) {
  // CORS basique (appelé en first-party, mais on reste tolérant)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const store = kv()
  if (!store) return res.status(200).json({ ok: false, reason: 'kv-non-configure' })

  let body = req.body || {}
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const e = (body.e || '').toString().slice(0, 40).replace(/[^a-z0-9_]/gi, '')
  const day = new Date().toISOString().slice(0, 10)

  const keys = e ? [`ev:${e}:${day}`, `ev:${e}:total`] : [`pv:${day}`, `pv:total`]
  try {
    await Promise.all(keys.map(k =>
      fetch(`${store.url}/incr/${encodeURIComponent(k)}`, { headers: { Authorization: `Bearer ${store.token}` } })
    ))
  } catch { /* silencieux : ne jamais casser la navigation */ }

  return res.status(200).json({ ok: true })
}
