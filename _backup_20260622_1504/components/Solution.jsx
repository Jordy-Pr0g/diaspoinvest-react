import { SOLUTIONS } from '../data.js'
const ICONS = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>,
]

export default function Solution() {
  return (
    <section className="section solution" id="solution">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">La méthode DiaspoInvest</span>
          <h2>De zéro à ton premier investissement</h2>
          <p>
            Un parcours clair et concret, pensé pour les débutants, sans jargon, avec des
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
