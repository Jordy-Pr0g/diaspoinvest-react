// Vercel serverless function — inscription newsletter depuis le quiz d'accueil.
// 1) Inscrit l'email à la liste Newsletter de façon fiable (jamais bloquée).
// 2) Enregistre les réponses du quiz dans des attributs dédiés, en best-effort :
//    si les attributs n'existent pas encore côté Brevo, l'inscription reste valide.
// Attributs volontairement préfixés QUIZ_ pour ne PAS écraser l'attribut SEGMENT
// utilisé par /api/segment.js (automations existantes).

const LISTE_NEWSLETTER = 3 // "Newsletter DiaspoInvest"

const ALLOWED_ORIGINS = [
  'https://diaspoinvest.fr',
  'https://www.diaspoinvest.fr',
]

function isAllowedOrigin(req) {
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.some((o) => referer.startsWith(o))
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden' })
  }

  const { email, experience, goal, location } = req.body || {}
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Email invalide' })
  }

  const apiKey = (process.env.BREVO_API_KEY || '').trim()
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'API key not configured' })
  }

  // 1) Inscription fiable à la newsletter (sans attribut susceptible d'échouer)
  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [LISTE_NEWSLETTER],
        updateEnabled: true, // déjà inscrit : on met à jour, pas d'erreur
      }),
    })

    if (r.status !== 201 && r.status !== 204) {
      const data = await r.json().catch(() => ({}))
      if (data.code !== 'duplicate_parameter') {
        return res.status(400).json({ success: false, error: data.message || 'Erreur Brevo' })
      }
    }
  } catch {
    return res.status(502).json({ success: false, error: 'Brevo injoignable.' })
  }

  // 2) Best-effort : on enregistre les réponses du quiz dans des attributs dédiés.
  //    Un échec ici (attribut non créé côté Brevo) ne doit pas casser l'inscription.
  try {
    await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attributes: {
          QUIZ_NIVEAU: experience || '',   // beginner | junior | advanced
          QUIZ_OBJECTIF: goal || '',       // learn | analyze | optimize
          QUIZ_LIEU: location || '',       // uemoa | afrique | monde
        },
      }),
    })
  } catch {
    // ignoré volontairement : l'inscription est déjà confirmée
  }

  return res.status(200).json({ success: true })
}
