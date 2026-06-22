import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LIENS } from '../data.js'

const NAV = [
  { to: '/screener',  label: 'Screener'  },
  { to: '/backtest',  label: 'Backtest'  },
  { to: '/fiscalite', label: 'Fiscalité' },
  { to: '/blog',      label: 'Blog'      },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

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

  useEffect(() => { setOpen(false) }, [location.pathname])

  const linkColor = 'rgba(241,245,249,0.75)'
  const activeColor = '#C9A84C'
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}
      style={{ background: scrolled ? undefined : 'transparent' }}>
      <div className="container">
        <a href={isHome ? '#top' : '/'} className="brand" aria-label="DiaspoInvest"
          style={{ color: '#F1F5F9' }}>
          <img src="/logo-512.png" alt="" className="brand-mark" aria-hidden="true" />
          Diaspo<span className="dot" style={{ color: '#C9A84C' }}>Invest</span>
        </a>

        <nav className="nav-menu-links">
          <div className="nav-links" style={{ gap: 28 }}>
            {!isHome && (
              <Link to="/" style={{ color: linkColor, fontWeight: 500, fontSize: '0.9rem' }}
                onMouseEnter={e => e.target.style.color = activeColor}
                onMouseLeave={e => e.target.style.color = linkColor}>
                Accueil
              </Link>
            )}
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to}
                style={{
                  color: isActive(to) ? activeColor : linkColor,
                  fontWeight: isActive(to) ? 700 : 500,
                  fontSize: '0.9rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = activeColor }}
                onMouseLeave={e => { e.currentTarget.style.color = isActive(to) ? activeColor : linkColor }}>
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="nav-cta">
          <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            Pack
          </a>
        </div>

        <button className="hamburger" aria-label={open ? 'Fermer' : 'Menu'}
          aria-expanded={open}
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}>
          <span /><span /><span />
        </button>
      </div>

      <div className={`mobile-drawer${open ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
        <nav>
          {!isHome && <Link to="/" onClick={() => setOpen(false)}>Accueil</Link>}
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              style={{ color: isActive(to) ? '#C9A84C' : undefined }}>
              {label}
            </Link>
          ))}
          <a className="btn btn-or mobile-drawer-cta" href={LIENS.pack}
            target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            Voir le Pack
          </a>
        </nav>
      </div>
    </header>
  )
}
