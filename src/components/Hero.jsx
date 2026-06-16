import { LIENS } from '../data.js'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <span className="badge">Diaspora africaine · Zone UEMOA</span>

        <h1>
          Fais travailler ton épargne sur la{' '}
          <span className="accent">bourse africaine</span>.
        </h1>

        <p className="lead">
          DiaspoInvest t’apprend, pas à pas, à investir sur la BRVM depuis la France ou le
          continent — choisir tes actions, simuler ton rendement et déclarer ton compte en
          toute légalité.
        </p>

        <div className="hero-cta">
          <a className="btn btn-or" href={LIENS.guide} target="_blank" rel="noreferrer">
            Obtenir le guide — 14,99 €
          </a>
          <a className="btn btn-ghost" href="#calculateur" style={{ color: '#FFF8E7', borderColor: 'rgba(255,248,231,0.35)' }}>
            Simuler mon rendement
          </a>
        </div>

        <div className="hero-price-cards">
          <a className="price-pill" href={LIENS.guide} target="_blank" rel="noreferrer">
            <div className="p-name">Guide PDF</div>
            <div className="p-value">14,99 €</div>
          </a>
          <a className="price-pill" href={LIENS.calculateur} target="_blank" rel="noreferrer">
            <div className="p-name">Tracker Dashboard</div>
            <div className="p-value">24,99 €</div>
          </a>
          <a className="price-pill" href={LIENS.pack} target="_blank" rel="noreferrer">
            <div className="p-name">Pack Complet</div>
            <div className="p-value">29,99 €</div>
          </a>
        </div>

        <div className="social-proof">
          <div className="avatars">
            <span>A</span>
            <span>K</span>
            <span>M</span>
            <span>S</span>
          </div>
          <div>
            <span className="stars">★★★★★</span>
            <br />
            Rejoins la diaspora qui passe à l’action
          </div>
        </div>
      </div>
    </section>
  )
}
