import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const RECAPTCHA_SITE_KEY = '6Le7Dx0tAAAAACRiDmsAqfZgUkSq_OKJnflk1DsR'

export default function LeadMagnet() {
  const { t, i18n } = useTranslation()
  const [prenom, setPrenom] = useState('')
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
        hl: i18n.language === 'en' ? 'en' : 'fr',
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
      s.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=${i18n.language === 'en' ? 'en' : 'fr'}`
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
        body: JSON.stringify({ email, prenom, captchaToken: token }),
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
          <div className="lm-left" data-sr>
            <span className="eyebrow">{t('leadmagnet.eyebrow')}</span>
            <h2>{t('leadmagnet.titre')}</h2>
            <p>
              {t('leadmagnet.intro')}
            </p>
            <ul className="lm-points">
              <li>{t('leadmagnet.point1')}</li>
              <li>{t('leadmagnet.point2')}</li>
              <li>{t('leadmagnet.point3')}</li>
            </ul>
            <p className="lm-disclaimer">
              {t('leadmagnet.disclaimer')}
            </p>
          </div>

          <div className="lm-right" data-sr>
            {statut === 'succes' ? (
              <div className="lm-succes">
                <div className="lm-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>{t('leadmagnet.succesTitre')}</h3>
                <p>{t('leadmagnet.succesTexte')}</p>
              </div>
            ) : (
              <form className="lm-form" onSubmit={handleSubmit}>
                <label htmlFor="lm-prenom" className="lm-label">
                  {t('leadmagnet.labelPrenom')}
                </label>
                <input
                  id="lm-prenom"
                  type="text"
                  required
                  placeholder={t('leadmagnet.placeholderPrenom')}
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="lm-input"
                  disabled={statut === 'loading'}
                />
                <label htmlFor="lm-email" className="lm-label" style={{ marginTop: '10px' }}>
                  {t('leadmagnet.labelEmail')}
                </label>
                <input
                  id="lm-email"
                  type="email"
                  required
                  placeholder={t('leadmagnet.placeholderEmail')}
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
                  {statut === 'loading' ? t('leadmagnet.btnLoading') : t('leadmagnet.btn')}
                </button>
                {statut === 'captcha' && (
                  <p className="lm-disclaimer" role="alert">
                    {t('leadmagnet.errCaptcha')}
                  </p>
                )}
                {statut === 'erreur' && (
                  <p className="lm-disclaimer" role="alert">
                    {t('leadmagnet.errEchec')}
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
