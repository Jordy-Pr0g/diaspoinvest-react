import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

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
    window.scrollTo(0, 0)
  }, [slug])

  if (!article) return <Navigate to="/blog" replace />

  const idx = ARTICLES.findIndex((a) => a.slug === slug)
  const prev = ARTICLES[idx - 1] || null
  const next = ARTICLES[idx + 1] || null

  return (
    <>
      <Navbar />
      <main className="blog-post">
        <div className="container">
          <div className="blog-post-back">
            <Link to="/blog">← Tous les articles</Link>
          </div>

          <article
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <div className="blog-post-nav">
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
