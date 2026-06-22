import { Link } from 'react-router-dom'

const OR = '#D4AF37'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#060E09', color: '#fff', textAlign: 'center', padding: '0 24px',
    }}>
      <div style={{
        fontFamily: 'DM Mono, monospace', fontSize: '6rem', fontWeight: 900,
        color: OR, lineHeight: 1, marginBottom: 16, opacity: 0.8,
      }}>404</div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>
        Cette page n'existe pas
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 380, lineHeight: 1.7, marginBottom: 36 }}>
        Peut-être que l'URL a changé, ou que le lien est cassé.
        Pendant ce temps, le BRVM Composite continue de grimper.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" style={{
          padding: '12px 28px', background: OR, borderRadius: 10,
          color: '#0D2B1E', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem',
        }}>
          Retour à l'accueil
        </Link>
        <Link to="/blog" style={{
          padding: '12px 28px', border: `1px solid rgba(255,255,255,0.15)`,
          borderRadius: 10, color: 'rgba(255,255,255,0.7)',
          fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem',
        }}>
          Lire le blog
        </Link>
      </div>
    </div>
  )
}
