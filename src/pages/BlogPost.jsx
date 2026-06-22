import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { marked } from 'marked'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const OR = '#D4AF37'

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
  const autres = ARTICLES.filter(a => a.slug !== currentSlug).slice(0, 3)
  if (autres.length === 0) return null
  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #1E2E21' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
        À lire aussi
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {autres.map(a => (
          <Link key={a.slug} to={`/blog/${a.slug}`} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 18px', background: '#0F1A12', border: '1px solid #1E2E21',
            borderRadius: 12, textDecoration: 'none', gap: 12,
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = OR + '50'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2E21'}
          >
            <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>{a.titre}</span>
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
  const [modal, setModal] = useState(null)
  const [content, setContent] = useState('')

  const article = ARTICLES.find((a) => a.slug === slug)

  useEffect(() => {
    if (!article) return
    article.file().then((mod) => {
      const rawHtml = marked.parse(mod.default)
      setContent(processHtml(rawHtml))
    })
    document.title = `${article.titre} — DiaspoInvest`
    document.querySelector('meta[name="description"]')?.setAttribute('content', article.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', article.titre)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', article.description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://diaspoinvest.fr/blog/${article.slug}`)
    window.scrollTo(0, 0)
    return () => {
      document.title = 'DiaspoInvest — Investir sur la bourse africaine'
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'DiaspoInvest — Apprends à investir sur la BRVM depuis la France ou le continent.')
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'DiaspoInvest — Investir sur la bourse africaine')
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://diaspoinvest.fr/')
    }
  }, [slug])

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
            <Link to="/blog">← Tous les articles</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0 24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{article.date}</span>
            <span style={{ fontSize: 13, color: OR, fontWeight: 600 }}>· {article.lecture} de lecture</span>
          </div>

          <article
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <ShareButtons titre={article.titre} slug={slug} />
          <ArticlesLies currentSlug={slug} />

          <div className="blog-post-nav" style={{ marginTop: 40 }}>
            {prev && (
              <Link to={`/blog/${prev.slug}`} className="blog-post-nav-prev">
                <span>Article précédent</span>
                <strong>{prev.titre}</strong>
              </Link>
            )}
            {next && (
              <Link to={`/blog/${next.slug}`} className="blog-post-nav-next">
                <span>Article suivant</span>
                <strong>{next.titre}</strong>
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
