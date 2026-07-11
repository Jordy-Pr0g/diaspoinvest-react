import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LIENS, DISCLAIMER } from '../data.js'
import Modal from './Modal.jsx'

export default function Footer({ onOpenModal }) {
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'

  const OUTILS = [
    { to: '/screener',  label: t('footer.outilScreener') },
    { to: '/backtest',  label: t('footer.outilBacktest') },
    { to: '/fiscalite', label: t('footer.outilFiscal')   },
    { to: '/guides',    label: t('footer.outilTous')     },
  ]

  const RESSOURCES = [
    { to: '/blog',                                    label: t('nav.blog')            },
    { to: '/blog/investir-brvm-depuis-france',        label: t('footer.ressInvestir') },
    { to: '/blog/brvm-vs-livret-a',                   label: t('footer.ressVsLivret') },
    { to: '/blog/ouvrir-compte-sgi-depuis-etranger',  label: t('footer.ressOuvrir')   },
    { to: '/blog/declarer-compte-brvm-impots-france', label: t('footer.ressDeclarer') },
  ]

  const PRODUITS = [
    { href: LIENS.guide,       label: t('footer.prodGuideEurope') },
    { href: LIENS.guideUemoa,  label: t('footer.prodGuideUemoa')  },
    { href: LIENS.calculateur, label: t('footer.prodTracker')     },
    { href: LIENS.pack,        label: t('footer.prodPack')        },
  ]

  // Footer autonome : si la page ne fournit pas de gestion de modal, on gère la nôtre,
  // pour que les liens légaux soient accessibles depuis TOUTES les pages.
  const [localModal, setLocalModal] = useState(null)
  const open = onOpenModal || setLocalModal

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
              {t('footer.tagline')}
            </p>
            <a href="mailto:contact@diaspoinvest.fr" className="footer-email">
              ✉ contact@diaspoinvest.fr
            </a>
            <div className="footer-badges">
              <span>Paris</span>
              <span>{t('footer.badgeBrvm')}</span>
            </div>
          </div>

          {/* Colonne 2 — Outils */}
          <div>
            <h4 className="footer-h4">{t('footer.outilsGratuits')}</h4>
            <ul className="footer-ul">
              {OUTILS.map(o => (
                <li key={o.to}><Link to={o.to}>{o.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Produits */}
          <div>
            <h4 className="footer-h4">{t('footer.produits')}</h4>
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
            <h4 className="footer-h4">{t('footer.ressources')}</h4>
            <ul className="footer-ul">
              {RESSOURCES.map(r => (
                <li key={r.to}><Link to={r.to}>{r.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Colonne 5 — Légal */}
          <div>
            <h4 className="footer-h4">{t('footer.legal')}</h4>
            <ul className="footer-ul">
              <li><button className="linklike" onClick={() => open('mentions')}>{t('footer.mentionsLegales')}</button></li>
              <li><button className="linklike" onClick={() => open('cgu')}>CGU</button></li>
              <li><button className="linklike" onClick={() => open('cgv')}>CGV</button></li>
              <li><button className="linklike" onClick={() => open('confidentialite')}>{t('footer.confidentialite')}</button></li>
              <li><Link to="/a-propos">{t('footer.apropos')}</Link></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="mailto:contact@diaspoinvest.fr">{t('footer.contact')}</a></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <span className="footer-disclaimer-icon">⚠</span>
          <p>{en ? t('data.disclaimer') : DISCLAIMER}</p>
        </div>

        {/* Barre de bas */}
        <div className="footer-bottom">
          <span>{t('footer.copyright')}</span>
          <span className="footer-bottom-legal">
            {t('footer.disclaimerBas')}
          </span>
        </div>

      </div>

      {!onOpenModal && <Modal type={localModal} onClose={() => setLocalModal(null)} />}
    </footer>
  )
}
