import { SOLUTIONS } from '../data.js'

const ICONS = ['📚', '📈', '🧮', '🧾', '🚀']

export default function Solution() {
  return (
    <section className="section solution" id="solution">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">La méthode DiaspoInvest</span>
          <h2>De zéro à ton premier investissement</h2>
          <p>
            Un parcours clair et concret, pensé pour les débutants — sans jargon, avec des
            chiffres réels de la BRVM.
          </p>
        </div>

        <div className="solution-grid">
          {SOLUTIONS.map((s, i) => (
            <div className="solution-card" key={s.titre}>
              <div className="ic" aria-hidden="true">
                {ICONS[i]}
              </div>
              <h3>{s.titre}</h3>
              <p>{s.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
