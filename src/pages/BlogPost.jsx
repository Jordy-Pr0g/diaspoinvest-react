import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { marked } from 'marked'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const OR = '#C9A84C'

// Photo d'en-tete par article (fichiers dans public/img/blog, source Pexels, licence libre)
const HERO_ALT = {
  'investir-brvm-depuis-france': 'Le Plateau, quartier des affaires d’Abidjan',
  'investir-brvm-zone-uemoa': 'Vue aerienne d’Abidjan',
  'bourses-africaines-panorama': 'Skyline de Johannesburg au coucher du soleil',
  'calendrier-dividendes-brvm-2026': 'Piles de pieces de monnaie',
  'dividendes-sonatel-2025': 'Pieces alignees en croissance',
  'fiscalite-dividendes-brvm-uemoa': 'Calculatrice et documents fiscaux',
  'declarer-compte-brvm-impots-france': 'Dossier d’impots et calculatrice',
  'lire-compte-resultat': 'Documents financiers et loupe',
  'analyser-action-brvm': 'Graphiques boursiers sur ecran',
  'juger-cours-action-brvm': 'Courbe de marche en gros plan',
  'indices-brvm': 'Graphique de donnees sur moniteur',
  'brvm-vs-pea-etf': 'Ecran de suivi des marches',
  'brvm-vs-livret-a': 'Piece deposee dans une tirelire',
  'sgi-frais-brvm': 'Documents comptables et smartphone',
  'ouvrir-compte-sgi-depuis-etranger': 'Personne travaillant sur ordinateur portable',
  'erreurs-debutant-brvm': 'Loupe sur des donnees de marche',
}

// Événement analytics Plausible (sans cookie)
const fireEvent = (name, props) => {
  try { if (typeof window !== 'undefined' && window.plausible) window.plausible(name, props ? { props } : undefined) } catch {}
}

// CTA produit contextuel par article. Le pitch et le nom/prix sont dans i18n (blogPost.*),
// seuls les liens Gumroad et l'association slug -> produit restent ici (données).
const CTA_LINK = {
  guideEurope: 'https://pay.hotmart.com/F106625297S',
  guideUemoa: 'https://pay.hotmart.com/S106627946N',
  tracker: 'https://pay.hotmart.com/I106628667V',
}
const CTA_PRODUCT_BY_SLUG = {
  'investir-brvm-depuis-france': 'guideEurope',
  'investir-brvm-zone-uemoa': 'guideUemoa',
  'erreurs-debutant-brvm': 'guideEurope',
  'indices-brvm': 'tracker',
  'ouvrir-compte-sgi-depuis-etranger': 'guideEurope',
  'dividendes-sonatel-2025': 'tracker',
  'brvm-vs-livret-a': 'tracker',
  'fiscalite-dividendes-brvm-uemoa': 'guideUemoa',
  'declarer-compte-brvm-impots-france': 'guideEurope',
  'sgi-frais-brvm': 'tracker',
  'brvm-vs-pea-etf': 'guideEurope',
  'analyser-action-brvm': 'tracker',
  'juger-cours-action-brvm': 'tracker',
  'lire-compte-resultat': 'tracker',
  'bourses-africaines-panorama': 'guideEurope',
}

function ProgressBar() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 3, background: 'rgba(255,255,255,0.06)',
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: `linear-gradient(90deg, ${OR}, #e8c46a)`,
        transition: 'width 0.1s linear',
      }} />
    </div>
  )
}

function ShareButtons({ titre, slug }) {
  const url = `https://diaspoinvest.fr/blog/${slug}`
  const text = encodeURIComponent(`${titre} — DiaspoInvest`)
  const urlEnc = encodeURIComponent(url)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '32px 0 24px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Partager</span>
      <a href={`https://wa.me/?text=${text}%20${urlEnc}`} target="_blank" rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
          background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
          color: '#25d366', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
        WhatsApp
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${urlEnc}`} target="_blank" rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
          background: 'rgba(0,119,181,0.12)', border: '1px solid rgba(0,119,181,0.3)',
          color: '#0077b5', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
        LinkedIn
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${urlEnc}`} target="_blank" rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
        X / Twitter
      </a>
    </div>
  )
}

