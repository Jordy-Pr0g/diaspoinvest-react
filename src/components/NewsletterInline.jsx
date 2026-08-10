import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Bloc de capture email COMPACT (email seul) pour la fin des articles de blog.
// Réutilise la même logique que LeadMagnet : reCAPTCHA + POST /api/newsletter (liste Brevo #3).
const RECAPTCHA_SITE_KEY = '6Le7Dx0tAAAAACRiDmsAqfZgUkSq_OKJnflk1DsR'
const OR = '#C9A84C'

export default function NewsletterInline() {
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [statut, setStatut] = useState('idle') // idle | loading | succes | erreur | captcha
  const captchaRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    function renderCaptcha() {
      if (widgetIdRef.current !== null || !captchaRef.current) return
      widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        hl: i18n.language === 'en' ? 'en' : 'fr',
      })
    }
    if (window.grecaptcha && window.grecaptcha.render) { renderCaptcha(); return }
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
    if (!token) { setStatut('captcha'); return }
    setStatut('loading')
    try {
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
    <div style={{
      margin: '44px 0', padding: '26px 24px', borderRadius: 16,
      background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)',
    }}>
      {statut === 'succes' ? (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '1.15rem' }}>{t('leadmagnet.succesTitre')}</h3>
          <p style={{ color: 'rgba(232,238,246,0.7)', margin: '0 0 14px', fontSize: 14 }}>{t('leadmagnet.succesTexte')}</p>
          <a className="btn btn-or" href="/guide-7-erreurs-brvm.pdf" download style={{ display: 'inline-block' }}>
            {t('leadmagnet.telecharger')}
          </a>
        </div>
      ) : (
        <>
          <span style={{ fontSize: 12, color: OR, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('newsletterInline.eyebrow')}
          </span>
          <h3 style={{ color: '#fff', margin: '8px 0 6px', fontSize: '1.25rem', lineHeight: 1.3 }}>
            {t('newsletterInline.titre')}
          </h3>
          <p style={{ color: 'rgba(232,238,246,0.65)', margin: '0 0 16px', fontSize: 14, lineHeight: 1.55 }}>
            {t('newsletterInline.intro')}
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="email"
              required
              placeholder={t('leadmagnet.placeholderEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={statut === 'loading'}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15,
              }}
            />
            <div ref={captchaRef} />
            <button type="submit" className="btn btn-or" disabled={statut === 'loading'} style={{ width: '100%' }}>
              {statut === 'loading' ? t('leadmagnet.btnLoading') : t('leadmagnet.btn')}
            </button>
            {statut === 'captcha' && (
              <p style={{ color: '#e0876e', fontSize: 13, margin: 0 }} role="alert">{t('leadmagnet.errCaptcha')}</p>
            )}
            {statut === 'erreur' && (
              <p style={{ color: '#e0876e', fontSize: 13, margin: 0 }} role="alert">{t('leadmagnet.errEchec')}</p>
            )}
          </form>
          <p style={{ color: 'rgba(232,238,246,0.4)', margin: '12px 0 0', fontSize: 11 }}>
            {t('leadmagnet.disclaimer')}
          </p>
        </>
      )}
    </div>
  )
}
