import { useState, useEffect } from 'react'

const CLE = 'diaspoinvest_cookies_acceptes'

export default function CookieBanner() {
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
    <div className="cookie-banner" role="dialog" aria-label="Gestion des cookies">
      <div className="cookie-inner">
        <p>
          Ce site utilise Plausible Analytics, un outil sans cookie conforme RGPD, pour mesurer
          l'audience de façon anonyme. Aucune donnée personnelle n'est collectée.{' '}
          <button className="linklike" onClick={() => window.open('https://plausible.io/data-policy', '_blank')}>
            En savoir plus
          </button>
        </p>
        <div className="cookie-actions">
          <button className="btn btn-or cookie-btn" onClick={accepter}>
            Accepter
          </button>
          <button className="btn btn-ghost cookie-btn cookie-refuser" onClick={refuser}>
            Refuser
          </button>
        </div>
      </div>
    </div>
  )
}
