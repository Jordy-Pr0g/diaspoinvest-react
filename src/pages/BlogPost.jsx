import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { marked } from 'marked'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const OR = '#C9A84C'

// Événement analytics Plausible (sans cookie)
const fireEvent = (name, props) => {
  try { if (typeof window !== 'undefined' && window.plausible) window.plausible(name, props ? { props } : undefined) } catch {}
}

// CTA produit contextuel par article. Pitch honnête, fidèle à ce que le produit fait vraiment (data.js).
const GUM = {
  guideEurope: 'https://diaspoinvest.gumroad.com/l/oxxzda',
  guideUemoa: 'https://diaspoinvest.gumroad.com/l/dpqvqo',
  tracker: 'https://diaspoinvest.gumroad.com/l/tocir',
}
const GUIDE_EU = { nom: 'Guide PDF Diaspora', prix: '14,99 €', lien: GUM.guideEurope }
const GUIDE_UE = { nom: 'Guide PDF Résident', prix: '14,99 €', lien: GUM.guideUemoa }
const TRACKER = { nom: 'Tracker Dashboard', prix: '19,99 €', lien: GUM.tracker }
const CTA_BY_SLUG = {
  'investir-brvm-depuis-france': { ...GUIDE_EU, pitch: "Tu sais que c'est possible. Le Guide te montre comment ouvrir ton compte à distance et le déclarer en France, pas à pas." },
  'investir-brvm-zone-uemoa': { ...GUIDE_UE, pitch: "Pour passer à l'action depuis ton pays : ouvrir ton compte chez une SGI locale et gérer la fiscalité UEMOA, expliqué simplement." },
  'erreurs-debutant-brvm': { ...GUIDE_EU, pitch: "Pour éviter ces erreurs dès le départ : une méthode claire pour comprendre la bourse et bien démarrer." },
  'indices-brvm': { ...TRACKER, pitch: "Pour avoir les 47 actions regroupées par secteur et suivre ton portefeuille dans la durée." },
  'ouvrir-compte-sgi-depuis-etranger': { ...GUIDE_EU, pitch: "Pour ouvrir ton compte sans tâtonner : les étapes à distance et la fiscalité expliquées de A à Z." },
  'dividendes-sonatel-2025': { ...TRACKER, pitch: "Pour suivre tes dividendes et projeter tes versements sur 30 ans, action par action." },
  'brvm-vs-livret-a': { ...TRACKER, pitch: "Pour chiffrer ta propre stratégie : suivi de portefeuille et simulation de tes versements sur le long terme." },
  'fiscalite-dividendes-brvm-uemoa': { ...GUIDE_UE, pitch: "Pour tout comprendre de la fiscalité depuis ton pays, sans mauvaise surprise." },
  'declarer-compte-brvm-impots-france': { ...GUIDE_EU, pitch: "Pour déclarer sans stress : la fiscalité française et le formulaire 3916 expliqués pas à pas." },
  'sgi-frais-brvm': { ...TRACKER, pitch: "Pour garder un œil sur tes frais et ton portefeuille mois après mois." },
  'brvm-vs-pea-etf': { ...GUIDE_EU, pitch: "Pour investir concrètement sur la BRVM, en complément de ton PEA et de tes ETF." },
  'analyser-action-brvm': { ...TRACKER, pitch: "Pour avoir les 47 actions par secteur sous la main et suivre tes titres dans la durée." },
  'juger-cours-action-brvm': { ...TRACKER, pitch: "Pour suivre tes titres et leurs secteurs, et simuler tes versements sur 30 ans." },
  'lire-compte-resultat': { ...TRACKER, pitch: "Pour suivre tes titres par secteur et garder le fil de ton portefeuille." },
  'bourses-africaines-panorama': { ...GUIDE_EU, pitch: "Pour te lancer concrètement sur la BRVM : comprendre, ouvrir un compte et démarrer." },
}
const CTA_DEFAULT = { ...GUIDE_EU, pitch: "Pour aller plus loin et passer à l'action sur la BRVM, étape par étape." }

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

          {(() => {
            const c = CTA_BY_SLUG[slug] || CTA_DEFAULT
            return (
              <a
                href={c.lien}
                target="_blank"
                rel="noreferrer"
                className="blog-cta"
                onClick={() => fireEvent('clic_produit', { produit: c.nom, lieu: 'article', article: slug })}
              >
                <div className="blog-cta-text">
                  <span className="blog-cta-eyebrow">Pour aller plus loin</span>
                  <span className="blog-cta-pitch">{c.pitch}</span>
                </div>
                <span className="blog-cta-btn">{c.nom} · {c.prix} →</span>
              </a>
            )
          })()}

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
