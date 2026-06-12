import { useEffect, useState } from 'react'
import { LIENS } from '../data.js'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <a href="#top" className="brand" aria-label="DiaspoInvest — accueil">
          <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0D3B2E" />
            <path
              d="M16 44 L26 30 L34 38 L48 20"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="48" cy="20" r="4" fill="#E8C46A" />
          </svg>
          Diaspo<span className="dot">Invest</span>
        </a>

        <nav className="nav-menu-links">
          <div className="nav-links">
            <a href="#probleme">Le constat</a>
            <a href="#solution">La méthode</a>
            <a href="#histoire">Notre histoire</a>
            <a href="#calculateur">Simulateur</a>
            <a href="#pricing">Tarifs</a>
            <a href="#faq">FAQ</a>
          </div>
        </nav>

        <div className="nav-cta">
          <a className="btn btn-or" href={LIENS.guide} target="_blank" rel="noreferrer">
            Obtenir le guide
          </a>
        </div>
      </div>
    </header>
  )
}
