// Vercel serverless function — proxy d'inscription newsletter.
// 1) Vérifie le reCAPTCHA avec NOTRE clé secrète (côté serveur).
// 2) Si humain confirmé → ajoute le contact via l'API Brevo (pas le formulaire).
// Avantages : fiable, documenté, et le navigateur ne parle qu'à notre domaine
// (les bloqueurs de pub ne voient jamais Brevo).

const LISTE_NEWSLETTER = 3 // "Newsletter DiaspoInvest"

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, captchaToken } = req.body || {}
  if (!email || !captchaToken) {
    return res.status(400).json({ success: false, error: 'email et captchaToken requis' })
  }

  // 1) Vérification du captcha avec Google (notre clé secrète)
  try {
    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET || '',
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

  // 2) Humain confirmé → ajout du contact via l'API Brevo
  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY || '',
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
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
