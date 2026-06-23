export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Protection : seul le Cockpit (avec le secret) peut appeler cet endpoint
  const secret = process.env.COCKPIT_SECRET
  if (secret) {
    const provided = req.headers['x-cockpit-secret'] || ''
    if (provided !== secret) return res.status(403).json({ error: 'Accès refusé.' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Clé API manquante côté serveur.' })

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
