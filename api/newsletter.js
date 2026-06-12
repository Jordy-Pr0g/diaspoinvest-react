// Vercel serverless function — proxy d'inscription newsletter Brevo.
// Le navigateur du visiteur ne parle qu'à notre domaine : les bloqueurs de pub
// qui filtrent sibforms.com ne voient jamais passer la requête.
const BREVO_FORM_URL =
  'https://6b93f7f2.sibforms.com/serve/MUIFAHddEUjyhDDhSdInrqsK-DyBcBnjiaSZgRV88hSUGPtgghZYcvU-2d773DtyJF1Nj09HsUh35Ios198TiwUjUOxkEYkt4QfH14wwzQDwejJ_hnWX4mDhuor5tJGZMffBKF_sbZLtDVfQykzYPifkh-HRpvzwAqdcXjH1C5QYBx7Mr1pJM2SzwnwBE5pQiArlhZaHLoKtWy9H_A=='

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, captchaToken } = req.body || {}
  if (!email || !captchaToken) {
    return res.status(400).json({ success: false, error: 'email et captchaToken requis' })
  }

  const form = new URLSearchParams()
  form.append('EMAIL', email)
  form.append('email_address_check', '') // piège anti-bot Brevo : doit rester vide
  form.append('locale', 'fr')
  form.append('g-recaptcha-response', captchaToken)

  try {
    const brevoRes = await fetch(`${BREVO_FORM_URL}?isAjax=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const data = await brevoRes.json().catch(() => ({}))
    return res.status(brevoRes.ok ? 200 : 400).json({ success: brevoRes.ok, ...data })
  } catch {
    return res.status(502).json({ success: false, error: 'Brevo injoignable' })
  }
}
