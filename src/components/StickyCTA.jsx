import { LIENS } from '../data.js'

// Barre fixe affichée en bas — mobile uniquement (cf. App.css @media max-width: 860px).
export default function StickyCTA() {
  return (
    <div className="sticky-cta">
      <div className="sc-price">
        <s style={{ opacity: 0.45, fontSize: '0.8em', marginRight: 4 }}>34,99 €</s> 19,99 €<small>Pack Complet · Guide + Tracker</small>
      </div>
      <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer">
        Obtenir le Pack
      </a>
    </div>
  )
}
