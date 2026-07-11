import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ARTICLES } from '../data/articles.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

export default function BlogIndex() {
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'
  return (
    <>
      <Navbar />
      <main className="blog-index">
        <div className="container">
          <div className="blog-header">
            <h1>{t('pages.blogIndex.titre')}</h1>
            <p>{t('pages.blogIndex.sousTitre')}</p>
          </div>

          <div className="blog-grid">
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="blog-card"
              >
                <div className="blog-card-meta">
                  <span className="blog-card-date">{en ? (article.date_en || article.date) : article.date}</span>
                  <span className="blog-card-lecture">{article.lecture} {en ? t('data.blogPreview.lecture') : 'de lecture'}</span>
                </div>
                <h2 className="blog-card-titre">{en ? (article.titre_en || article.titre) : article.titre}</h2>
                <p className="blog-card-desc">{en ? (article.description_en || article.description) : article.description}</p>
                <span className="blog-card-lire">{en ? t('data.blogPreview.lireLarticle') : "Lire l'article →"}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
