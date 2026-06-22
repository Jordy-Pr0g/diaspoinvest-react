import { LIENS } from '../data.js'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">

        <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.05, maxWidth: '14ch', marginBottom: 28 }}>
          Fais travailler ton épargne sur la{' '}
          <span className="accent">bourse africaine</span>.
        </h1>

        <p className="lead" style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)', maxWidth: '46ch', marginBottom: 40 }}>
          DiaspoInvest t'apprend à investir sur la BRVM depuis la France ou le continent —
          choisir tes actions, simuler ton rendement, déclarer en toute légalité.
        </p>

        <div className="hero-cta">
          <Link className="btn btn-or" to="/screener">
            Explorer le Screener
          </Link>
          <a className="btn btn-ghost" href="#pricing" style={{ color: '#F1F5F9', borderColor: 'rgba(241,245,249,0.3)' }}>
            Voir les produits
          </a>
        </div>

        <div className="hero-stat-bar" style={{ marginTop: 48 }}>
          <div className="hsb-item">
            <span className="hsb-val hsb-green" style={{ fontSize: '2rem' }}>+28,89 %</span>
            <span className="hsb-lbl">BRVM Composite 2024</span>
          </div>
          <div className="hsb-sep">vs</div>
          <div className="hsb-item">
            <span className="hsb-val hsb-red" style={{ fontSize: '2rem' }}>+0,92 %</span>
            <span className="hsb-lbl">CAC 40 2024</span>
          </div>
          <div className="hsb-sep">·</div>
          <div className="hsb-item">
            <span className="hsb-val" style={{ fontSize: '2rem', color: '#C9A84C' }}>6 %</span>
            <span className="hsb-lbl">dividende moyen BRVM</span>
          </div>
        </div>

      </div>
    </section>
  )
}