function ArticlesLies({ currentSlug }) {
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'
  const autres = ARTICLES.filter(a => a.slug !== currentSlug).slice(0, 3)
  if (autres.length === 0) return null
  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'rgba(241,245,249,0.7)', fontWeight: 700 }}>
        {t('blogPost.aLireAussi')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {autres.map(a => (
          <Link key={a.slug} to={`/blog/${a.slug}`} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, textDecoration: 'none', gap: 12,
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>{en ? (a.titre_en || a.titre) : a.titre}</span>
            <span style={{ fontSize: 11, color: OR, whiteSpace: 'nowrap', fontWeight: 700 }}>{a.lecture} →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[ -⁯⸀-⹿\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s+/g, '-')
}

function processHtml(rawHtml) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(rawHtml, 'text/html')

  // Supprimer toutes les lignes horizontales
  doc.querySelectorAll('hr').forEach((hr) => hr.remove())

  // Ajouter des IDs sur tous les H2
  const headings = doc.querySelectorAll('h2')
  headings.forEach((h2) => {
    h2.id = slugify(h2.textContent)
  })

  // Transformer le sommaire en liens cliquables
  // On cherche un <p> contenant "Sommaire" suivi d'un <ol>
  doc.querySelectorAll('p').forEach((p) => {
    if (p.textContent.trim() === 'Sommaire') {
      p.classList.add('sommaire-titre')
      const ol = p.nextElementSibling
      if (ol && ol.tagName === 'OL') {
        ol.classList.add('sommaire-liste')
        ol.querySelectorAll('li').forEach((li) => {
          const text = li.textContent.trim()
          // Trouver le H2 correspondant par similarité de texte
          let bestH2 = null
          let bestScore = 0
          headings.forEach((h2) => {
            const h2text = h2.textContent.trim().toLowerCase()
            const litext = text.toLowerCase()
            // Score basé sur les mots en commun
            const liWords = litext.split(/\s+/)
            const matches = liWords.filter((w) => w.length > 3 && h2text.includes(w)).length
            if (matches > bestScore) {
              bestScore = matches
              bestH2 = h2
            }
          })
          if (bestH2 && bestScore > 0) {
            const a = doc.createElement('a')
            a.href = '#' + bestH2.id
            a.textContent = text
            li.textContent = ''
            li.appendChild(a)
          }
        })
      }
    }
  })

  return doc.body.innerHTML
}

export default function BlogPost() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'
  const [modal, setModal] = useState(null)
  const [content, setContent] = useState('')

  const article = ARTICLES.find((a) => a.slug === slug)
  const titre = article ? (en ? (article.titre_en || article.titre) : article.titre) : ''
  const description = article ? (en ? (article.description_en || article.description) : article.description) : ''
  const dateAff = article ? (en ? (article.date_en || article.date) : article.date) : ''
  // Corps de l'article en anglais si une version EN existe, sinon repli sur le français.
  const bodyIsFrenchFallback = en && !article?.file_en

  useEffect(() => {
    if (!article) return
    const loader = (en && article.file_en) ? article.file_en : article.file
    loader().then((mod) => {
      const rawHtml = marked.parse(mod.default)
      setContent(processHtml(rawHtml))
    })
    document.title = `${titre} — DiaspoInvest`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', titre)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://diaspoinvest.fr/blog/${article.slug}`)
    window.scrollTo(0, 0)
    return () => {
      document.title = 'DiaspoInvest — Investir sur la bourse africaine'
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'DiaspoInvest — Apprends à investir sur la BRVM depuis la France ou le continent.')
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'DiaspoInvest — Investir sur la bourse africaine')
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://diaspoinvest.fr/')
    }
  }, [slug, en])

  if (!article) return <Navigate to="/blog" replace />

  const idx = ARTICLES.findIndex((a) => a.slug === slug)
  const prev = ARTICLES[idx - 1] || null
  const next = ARTICLES[idx + 1] || null

  return (
    <>
      <ProgressBar />
      <Navbar />
      <main className="blog-post">
        <div className="container">
          <div className="blog-post-back">
            <Link to="/blog">{t('blogPost.back')}</Link>
          </div>

          {HERO_ALT[slug] && (
            <img
              src={`/img/blog/${slug}.webp`}
              alt={HERO_ALT[slug]}
              style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', borderRadius: 16, margin: '8px 0 4px', display: 'block' }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0 24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{dateAff}</span>
            <span style={{ fontSize: 13, color: OR, fontWeight: 600 }}>· {article.lecture} {en ? t('data.blogPreview.lecture') : 'de lecture'}</span>
          </div>

          <div style={{
            background: 'rgba(201,168,76,0.07)',
            border: '1px solid rgba(201,168,76,0.22)',
            borderRadius: 12,
            padding: '14px 18px',
            margin: '0 0 32px',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'rgba(232,238,246,0.62)',
          }}>
            <strong style={{ color: OR }}>{t('blogPost.noteStrong')}</strong>{' '}
            <Trans
              i18nKey="blogPost.notice"
              values={{ date: dateAff }}
              components={[
                <a href="https://www.brvm.org" target="_blank" rel="noreferrer" style={{ color: OR }} />,
                <a href="https://www.impots.gouv.fr" target="_blank" rel="noreferrer" style={{ color: OR }} />,
              ]}
            />
          </div>

          {bodyIsFrenchFallback && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '12px 16px', margin: '0 0 28px',
              fontSize: 13, color: 'rgba(232,238,246,0.55)', fontStyle: 'italic',
            }}>
              {t('blogPost.bodyInFrench')}
            </div>
          )}

          <article
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {(() => {
            const pkey = CTA_PRODUCT_BY_SLUG[slug] || 'guideEurope'
            const nom = t(`blogPost.products.${pkey}.nom`)
            const prix = t(`blogPost.products.${pkey}.prix`)
            const lien = CTA_LINK[pkey]
            const pitch = t(`blogPost.pitches.${slug}`, { defaultValue: t('blogPost.pitchDefault') })
            return (
              <a
                href={lien}
                target="_blank"
                rel="noreferrer"
                className="blog-cta"
                onClick={() => fireEvent('clic_produit', { produit: nom, lieu: 'article', article: slug })}
              >
                <div className="blog-cta-text">
                  <span className="blog-cta-eyebrow">{t('blogPost.ctaEyebrow')}</span>
                  <span className="blog-cta-pitch">{pitch}</span>
                </div>
                <span className="blog-cta-btn">{nom} · {prix} →</span>
              </a>
            )
          })()}

          <ShareButtons titre={titre} slug={slug} />
          <ArticlesLies currentSlug={slug} />

          <div className="blog-post-nav" style={{ marginTop: 40 }}>
            {prev && (
              <Link to={`/blog/${prev.slug}`} className="blog-post-nav-prev">
                <span>{t('blogPost.articlePrecedent')}</span>
                <strong>{en ? (prev.titre_en || prev.titre) : prev.titre}</strong>
              </Link>
            )}
            {next && (
              <Link to={`/blog/${next.slug}`} className="blog-post-nav-next">
                <span>{t('blogPost.articleSuivant')}</span>
                <strong>{en ? (next.titre_en || next.titre) : next.titre}</strong>
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
