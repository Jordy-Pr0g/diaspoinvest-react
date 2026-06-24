import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { marked } from 'marked'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const OR = '#C9A84C'

// Illustrations d'en-tête (SVG inline, thème du site, aucune image externe)
const HERO = {
  skyline: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131E30"/><stop offset="1" stop-color="#0D1525"/></linearGradient></defs><rect width="600" height="180" fill="url(#hs)"/><circle cx="500" cy="55" r="34" fill="#C9A84C" opacity="0.18"/><circle cx="500" cy="55" r="20" fill="#C9A84C" opacity="0.35"/><g fill="#1d2c44"><rect x="40" y="96" width="46" height="84"/><rect x="98" y="70" width="40" height="110"/><rect x="150" y="110" width="34" height="70"/><rect x="196" y="58" width="48" height="122"/><rect x="256" y="92" width="38" height="88"/><rect x="306" y="120" width="30" height="60"/><rect x="348" y="78" width="44" height="102"/><rect x="404" y="104" width="34" height="76"/><rect x="450" y="64" width="46" height="116"/><rect x="508" y="100" width="40" height="80"/><rect x="560" y="118" width="30" height="62"/></g><g fill="#C9A84C" opacity="0.55"><rect x="208" y="72" width="6" height="6"/><rect x="222" y="72" width="6" height="6"/><rect x="208" y="88" width="6" height="6"/><rect x="222" y="88" width="6" height="6"/><rect x="462" y="80" width="6" height="6"/><rect x="476" y="80" width="6" height="6"/><rect x="462" y="96" width="6" height="6"/></g><rect x="0" y="176" width="600" height="4" fill="#C9A84C" opacity="0.5"/></svg>`,
  growth: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131E30"/><stop offset="1" stop-color="#0D1525"/></linearGradient></defs><rect width="600" height="180" fill="url(#hg)"/><g fill="#1d2c44"><rect x="120" y="120" width="34" height="40"/><rect x="172" y="96" width="34" height="64"/><rect x="224" y="104" width="34" height="56"/><rect x="276" y="72" width="34" height="88"/><rect x="328" y="84" width="34" height="76"/><rect x="380" y="50" width="34" height="110"/></g><polyline points="137,128 189,104 241,112 293,80 345,92 397,58 449,40" fill="none" stroke="#2ECC8B" stroke-width="3"/><circle cx="449" cy="40" r="6" fill="#2ECC8B"/><path d="M438 56 L449 40 L460 56 Z" fill="#2ECC8B"/><rect x="0" y="160" width="600" height="2" fill="#C9A84C" opacity="0.4"/></svg>`,
  coins: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131E30"/><stop offset="1" stop-color="#0D1525"/></linearGradient></defs><rect width="600" height="180" fill="url(#hc)"/><g><g transform="translate(150,0)"><ellipse cx="0" cy="140" rx="48" ry="14" fill="#C9A84C"/><rect x="-48" y="116" width="96" height="24" fill="#C9A84C"/><ellipse cx="0" cy="116" rx="48" ry="14" fill="#E8C46A"/><ellipse cx="0" cy="104" rx="48" ry="14" fill="#C9A84C"/><rect x="-48" y="92" width="96" height="12" fill="#C9A84C"/><ellipse cx="0" cy="92" rx="48" ry="14" fill="#E8C46A"/></g><g transform="translate(280,0)"><ellipse cx="0" cy="150" rx="44" ry="13" fill="#C9A84C"/><rect x="-44" y="120" width="88" height="30" fill="#C9A84C"/><ellipse cx="0" cy="120" rx="44" ry="13" fill="#E8C46A"/></g><text x="400" y="100" fill="#2ECC8B" font-family="Arial" font-size="40" font-weight="bold">FCFA</text></g></svg>`,
  tax: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131E30"/><stop offset="1" stop-color="#0D1525"/></linearGradient></defs><rect width="600" height="180" fill="url(#ht)"/><g transform="translate(210,30)"><rect x="0" y="0" width="120" height="130" rx="6" fill="#e8eef6" opacity="0.92"/><rect x="0" y="0" width="120" height="130" rx="6" fill="none" stroke="#C9A84C" stroke-width="2"/><rect x="16" y="20" width="60" height="7" rx="3" fill="#94a3b8"/><rect x="16" y="38" width="88" height="6" rx="3" fill="#cbd5e1"/><rect x="16" y="52" width="88" height="6" rx="3" fill="#cbd5e1"/><rect x="16" y="66" width="64" height="6" rx="3" fill="#cbd5e1"/><rect x="16" y="86" width="40" height="20" rx="3" fill="#C9A84C" opacity="0.3"/></g><circle cx="360" cy="120" r="34" fill="#2ECC8B" opacity="0.9"/><text x="360" y="132" fill="#0D1525" font-family="Arial" font-size="30" font-weight="bold" text-anchor="middle">%</text></svg>`,
  compare: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hcp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131E30"/><stop offset="1" stop-color="#0D1525"/></linearGradient></defs><rect width="600" height="180" fill="url(#hcp)"/><line x1="300" y1="36" x2="300" y2="150" stroke="#C9A84C" stroke-width="4"/><polygon points="270,150 330,150 320,160 280,160" fill="#C9A84C"/><line x1="180" y1="60" x2="420" y2="60" stroke="#C9A84C" stroke-width="4"/><g><line x1="180" y1="60" x2="180" y2="92" stroke="#C9A84C" stroke-width="2"/><rect x="146" y="92" width="68" height="40" rx="6" fill="#2ECC8B" opacity="0.85"/></g><g><line x1="420" y1="60" x2="420" y2="80" stroke="#C9A84C" stroke-width="2"/><rect x="392" y="80" width="56" height="28" rx="6" fill="#C9A84C" opacity="0.7"/></g><circle cx="300" cy="36" r="7" fill="#C9A84C"/></svg>`,
  account: `<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131E30"/><stop offset="1" stop-color="#0D1525"/></linearGradient></defs><rect width="600" height="180" fill="url(#ha)"/><g transform="translate(200,52)"><rect x="0" y="0" width="170" height="100" rx="12" fill="#1d2c44" stroke="#C9A84C" stroke-width="2"/><rect x="0" y="22" width="170" height="16" fill="#C9A84C" opacity="0.35"/><rect x="16" y="56" width="60" height="8" rx="4" fill="#94a3b8"/><rect x="16" y="72" width="90" height="8" rx="4" fill="#64748b"/><circle cx="140" cy="74" r="14" fill="#2ECC8B"/><path d="M133 74 l5 5 l9 -11" fill="none" stroke="#0D1525" stroke-width="3"/></g></svg>`,
}
const SLUG_HERO = {
  'investir-brvm-depuis-france': 'skyline',
  'investir-brvm-zone-uemoa': 'skyline',
  'bourses-africaines-panorama': 'skyline',
  'analyser-action-brvm': 'growth',
  'juger-cours-action-brvm': 'growth',
  'brvm-vs-livret-a': 'growth',
  'dividendes-sonatel-2025': 'coins',
  'sgi-frais-brvm': 'coins',
  'fiscalite-dividendes-brvm-uemoa': 'tax',
  'declarer-compte-brvm-impots-france': 'tax',
  'lire-compte-resultat': 'tax',
  'brvm-vs-pea-etf': 'compare',
  'ouvrir-compte-sgi-depuis-etranger': 'account',
  'indices-brvm': 'growth',
  'erreurs-debutant-brvm': 'account',
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
  const autres = ARTICLES.filter(a => a.slug !== currentSlug).slice(0, 3)
  if (autres.length === 0) return null
  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'rgba(241,245,249,0.7)', fontWeight: 700 }}>
        À lire aussi
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

          <div className="blog-hero" dangerouslySetInnerHTML={{ __html: HERO[SLUG_HERO[slug]] || HERO.growth }} />

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
            <strong style={{ color: OR }}>À noter.</strong> Article publié le {article.date}.
            Les cours de bourse, taux de rendement et règles fiscales évoluent dans le temps :
            ces chiffres étaient exacts à la date de rédaction mais peuvent avoir changé depuis.
            Vérifie toujours l'information à jour auprès des sources officielles
            (<a href="https://www.brvm.org" target="_blank" rel="noreferrer" style={{ color: OR }}>brvm.org</a>,
            {' '}<a href="https://www.impots.gouv.fr" target="_blank" rel="noreferrer" style={{ color: OR }}>impots.gouv.fr</a>,
            {' '}ta SGI) avant toute décision. Contenu éducatif, qui ne constitue pas un conseil en investissement.
            Investir comporte un risque de perte en capital.
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
