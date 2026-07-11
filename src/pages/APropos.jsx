import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeta } from '../hooks/useMeta.js'

const OR   = '#C9A84C'
const GRIS = 'rgba(232,238,246,0.5)'

export default function APropos() {
  const { t } = useTranslation()
  const paragraphs = t('pages.apropos.paragraphs', { returnObjects: true })
  useMeta({
    title: 'À propos — DiaspoInvest par Jordan Djiokap',
    description: 'DiaspoInvest est un projet éducatif indépendant créé par Jordan Djiokap, étudiant en Finance à l\'INSEEC Paris, pour aider la diaspora africaine à investir sur la BRVM.',
    url: 'https://diaspoinvest.fr/a-propos',
  })

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D1525 0%, #131E30 100%)', paddingTop: 80 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px 24px 96px' }}>

          <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            {t('pages.retourAccueil')}
          </Link>

          <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 10 }}>
            {t('pages.apropos.eyebrow')}
          </span>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: '#E8EEF6', lineHeight: 1.1, marginBottom: 56 }}>
            DiaspoInvest
          </h1>

          <div className="apropos-prose">

            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            <div style={{
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: 14,
              padding: '24px 28px',
              margin: '40px 0',
            }}>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(232,238,246,0.75)', fontSize: '1.05rem', lineHeight: 1.75 }}>
                {t('pages.apropos.quote')}
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 13, color: OR, fontWeight: 700 }}>
                {t('pages.apropos.quoteAuthor')}
              </p>
            </div>

            <p>
              {t('pages.apropos.contactPrefix')} <a href="mailto:contact@diaspoinvest.fr" style={{ color: OR, fontWeight: 600 }}>contact@diaspoinvest.fr</a>.
            </p>

          </div>

        </div>
      </main>
      <Footer />

      <style>{`
        .apropos-prose p {
          font-size: 1.05rem;
          color: rgba(232,238,246,0.68);
          line-height: 1.85;
          margin-bottom: 22px;
        }
        .apropos-prose p:last-child { margin-bottom: 0; }
        .apropos-prose a:hover { opacity: 0.75; }
      `}</style>
    </>
  )
}
