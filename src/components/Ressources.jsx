import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RESSOURCES } from '../data.js'

// Section "Ressources gratuites" : remplace la section produits quand les ventes
// sont en pause. Reutilise volontairement les memes classes (.section .pricing,
// .pricing-grid, .plan) que la section produits pour garder EXACTEMENT la meme
// mise en page, les memes animations et la meme ambiance visuelle.
export default function Ressources() {
  const { t } = useTranslation()

  return (
    <section className="section pricing" id="ressources">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('ressources.eyebrow', 'Tout est gratuit')}</span>
          <h2>{t('ressources.titre', 'Les ressources DiaspoInvest')}</h2>
          <p>{t('ressources.sous', "Apprends, simule, suis le marché. Aucun compte, aucun paiement.")}</p>
        </div>

        <div className="pricing-grid">
          {RESSOURCES.map((r) => {
            const interne = r.href.startsWith('/')
            const contenu = (
              <>
                {r.populaire && <div className="plan-tag">{t('ressources.populaire', 'Commence ici')}</div>}
                <div className="plan-price" style={{ fontSize: '1.6rem' }}>{r.badge}</div>
                <h3>{r.nom}</h3>
                <div className="plan-sub">{r.sousTitre}</div>
                <ul>
                  {r.points.map((pt) => (
                    <li key={pt}><span className="check">✓</span>{pt}</li>
                  ))}
                </ul>
                <span className={`btn ${r.populaire ? 'btn-or' : 'btn-vert'}`} style={{ width: '100%' }}>
                  {r.cta}
                </span>
              </>
            )
            const style = r.populaire
              ? { background: 'linear-gradient(160deg, #0D3B2E, #0A2219)', border: '2px solid rgba(201,168,76,0.5)', borderRadius: 20, textDecoration: 'none' }
              : { background: '#111C13', border: '1.5px solid #2A3E2D', borderRadius: 16, textDecoration: 'none' }

            return interne ? (
              <Link className={`plan${r.populaire ? ' featured' : ''}`} key={r.id} to={r.href} style={style}>
                {contenu}
              </Link>
            ) : (
              <a className={`plan${r.populaire ? ' featured' : ''}`} key={r.id} href={r.href} style={style}>
                {contenu}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
