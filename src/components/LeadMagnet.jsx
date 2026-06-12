import { useEffect, useRef, useState } from 'react'

const BREVO_FORM_URL =
  'https://6b93f7f2.sibforms.com/serve/MUIFAHddEUjyhDDhSdInrqsK-DyBcBnjiaSZgRV88hSUGPtgghZYcvU-2d773DtyJF1Nj09HsUh35Ios198TiwUjUOxkEYkt4QfH14wwzQDwejJ_hnWX4mDhuor5tJGZMffBKF_sbZLtDVfQykzYPifkh-HRpvzwAqdcXjH1C5QYBx7Mr1pJM2SzwnwBE5pQiArlhZaHLoKtWy9H_A=='
const RECAPTCHA_SITE_KEY = '6LenTBstAAAAAPEuIwKRWCur735YSZk2WZ1_Qk4W'

export default function LeadMagnet() {
  const [email, setEmail] = useState('')
  const [statut, setStatut] = useState('idle') // idle | loading | succes | erreur
  const captchaRef = useRef(null)
  const widgetIdRef = useRef(null)
  const emailRef = useRef('')

  useEffect(() => {
    // Charge le script reCAPTCHA une seule fois
    if (document.getElementById('recaptcha-script')) return
    const s = document.createElement('script')
    s.id = 'recaptcha-script'
    s.src = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=fr'
    s.async = true
    s.defer = true
    document.body.appendChild(s)
  }, [])

  async function envoyerVersBrevo(token) {
    try {
      const data = new FormData()
      data.append('EMAIL', emailRef.current)
      data.append('email_address_check', '') // anti-spam Brevo : doit rester vide
      data.append('locale', 'fr')
      data.append('g-recaptcha-response', token)

      const res = await fetch(`${BREVO_FORM_URL}?isAjax=1`, {
        method: 'POST',
        body: data,
      })

      setStatut(res.ok ? 'succes' : 'erreur')
    } catch {
      setStatut('erreur')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    if (!window.grecaptcha || !window.grecaptcha.render) {
      setStatut('erreur')
      return
    }
    setStatut('loading')
    emailRef.current = email

    // Captcha invisible : rendu au premier envoi, puis réutilisé
    if (widgetIdRef.current === null) {
      widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        size: 'invisible',
        callback: envoyerVersBrevo,
        'error-callback': () => setStatut('erreur'),
      })
    } else {
      window.grecaptcha.reset(widgetIdRef.current)
    }
    window.grecaptcha.execute(widgetIdRef.current)
  }

  return (
    <section className="section leadmagnet" id="leadmagnet">
      <div className="container">
        <div className="leadmagnet-inner">
          <div className="lm-left">
            <span className="eyebrow">Ressource gratuite</span>
            <h2>Top 5 actions BRVM — juin 2026</h2>
            <p>
              Reçois chaque semaine notre sélection des meilleures actions BRVM par rendement
              dividende, avec les signaux de marché clés — directement dans ta boîte mail.
            </p>
            <ul className="lm-points">
              <li>Cours et rendements actualisés chaque lundi</li>
              <li>Analyse en langage accessible, zéro jargon</li>
              <li>Rappels fiscaux pour les résidents en France</li>
            </ul>
            <p className="lm-disclaimer">
              Contenu éducatif · Non affilié à la BRVM ni au CREPMF · Désinscription à tout moment
            </p>
          </div>

          <div className="lm-right">
            {statut === 'succes' ? (
              <div className="lm-succes">
                <div className="lm-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>Tu es inscrit.</h3>
                <p>Vérifie ta boîte mail — la sélection de la semaine t'attend.</p>
              </div>
            ) : (
              <form className="lm-form" onSubmit={handleSubmit}>
                <label htmlFor="lm-email" className="lm-label">
                  Ton adresse email
                </label>
                <input
                  id="lm-email"
                  type="email"
                  required
                  placeholder="prenom@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="lm-input"
                  disabled={statut === 'loading'}
                />
                <button
                  type="submit"
                  className="btn btn-or lm-btn"
                  disabled={statut === 'loading'}
                >
                  {statut === 'loading' ? 'Inscription...' : 'Recevoir gratuitement'}
                </button>
                {statut === 'erreur' && (
                  <p className="lm-disclaimer" role="alert">
                    Oups, l'inscription a échoué. Réessaie dans un instant ou écris-nous :
                    contact.diaspoinvest@gmail.com
                  </p>
                )}
                <div ref={captchaRef} />
                <p className="lm-disclaimer">
                  Protégé par reCAPTCHA —{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                    Confidentialité
                  </a>{' '}
                  ·{' '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
                    Conditions
                  </a>{' '}
                  Google
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
