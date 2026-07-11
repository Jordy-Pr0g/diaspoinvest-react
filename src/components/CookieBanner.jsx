import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const CLE = 'diaspoinvest_cookies_acceptes'

export default function CookieBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CLE)) setVisible(true)
  }, [])

  function accepter() {
    localStorage.setItem(CLE, '1')
    setVisible(false)
  }

  function refuser() {
    localStorage.setItem(CLE, '0')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label={t('cookie.aria')}>
      <div className="cookie-inner">
        <p>
          {t('cookie.texte')}{' '}
          <button className="linklike" onClick={() => window.open('https://plausible.io/data-policy', '_blank')}>
            {t('cookie.enSavoirPlus')}
          </button>
        </p>
        <div className="cookie-actions">
          <button className="btn btn-or cookie-btn" onClick={accepter}>
            {t('cookie.accepter')}
          </button>
          <button className="btn btn-ghost cookie-btn cookie-refuser" onClick={refuser}>
            {t('cookie.refuser')}
          </button>
        </div>
      </div>
    </div>
  )
}
