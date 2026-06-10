import { PROBLEMES } from '../data.js'

export default function Probleme() {
  return (
    <section className="section probleme" id="probleme">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Le constat</span>
          <h2>Ton argent perd de la valeur pendant que tu hésites</h2>
          <p>
            Pendant que ton épargne dort à 1,5 %, des entreprises africaines solides versent
            chaque année des dividendes bien supérieurs. Voici ce qui te bloque.
          </p>
        </div>

        <div className="probleme-grid">
          {PROBLEMES.map((p, i) => (
            <div className="card probleme-card" key={p.titre}>
              <div className="idx">0{i + 1}</div>
              <h3>{p.titre}</h3>
              <p>{p.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
