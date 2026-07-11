import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useMeta } from '../hooks/useMeta.js'

const OR   = '#C9A84C'
const GRIS = 'rgba(241,245,249,0.5)'
const BDR  = 'rgba(255,255,255,0.08)'

export default function Guides() {
  const { t } = useTranslation()
  const OUTILS = [
    { to: '/screener',  titre: t('pages.guides.screenerTitre'), desc: t('pages.guides.screenerDesc'), cta: t('pages.guides.screenerCta') },
    { to: '/backtest',  titre: t('pages.guides.backtestTitre'), desc: t('pages.guides.backtestDesc'), cta: t('pages.guides.backtestCta') },
    { to: '/fiscalite', titre: t('pages.guides.fiscalTitre'),   desc: t('pages.guides.fiscalDesc'),   cta: t('pages.guides.fiscalCta')   },
    { to: '/blog',      titre: t('pages.guides.blogTitre'),     desc: t('pages.guides.blogDesc'),     cta: t('pages.guides.blogCta')     },
  ]
  useMeta({
    title: 'Outils gratuits BRVM — Screener, Backtest, Fiscalité | DiaspoInvest',
    description: 'Tous les outils gratuits pour investir sur la BRVM : screener temps réel, simulateur DCA, calculateur fiscal et articles éducatifs.',
    url: 'https://diaspoinvest.fr/guides',
  })
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D1525 0%, #131E30 100%)', paddingTop: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

          <div style={{ marginBottom: 48 }}>
            <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              {t('pages.retourAccueil')}
            </Link>
            <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>
              {t('pages.guides.eyebrow')}
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#F1F5F9', fontFamily: 'Playfair Display,serif', margin: 0, lineHeight: 1.2 }}>
              {t('pages.guides.titre')}
            </h1>
            <p style={{ fontSize: 15, color: GRIS, marginTop: 12, lineHeight: 1.6 }}>
              {t('pages.guides.sousTitre')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {OUTILS.map(o => (
              <Link key={o.to} to={o.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${BDR}`,
                  borderRadius: 16,
                  padding: '28px 28px 24px',
                  transition: 'all .2s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'
                    e.currentTarget.style.background = 'rgba(201,168,76,0.05)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = BDR
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div style={{ width: 32, height: 3, background: OR, borderRadius: 2, marginBottom: 4 }} />
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Playfair Display,serif' }}>{o.titre}</div>
                  <div style={{ fontSize: 14, color: GRIS, lineHeight: 1.6, flex: 1 }}>{o.desc}</div>
                  <div style={{ fontSize: 13, color: OR, fontWeight: 600, marginTop: 4 }}>{o.cta}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
