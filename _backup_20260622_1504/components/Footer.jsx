import { Link } from 'react-router-dom'
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
              <li style={{ opacity: 0.4 }}>Tracker Dashboard · Bientôt disponible</li>
              <li style={{ opacity: 0.4 }}>Pack Complet · Bientôt disponible</li>
            </ul>
          </div>

          <div>
            <h4>Ressources</h4>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/blog/investir-brvm-depuis-france">Investir sur la BRVM depuis la France</Link></li>
              <li><Link to="/blog/dividendes-sonatel-2025">Dividendes Sonatel 2025</Link></li>
              <li><Link to="/blog/brvm-vs-livret-a">BRVM vs Livret A</Link></li>
              <li><Link to="/blog/ouvrir-compte-sgi-depuis-etranger">Ouvrir un compte SGI</Link></li>
              <li><Link to="/blog/declarer-compte-brvm-impots-france">Déclarer son compte aux impôts</Link></li>
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
              <li>
                <button className="linklike" onClick={() => onOpenModal('cgv')}>
                  CGV
                </button>
              </li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="mailto:contact@diaspoinvest.fr">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
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
