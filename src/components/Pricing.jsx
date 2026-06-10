import { useEffect, useMemo, useState } from 'react'
import { PRODUITS } from '../data.js'

// Compte à rebours : fenêtre glissante de 3 jours à partir du chargement de la page.
function useCountdown(durationMs) {
  const [deadline] = useState(() => Date.now() + durationMs)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return useMemo(() => {
    const diff = Math.max(0, deadline - now)
    const s = Math.floor(diff / 1000)
    return {
      jours: Math.floor(s / 86400),
      heures: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      secondes: s % 60,
    }
  }, [deadline, now])
}

const pad = (n) => String(n).padStart(2, '0')

export default function Pricing() {
  const cd = useCountdown(3 * 24 * 60 * 60 * 1000)

  const cells = [
    { num: pad(cd.jours), lbl: 'Jours' },
    { num: pad(cd.heures), lbl: 'Heures' },
    { num: pad(cd.minutes), lbl: 'Min' },
    { num: pad(cd.secondes), lbl: 'Sec' },
  ]

  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Tarifs de lancement</span>
          <h2>Choisis ta formule</h2>
          <p>Offre de lancement — profite des prix de départ avant la fin du compte à rebours.</p>
        </div>

        <div className="countdown" aria-label="Compte à rebours de l’offre">
          {cells.map((c) => (
            <div className="cd-cell" key={c.lbl}>
              <div className="cd-num">{c.num}</div>
              <div className="cd-lbl">{c.lbl}</div>
            </div>
          ))}
        </div>

        <div className="pricing-grid">
          {PRODUITS.map((p) => {
            const indisponible = p.lien === '#'
            return (
              <div className={`plan${p.populaire ? ' featured' : ''}`} key={p.id}>
                {p.populaire && <div className="plan-tag">Le plus complet</div>}
                <h3>{p.nom}</h3>
                <div className="plan-sub">{p.sousTitre}</div>
                <div className="plan-price">{p.prix}</div>

                <ul>
                  {p.points.map((pt) => (
                    <li key={pt}>
                      <span className="check">✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>

                {indisponible ? (
                  <>
                    <button className="btn btn-ghost" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                      Bientôt disponible
                    </button>
                    <div className="plan-soon">🔄 Création en cours sur Gumroad</div>
                  </>
                ) : (
                  <a
                    className={`btn ${p.populaire ? 'btn-or' : 'btn-vert'}`}
                    href={p.lien}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Obtenir — {p.prix}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
