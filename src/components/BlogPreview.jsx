import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ARTICLES } from '../data/articles.js'
const OR   = '#D4AF37'
const CARD = '#0F1A12'
const BDR  = '#1E2E21'

export default function BlogPreview() {
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'
  const articles = ARTICLES.slice(0, 3)

  return (
    <section style={{ padding: '64px 0', borderTop: `1px solid ${BDR}` }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            color: OR, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
          }}>{en ? t('data.blogPreview.eyebrow') : 'Ressources gratuites'}</span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginTop: 8, marginBottom: 8 }}>
            {en ? t('data.blogPreview.titre') : 'Nos derniers articles'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto' }}>
            {en ? t('data.blogPreview.sousTitre') : "Des chiffres réels, pas de jargon. Tout ce qu'il faut savoir pour investir sur la BRVM."}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20, marginBottom: 36,
        }}>
          {articles.map(a => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: CARD, border: `1px solid ${BDR}`,
                borderRadius: 14, padding: '22px 20px',
                height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = OR + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = BDR}
              >
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{en ? (a.date_en || a.date) : a.date}</span>
                  <span style={{ fontSize: 11, color: OR }}>· {a.lecture} {en ? t('data.blogPreview.lecture') : 'de lecture'}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 10, color: '#fff', flex: 1 }}>
                  {en ? (a.titre_en || a.titre) : a.titre}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
                  {(en ? (a.description_en || a.description) : a.description).slice(0, 110)}…
                </p>
                <div style={{ marginTop: 16, fontSize: '0.82rem', color: OR, fontWeight: 600 }}>
                  {en ? t('data.blogPreview.lireLarticle') : "Lire l'article →"}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-block', padding: '10px 28px',
              border: `1px solid ${OR}50`, borderRadius: 8,
              color: OR, fontSize: '0.9rem', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {en ? t('data.blogPreview.voirTous') : 'Voir tous les articles →'}
          </Link>
        </div>
      </div>
    </section>
  )
}
