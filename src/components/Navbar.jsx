import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LIENS } from '../data.js'

const NAV_LINKS = [
  { href: '#probleme',    label: 'Constat' },
  { href: '#marche',      label: 'La BRVM' },
  { href: '#calculateur', label: 'Simulateur' },
  { href: '#fiscalite',   label: 'Fiscalité' },
  { href: '#pricing',     label: 'Produits' },
]

// Pages avec fond sombre — liens en blanc
const DARK_PAGES = ['/screener', '/backtest']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const location = useLocation()

  const isBlog     = location.pathname.startsWith('/blog')
  const isScreener = location.pathname === '/screener'
  const isBacktest = location.pathname === '/backtest'
  const isDark     = DARK_PAGES.some(p => location.pathname.startsWith(p))
  const isHome     = location.pathname === '/'

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

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Couleurs selon contexte
  const linkColor   = scrolled ? 'var(--texte)' : isDark ? 'rgba(255,255,255,0.8)' : 'var(--fond-clair)'
  const linkHover   = 'var(--or)'
  const brandColor  = scrolled ? 'var(--vert)' : isDark ? '#fff' : 'var(--fond-clair)'
  const dotColor    = 'var(--or)'

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="container">

        {/* Logo */}
        <a href={isHome ? '#top' : '/'} className="brand" aria-label="DiaspoInvest — accueil"
          style={{ color: brandColor, transition: 'color 0.3s' }}>
          <img src="/logo-512.png" alt="" className="brand-mark" aria-hidden="true" />
          Diaspo<span className="dot" style={{ color: dotColor }}>Invest</span>
        </a>

        {/* Nav desktop */}
        <nav className="nav-menu-links">
          <div className="nav-links" style={{ gap: 36 }}>

            {/* Liens section (landing uniquement) */}
            {isHome && NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                style={{ color: linkColor, fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = linkHover}
                onMouseLeave={e => e.target.style.color = linkColor}>
                {l.label}
              </a>
            ))}

            {/* Lien Accueil sur pages non-home */}
            {!isHome && (
              <Link to="/"
                style={{ color: linkColor, fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = linkHover}
                onMouseLeave={e => e.target.style.color = linkColor}>
                Accueil
              </Link>
            )}

            {/* Screener — toujours visible */}
            <Link to="/screener"
              style={{
                color: isScreener ? 'var(--or)' : linkColor,
                fontWeight: isScreener ? 700 : 500,
                transition: 'color 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = linkHover }}
              onMouseLeave={e => { e.currentTarget.style.color = isScreener ? 'var(--or)' : linkColor }}>
              Screener
              {!isScreener && (
                <span style={{
                  fontSize: 9, fontWeight: 800, background: 'var(--or)',
                  color: '#0D2B1E', borderRadius: 4, padding: '1px 5px',
                  letterSpacing: 0.5, textTransform: 'uppercase',
                }}>NEW</span>
              )}
            </Link>

            {/* Blog */}
            <Link to="/blog"
              style={{
                color: isBlog ? 'var(--or)' : linkColor,
                fontWeight: isBlog ? 700 : 500,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.target.style.color = linkHover}
              onMouseLeave={e => e.target.style.color = isBlog ? 'var(--or)' : linkColor}>
              Blog
            </Link>
          </div>
        </nav>

        {/* CTA */}
        <div className="nav-cta">
          <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer">
            Commencer
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Drawer mobile */}
      <div className={`mobile-drawer${open ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
        <nav>
          {isHome && NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          {!isHome && <Link to="/" onClick={() => setOpen(false)}>Accueil</Link>}
          <Link to="/screener" onClick={() => setOpen(false)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Screener
            <span style={{
              fontSize: 9, fontWeight: 800, background: 'var(--or)', color: '#0D2B1E',
              borderRadius: 4, padding: '2px 6px', letterSpacing: 0.5,
            }}>NEW</span>
          </Link>
          <Link to="/backtest" onClick={() => setOpen(false)}>Backtest DCA</Link>
          <Link to="/blog" onClick={() => setOpen(false)}>Blog</Link>
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
