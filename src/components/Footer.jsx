import { Link } from 'react-router-dom'
import { LIENS, DISCLAIMER } from '../data.js'

const OUTILS = [
  { to: '/screener',  label: 'Screener BRVM'       },
  { to: '/backtest',  label: 'Backtest DCA'         },
  { to: '/fiscalite', label: 'Calculateur fiscal'   },
  { to: '/guides',    label: 'Tous les outils'      },
]

const RESSOURCES = [
  { to: '/blog',                                          label: 'Blog'                             },
  { to: '/blog/investir-brvm-depuis-france',              label: 'Investir depuis la France'        },
  { to: '/blog/brvm-vs-livret-a',                         label: 'BRVM vs Livret A'                 },
  { to: '/blog/ouvrir-compte-sgi-depuis-etranger',        label: 'Ouvrir un compte SGI'             },
  { to: '/blog/declarer-compte-brvm-impots-france',       label: 'Déclarer son compte aux impôts'   },
]

const PRODUITS = [
  { href: LIENS.guide,      label: 'Guide PDF Europe · 14,99 €'  },
  { href: LIENS.guideUemoa, label: 'Guide PDF UEMOA · 14,99 €'   },
  { href: LIENS.calculateur,label: 'Tracker Dashboard · 19,99 €' },
  { href: LIENS.pack,       label: 'Pack Complet · 29,99 €'      },
]

export default function Footer({ onOpenModal }) {
  return (
    <footer className="footer">
      <div className="container">

        {/* Grille principale */}
        <div className="footer-grid">

          {/* Colonne 1 — Marque */}
          <div className="footer-brand-col">
            <div className="brand" style={{ marginBottom: 14 }}>
              Diaspo<span className="dot">Invest</span>
            </div>
            <p className="footer-tagline">
              La première plateforme dédiée à l'investissement sur la bourse africaine pour la diaspora et les résidents UEMOA.
            </p>
            <a href="mailto:contact@diaspoinvest.fr" className="footer-email">
              ✉ contact@diaspoinvest.fr
            </a>
            <div className="footer-badges">
              <span>🇫🇷 Paris</span>
              <span>BRVM · 8 pays UEMOA</span>
            </div>
          </div>

          {/* Colonne 2 — Outils */}
          <div>
            <h4 className="footer-h4">Outils gratuits</h4>
            <ul className="footer-ul">
              {OUTILS.map(o => (
                <li key={o.to}><Link to={o.to}>{o.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Produits */}
          <div>
            <h4 className="footer-h4">Produits</h4>
            <ul className="footer-ul">
              {PRODUITS.map(p => (
                <li key={p.href}>
                  <a href={p.href} target="_blank" rel="noreferrer">{p.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Ressources */}
          <div>
            <h4 className="footer-h4">Ressources</h4>
            <ul className="footer-ul">
              {RESSOURCES.map(r => (
                <li key={r.to}><Link to={r.to}>{r.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Colonne 5 — Légal */}
          <div>
            <h4 className="footer-h4">Légal</h4>
            <ul className="footer-ul">
              {onOpenModal && <>
                <li><button className="linklike" onClick={() => onOpenModal('mentions')}>Mentions légales</button></li>
                <li><button className="linklike" onClick={() => onOpenModal('confidentialite')}>Confidentialité</button></li>
                <li><button className="linklike" onClick={() => onOpenModal('cgv')}>CGV</button></li>
              </>}
              <li><Link to="/a-propos">À propos</Link></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="mailto:contact@diaspoinvest.fr">Contact</a></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <span className="footer-disclaimer-icon">⚠</span>
          <p>{DISCLAIMER}</p>
        </div>

        {/* Barre de bas */}
        <div className="footer-bottom">
          <span>© 2026 DiaspoInvest · Jordan Djiokap · Paris</span>
          <span className="footer-bottom-legal">
            Non affilié à la BRVM ni au CREPMF · Ceci n'est pas un conseil en investissement
          </span>
        </div>

      </div>
    </footer>
  )
}
