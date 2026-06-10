import { LIENS } from '../data.js'

// Barre fixe affichée en bas — mobile uniquement (cf. App.css @media max-width: 860px).
export default function StickyCTA() {
  return (
    <div className="sticky-cta">
      <div className="sc-price">
        9,99 €<small>Guide PDF · accès immédiat</small>
      </div>
      <a className="btn btn-or" href={LIENS.guide} target="_blank" rel="noreferrer">
        Obtenir le guide
      </a>
    </div>
  )
}
