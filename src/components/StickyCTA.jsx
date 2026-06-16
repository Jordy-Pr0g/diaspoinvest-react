import { LIENS } from '../data.js'

// Barre fixe affichée en bas — mobile uniquement (cf. App.css @media max-width: 860px).
export default function StickyCTA() {
  return (
    <div className="sticky-cta">
      <div className="sc-price">
        29,99 €<small>Pack Complet · Guide + Tracker</small>
      </div>
      <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer">
        Obtenir le Pack
      </a>
    </div>
  )
}
