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

export default function BlogPost() {
  const { slug } = useParams()
  const [modal, setModal] = useState(null)
  const [content, setContent] = useState('')

  const article = ARTICLES.find((a) => a.slug === slug)

  useEffect(() => {
    if (!article) return
    article.file().then((mod) => {
      const html = marked.parse(mod.default)
      setContent(html)
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
