import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PRODUITS, PRODUITS_UEMOA } from '../data.js'

export default function Pricing() {
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'
  const [segment, setSegment] = useState('europe') // 'europe' | 'uemoa'

  const produits = segment === 'europe' ? PRODUITS : PRODUITS_UEMOA

  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('pricing.eyebrow')}</span>
          <h2>{t('pricing.titre')}</h2>
          <p>{t('pricing.garantie')}</p>
        </div>

        {/* Toggle segment */}
        <div className="segment-toggle" role="group" aria-label="Choose your profile">
          <button
            className={`seg-btn${segment === 'europe' ? ' active' : ''}`}
            onClick={() => setSegment('europe')}
          >
            {t('pricing.segmentEurope')}
          </button>
          <button
            className={`seg-btn${segment === 'uemoa' ? ' active' : ''}`}
            onClick={() => setSegment('uemoa')}
          >
            {t('pricing.segmentUemoa')}
          </button>
        </div>

        <div className="pricing-grid">
          {produits.map((p) => {
            const IMG = {
              guide:    '/produit-guide.jpg',
              guideUemoa: '/produit-guide.jpg',
              calculateur: '/produit-tracker.jpg',
              trackerUemoa: '/produit-tracker.jpg',
              pack:     '/produit-pack-europe.jpg',
              packUemoa: '/produit-pack-uemoa.jpg',
            }
            const img = IMG[p.id]
            const nom       = en ? t(`data.products.${p.id}.nom`) : p.nom
            const sousTitre = en ? t(`data.products.${p.id}.sousTitre`) : p.sousTitre
            const points    = en ? t(`data.products.${p.id}.points`, { returnObjects: true }) : p.points
            return (
            <div
              className={`plan${p.populaire ? ' featured' : ''}`}
              key={p.id}
              style={p.populaire
                ? { background: 'linear-gradient(160deg, #0D3B2E, #0A2219)', border: '2px solid rgba(201,168,76,0.5)', borderRadius: 20 }
                : { background: '#111C13', border: '1.5px solid #2A3E2D', borderRadius: 16 }
              }
            >
              {p.populaire && <div className="plan-tag">{t('pricing.leplusComplet')}</div>}
              {img && (
                <div className="plan-img-wrap">
                  <img src={img} alt={nom} className="plan-img" decoding="async" />
                </div>
              )}
              <h3>{nom}</h3>
              <div className="plan-sub">{sousTitre}</div>
              <div className="plan-price">
                {p.prixBarre && <s style={{ opacity: 0.45, fontSize: '0.75em', marginRight: 6 }}>{p.prixBarre}</s>}
                {p.prix}
              </div>

              <ul>
                {points.map((pt) => (
                  <li key={pt}>
                    <span className="check">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>

              {p.bientot ? (
                <button
                  className="btn btn-ghost"
                  disabled
                  style={{ opacity: 0.45, cursor: 'not-allowed', color: 'rgba(255,248,231,0.5)', borderColor: 'rgba(255,248,231,0.15)' }}
                >
                  {t('pricing.bientotDisponible')}
                </button>
              ) : (
                <a
                  className={`btn ${p.populaire ? 'btn-or' : 'btn-vert'}`}
                  href={p.lien}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('pricing.obtenir')} · {p.prix}
                </a>
              )}
              <p className="plan-garantie">
                {p.bientot ? t('pricing.disponibleProchainement') : t('pricing.garantie')}
              </p>
            </div>
          )})}
        </div>
      </div>
    </section>
  )
}
