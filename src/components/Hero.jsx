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
          continent : choisir tes actions, simuler ton rendement et déclarer ton compte en
          toute légalité.
        </p>

        <div className="hero-cta">
          <a className="btn btn-or" href="/screener">
            Explorer le Screener
          </a>
          <a className="btn btn-ghost" href="#pricing" style={{ color: '#F1F5F9', borderColor: 'rgba(241,245,249,0.3)' }}>
            Voir les produits
          </a>
        </div>

        <div className="hero-stat-bar">
          <div className="hsb-item">
            <span className="hsb-val hsb-green">+28,89 %</span>
            <span className="hsb-lbl">BRVM Composite 2024</span>
          </div>
          <div className="hsb-sep">vs</div>
          <div className="hsb-item">
            <span className="hsb-val hsb-red">+0,92 %</span>
            <span className="hsb-lbl">CAC 40 2024</span>
          </div>
        </div>

        <div className="hero-price-cards">
          <a className="price-pill" href={LIENS.guide} target="_blank" rel="noreferrer">
            <div className="p-name">Guide PDF</div>
            <div className="p-value">14,99 €</div>
          </a>
          <a className="price-pill" href={LIENS.calculateur} target="_blank" rel="noreferrer">
            <div className="p-name">Tracker Dashboard</div>
            <div className="p-value"><s style={{opacity:0.5, fontSize:'0.85em'}}>34,99 €</s> 19,99 €</div>
          </a>
          <a className="price-pill" href={LIENS.pack} target="_blank" rel="noreferrer">
            <div className="p-name">Pack Complet</div>
            <div className="p-value">29,99 €</div>
          </a>
        </div>

      </div>
    </section>
  )
}
