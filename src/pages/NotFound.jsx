import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const OR = '#D4AF37'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#06140E', color: '#fff', textAlign: 'center', padding: '0 24px',
    }}>
      <div style={{
        fontFamily: 'DM Mono, monospace', fontSize: '6rem', fontWeight: 900,
        color: OR, lineHeight: 1, marginBottom: 16, opacity: 0.8,
      }}>404</div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>
        {t('pages.notFound.titre')}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.7, marginBottom: 36 }}>
        {t('pages.notFound.texte')}
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" style={{
          padding: '12px 28px', background: OR, borderRadius: 10,
          color: '#0D2B1E', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem',
        }}>
          {t('pages.notFound.accueil')}
        </Link>
        <Link to="/blog" style={{
          padding: '12px 28px', border: `1px solid rgba(255,255,255,0.15)`,
          borderRadius: 10, color: 'rgba(255,255,255,0.7)',
          fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem',
        }}>
          {t('pages.notFound.blog')}
        </Link>
      </div>
    </div>
  )
}
