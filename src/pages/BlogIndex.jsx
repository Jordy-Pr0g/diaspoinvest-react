import { Link } from 'react-router-dom'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useState } from 'react'

export default function BlogIndex() {
  const [modal, setModal] = useState(null)

  return (
    <>
      <Navbar />
      <main className="blog-index">
        <div className="container">
          <div className="blog-header">
            <h1>Le blog DiaspoInvest</h1>
            <p>Tout ce que tu dois savoir pour investir sur la BRVM depuis la diaspora. Des chiffres réels, pas de jargon.</p>
          </div>

          <div className="blog-grid">
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="blog-card"
              >
                <div className="blog-card-meta">
                  <span className="blog-card-date">{article.date}</span>
                  <span className="blog-card-lecture">{article.lecture} de lecture</span>
                </div>
                <h2 className="blog-card-titre">{article.titre}</h2>
                <p className="blog-card-desc">{article.description}</p>
                <span className="blog-card-lire">Lire l'article</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
