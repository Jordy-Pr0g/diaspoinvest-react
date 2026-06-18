import { useEffect, useState } from 'react'
import { LIENS } from '../data.js'

const NAV_LINKS = [
  { href: '#marche',      label: 'Cours du jour' },
  { href: '#calculateur', label: 'Simulateur' },
  { href: '#avis',        label: 'Avis' },
  { href: '#pricing',     label: 'Tarifs' },
  { href: '#faq',         label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="container">
        <a href="#top" className="brand" aria-label="DiaspoInvest — accueil">
          <img src="/logo-512.png" alt="" className="brand-mark" aria-hidden="true" />
          Diaspo<span className="dot">Invest</span>
        </a>

        <nav className="nav-menu-links">
          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </div>
        </nav>

        <div className="nav-cta">
          <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer">
            Commencer
          </a>
        </div>

        {/* Hamburger — mobile uniquement */}
        <button
          className="hamburger"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Drawer mobile */}
      <div className={`mobile-drawer${open ? ' open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <nav>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a
            className="btn btn-or mobile-drawer-cta"
            href={LIENS.pack}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Commencer
          </a>
        </nav>
      </div>
    </header>
  )
}
