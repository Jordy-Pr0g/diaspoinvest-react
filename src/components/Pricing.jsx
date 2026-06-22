import { useState } from 'react'
import { PRODUITS, PRODUITS_UEMOA } from '../data.js'

export default function Pricing() {
  const [segment, setSegment] = useState('europe') // 'europe' | 'uemoa'

  const produits = segment === 'europe' ? PRODUITS : PRODUITS_UEMOA

  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Tarifs de lancement</span>
          <h2>Les produits</h2>
          <p>Satisfait ou remboursé 14 jours.</p>
        </div>

        {/* Toggle segment */}
        <div className="segment-toggle" role="group" aria-label="Choisir ton profil">
          <button
            className={`seg-btn${segment === 'europe' ? ' active' : ''}`}
            onClick={() => setSegment('europe')}
          >
            Diaspora Europe
          </button>
          <button
            className={`seg-btn${segment === 'uemoa' ? ' active' : ''}`}
            onClick={() => setSegment('uemoa')}
          >
            Résident UEMOA
          </button>
        </div>

        <div className="pricing-grid">
          {produits.map((p) => {
            const IMG = {
              guide:    '/produit-guide.jpg',
              guideUemoa: '/produit-guide.jpg',
              calculateur: '/produit-tracker.jpg',
              trackerUemoa: '/produit-tracker.jpg',
              pack:     '/produit-pack.jpg',
              packUemoa: '/produit-pack.jpg',
            }
            const img = IMG[p.id]
            return (
            <div
              className={`plan${p.populaire ? ' featured' : ''}`}
              key={p.id}
              style={p.populaire
                ? { background: 'linear-gradient(160deg, #0D3B2E, #0A2219)', border: '2px solid rgba(201,168,76,0.5)', borderRadius: 20 }
                : { background: '#111C13', border: '1.5px solid #2A3E2D', borderRadius: 16 }
              }
            >
              {p.populaire && <div className="plan-tag">Le plus complet</div>}
              {img && (
                <div className="plan-img-wrap">
                  <img src={img} alt={p.nom} className="plan-img" loading="lazy" />
                </div>
              )}
              <h3>{p.nom}</h3>
              <div className="plan-sub">{p.sousTitre}</div>
              <div className="plan-price">
                {p.prixBarre && <s style={{ opacity: 0.45, fontSize: '0.75em', marginRight: 6 }}>{p.prixBarre}</s>}
                {p.prix}
              </div>

              <ul>
                {p.points.map((pt) => (
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
                  Bientôt disponible
                </button>
              ) : (
                <a
                  className={`btn ${p.populaire ? 'btn-or' : 'btn-vert'}`}
                  href={p.lien}
                  target="_blank"
                  rel="noreferrer"
                >
                  Obtenir · {p.prix}
                </a>
              )}
              <p className="plan-garantie">
                {p.bientot ? 'Disponible prochainement' : 'Satisfait ou remboursé 14 jours'}
              </p>
            </div>
          )})}
        </div>
      </div>
    </section>
  )
}
