// Vercel serverless function — proxy d'inscription newsletter.
// 1) Vérifie l'origine + le reCAPTCHA avec NOTRE clé secrète (côté serveur).
// 2) Si humain confirmé → ajoute le contact via l'API Brevo (pas le formulaire).
// Avantages : fiable, documenté, et le navigateur ne parle qu'à notre domaine
// (les bloqueurs de pub ne voient jamais Brevo).

const LISTE_NEWSLETTER = 3 // "Newsletter DiaspoInvest"

const ALLOWED_ORIGINS = [
  'https://diaspoinvest.fr',
  'https://www.diaspoinvest.fr',
]

function isAllowedOrigin(req) {
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.some(o => referer.startsWith(o))
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden' })
  }

  const { email, prenom, captchaToken } = req.body || {}
  if (!email || !captchaToken) {
    return res.status(400).json({ success: false, error: 'email et captchaToken requis' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Email invalide' })
  }

  // Token interne pour les inscriptions depuis le calculateur (stocké en variable d'env)
  const internalToken = process.env.INTERNAL_API_TOKEN || ''
  const isInternalCall = internalToken && captchaToken === internalToken

  // 1) Vérification du captcha avec Google (notre clé secrète)
  if (!isInternalCall) {
    try {
      const params = new URLSearchParams({
        secret: (process.env.RECAPTCHA_SECRET || '').trim(),
        response: captchaToken,
      })
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
      const verify = await verifyRes.json()
      if (!verify.success) {
        return res.status(400).json({ success: false, error: 'Captcha invalide, réessaie.' })
      }
    } catch {
      return res.status(502).json({ success: false, error: 'Vérification captcha indisponible.' })
    }
  }

  // Sanitize prenom
  const prenomSafe = typeof prenom === 'string' ? prenom.trim().slice(0, 50) : undefined

  // 2) Humain confirmé → ajout du contact via l'API Brevo
  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': (process.env.BREVO_API_KEY || '').trim(),
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: prenomSafe ? { PRENOM: prenomSafe } : undefined,
        listIds: [LISTE_NEWSLETTER],
        updateEnabled: true, // si déjà inscrit, ne bloque pas
      }),
    })

    // 201 = créé, 204 = mis à jour : succès dans les deux cas
    if (brevoRes.status === 201 || brevoRes.status === 204) {
      return res.status(200).json({ success: true })
    }

    const data = await brevoRes.json().catch(() => ({}))
    // "Contact already exist" → on considère que c'est OK (déjà abonné)
    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true, already: true })
    }
    return res.status(400).json({ success: false, error: data.message || 'Erreur Brevo' })
  } catch {
    return res.status(502).json({ success: false, error: 'Brevo injoignable.' })
  }
}
