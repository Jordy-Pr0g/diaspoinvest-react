import { useState } from 'react'

const ONGLETS = [
  {
    id: 'calculateur',
    label: 'Simulateur DCA',
    img: '/tracker-calculateur.png',
    desc: '3 questions, 1 réponse chiffrée : combien tu reçois, combien tu dois investir, combien de temps il te faut.',
  },
  {
    id: 'portefeuille',
    label: 'Suivi portefeuille',
    img: '/tracker-portefeuille.png',
    desc: 'Tu saisis tes achats réels. Le Tracker calcule ta plus-value, ton rendement et tes dividendes en temps réel.',
  },
  {
    id: 'performance',
    label: 'Benchmark BRVM',
    img: '/tracker-suivi-performance.png',
    desc: 'Tu sais exactement si tu bats le marché ou non. Indice Base 100, écart BRVM Composite, TRI annualisé.',
  },
  {
    id: 'fiscalite',
    label: 'Fiscalité par pays',
    img: '/tracker-fiscalite.png',
    desc: 'France, Côte d\'Ivoire, Sénégal, Bénin, Togo, Burkina Faso. Rendement net calculé automatiquement selon ta résidence.',
  },
]

export default function ApercuTracker() {
  const [actif, setActif] = useState(0)
  const onglet = ONGLETS[actif]

  return (
    <section className="section apercu-tracker" id="apercu">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Le Tracker Dashboard</span>
          <h2>10 onglets. Tout ce qu'il te faut pour investir.</h2>
          <p>Avant d'acheter, vois ce que tu reçois exactement.</p>
        </div>

        <div className="apercu-tabs">
          {ONGLETS.map((o, i) => (
            <button
              key={o.id}
              className={`apercu-tab${actif === i ? ' active' : ''}`}
              onClick={() => setActif(i)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="apercu-content">
          <div className="apercu-desc">
            <p>{onglet.desc}</p>
          </div>
          <div className="apercu-img-wrap">
            <img
              src={onglet.img}
              alt={`Aperçu onglet ${onglet.label} du Tracker DiaspoInvest`}
              className="apercu-img"
              loading="lazy"
            />
            <div className="apercu-badge">Aperçu réel · Excel &amp; Google Sheets</div>
          </div>
        </div>
      </div>
    </section>
  )
}
