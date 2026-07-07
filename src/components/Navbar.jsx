import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LIENS } from '../data.js'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const NAV = [
    { to: '/screener',  label: t('nav.screener')  },
    { to: '/portefeuille', label: t('nav.portefeuille') },
    { to: '/backtest',  label: t('nav.backtest')  },
    { to: '/fiscalite', label: t('nav.fiscalite') },
    { to: '/blog',      label: t('nav.blog')      },
    { to: '/a-propos',  label: t('nav.apropos')  },
  ]
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
            <Link to="/"
              style={{
                color: location.pathname === '/' ? activeColor : linkColor,
                fontWeight: location.pathname === '/' ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = activeColor }}
              onMouseLeave={e => { e.currentTarget.style.color = location.pathname === '/' ? activeColor : linkColor }}>
              {t('nav.accueil')}
            </Link>
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

        <div className="nav-cta" style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
            aria-label="Switch language"
            style={{
              background:'transparent', border:'1px solid rgba(241,245,249,0.25)', borderRadius:8,
              color:'rgba(241,245,249,0.75)', fontSize:'0.8rem', fontWeight:700, padding:'6px 10px',
              cursor:'pointer', letterSpacing:0.5,
            }}>
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
          <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            {t('nav.pack')}
          </a>
        </div>

        <button className="hamburger" aria-label={open ? t('nav.fermer') : t('nav.menu')}
          aria-expanded={open}
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}>
          <span /><span /><span />
        </button>
      </div>

      <div className={`mobile-drawer${open ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
        <nav>
          <Link to="/" onClick={() => setOpen(false)} style={{ color: location.pathname === '/' ? '#C9A84C' : undefined }}>{t('nav.accueil')}</Link>
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              style={{ color: isActive(to) ? '#C9A84C' : undefined }}>
              {label}
            </Link>
          ))}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
            style={{
              background:'transparent', border:'1px solid rgba(241,245,249,0.25)', borderRadius:8,
              color:'rgba(241,245,249,0.75)', fontSize:'0.85rem', fontWeight:700, padding:'8px 12px',
              cursor:'pointer', letterSpacing:0.5, marginTop:8, alignSelf:'flex-start',
            }}>
            {i18n.language === 'fr' ? 'English' : 'Français'}
          </button>
          <a className="btn btn-or mobile-drawer-cta" href={LIENS.pack}
            target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            {t('nav.voirPack')}
          </a>
        </nav>
      </div>
    </header>
  )
}
