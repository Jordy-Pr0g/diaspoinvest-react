import { LIENS, SLOGAN, DISCLAIMER } from '../data.js'

const FB_URL = 'https://www.facebook.com/profile.php?id=1198462070010640'

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

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
              <li><a href={LIENS.guide} target="_blank" rel="noreferrer">Guide PDF Europe — 14,99 €</a></li>
              <li><a href={LIENS.guideUemoa} target="_blank" rel="noreferrer">Guide PDF UEMOA — 14,99 €</a></li>
              <li><a href={LIENS.calculateur} target="_blank" rel="noreferrer">Tracker Dashboard — 24,99 €</a></li>
              <li><a href={LIENS.pack} target="_blank" rel="noreferrer">Pack Complet Europe — 29,99 €</a></li>
              <li><a href={LIENS.packUemoa} target="_blank" rel="noreferrer">Pack Complet UEMOA — 29,99 €</a></li>
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

            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 10 }}>Nous suivre</h4>
              <a
                href={FB_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#1877F2',
                  color: '#fff',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '9px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <IconFacebook />
                Suivez-nous sur Facebook
              </a>
            </div>
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
