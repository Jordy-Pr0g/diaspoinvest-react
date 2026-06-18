import { LIENS, SLOGAN, DISCLAIMER } from '../data.js'

export default function Footer({ onOpenModal }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              Diaspo<span className="dot">Invest</span>
            </div>
            <p className="footer-slogan">« {SLOGAN} »</p>
          </div>

          <div>
            <h4>Produits</h4>
            <ul>
              <li><a href={LIENS.guide} target="_blank" rel="noreferrer">Guide PDF Europe · 14,99 €</a></li>
              <li><a href={LIENS.guideUemoa} target="_blank" rel="noreferrer">Guide PDF UEMOA · 14,99 €</a></li>
              <li><a href={LIENS.calculateur} target="_blank" rel="noreferrer">Tracker Dashboard · 24,99 €</a></li>
              <li><a href={LIENS.pack} target="_blank" rel="noreferrer">Pack Complet Europe · 29,99 €</a></li>
              <li><a href={LIENS.packUemoa} target="_blank" rel="noreferrer">Pack Complet UEMOA · 29,99 €</a></li>
            </ul>
          </div>

          <div>
            <h4>Informations</h4>
            <ul>
              <li>
                <button className="linklike" onClick={() => onOpenModal('mentions')}>
                  Mentions légales
                </button>
              </li>
              <li>
                <button className="linklike" onClick={() => onOpenModal('confidentialite')}>
                  Confidentialité
                </button>
              </li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="mailto:contact@diaspoinvest.fr">Contact</a></li>
            </ul>

          </div>
        </div>

        <div className="footer-disclaimer">
          <span>⚖️</span>
          <p>{DISCLAIMER}</p>
        </div>

        <div className="footer-bottom">
          <span>© 2026 DiaspoInvest · Jordan Djiokap · Paris</span>
          <span>Non affilié à la BRVM ni au CREPMF · Ceci n’est pas un conseil en investissement.</span>
        </div>
      </div>
    </footer>
  )
}
