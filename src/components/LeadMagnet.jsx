import { useEffect, useRef, useState } from 'react'

const RECAPTCHA_SITE_KEY = '6Le7Dx0tAAAAACRiDmsAqfZgUkSq_OKJnflk1DsR'

export default function LeadMagnet() {
  const [email, setEmail] = useState('')
  const [statut, setStatut] = useState('idle') // idle | loading | succes | erreur | captcha
  const captchaRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    // Charge le script reCAPTCHA puis affiche la case "Je ne suis pas un robot"
    function renderCaptcha() {
      if (widgetIdRef.current !== null || !captchaRef.current) return
      widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        hl: 'fr',
      })
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      renderCaptcha()
      return
    }

    window.onRecaptchaLoad = renderCaptcha
    if (!document.getElementById('recaptcha-script')) {
      const s = document.createElement('script')
      s.id = 'recaptcha-script'
      s.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=fr'
      s.async = true
      s.defer = true
      document.body.appendChild(s)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return

    const token =
      window.grecaptcha && widgetIdRef.current !== null
        ? window.grecaptcha.getResponse(widgetIdRef.current)
        : ''
    if (!token) {
      setStatut('captcha')
      return
    }

    setStatut('loading')
    try {
      // Passe par notre propre domaine (/api/newsletter) : les bloqueurs de pub
      // qui filtrent sibforms.com ne voient jamais la requête
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken: token }),
      })

      if (res.ok) {
        setStatut('succes')
      } else {
        window.grecaptcha.reset(widgetIdRef.current)
        setStatut('erreur')
      }
    } catch {
      window.grecaptcha.reset(widgetIdRef.current)
      setStatut('erreur')
    }
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
                <div ref={captchaRef} style={{ margin: '12px 0' }} />
                <button
                  type="submit"
                  className="btn btn-or lm-btn"
                  disabled={statut === 'loading'}
                >
                  {statut === 'loading' ? 'Inscription...' : 'Recevoir gratuitement'}
                </button>
                {statut === 'captcha' && (
                  <p className="lm-disclaimer" role="alert">
                    Coche d'abord la case « Je ne suis pas un robot » ci-dessus.
                  </p>
                )}
                {statut === 'erreur' && (
                  <p className="lm-disclaimer" role="alert">
                    Oups, l'inscription a échoué. Réessaie dans un instant ou écris-nous :
                    contact@diaspoinvest.fr
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
