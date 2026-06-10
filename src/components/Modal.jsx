import { useEffect } from 'react'

const CONTENU = {
  mentions: {
    titre: 'Mentions légales',
    corps: (
      <>
        <h4>Éditeur</h4>
        <p>
          DiaspoInvest est un projet éducatif indépendant édité par Jordan Djiokap, étudiant en
          Finance d’Entreprise et Ingénierie Financière, Paris.
        </p>
        <h4>Objet</h4>
        <p>
          DiaspoInvest propose des contenus pédagogiques (guide, calculateur, ressources) destinés
          à expliquer le fonctionnement de la bourse régionale africaine (BRVM, zone UEMOA).
        </p>
        <h4>Indépendance</h4>
        <p>
          DiaspoInvest n’est ni affilié, ni partenaire, ni mandaté par la BRVM ou le CREPMF. La
          BRVM n’est citée qu’à titre de référence factuelle. Aucun logo ni élément d’identité
          officielle de la BRVM n’est utilisé.
        </p>
        <h4>Avertissement</h4>
        <p>
          Le contenu diffusé ne constitue pas un conseil en investissement personnalisé. Investir
          comporte un risque de perte en capital. Tout compte détenu à l’étranger doit être déclaré
          en France via le formulaire 3916.
        </p>
        <h4>Hébergement</h4>
        <p>Site hébergé par Vercel Inc.</p>
      </>
    ),
  },
  confidentialite: {
    titre: 'Politique de confidentialité',
    corps: (
      <>
        <h4>Données collectées</h4>
        <p>
          Le site vitrine DiaspoInvest ne collecte pas de données personnelles à votre insu. Les
          achats sont traités par des plateformes tierces (Gumroad, Chariow) selon leurs propres
          politiques de confidentialité.
        </p>
        <h4>Email marketing</h4>
        <p>
          Si vous vous inscrivez à la newsletter, votre adresse email est gérée via Brevo et n’est
          jamais revendue. Vous pouvez vous désinscrire à tout moment.
        </p>
        <h4>Cookies</h4>
        <p>
          Ce site n’utilise pas de cookies publicitaires. Les éventuels outils de mesure
          d’audience sont anonymisés.
        </p>
        <h4>Vos droits</h4>
        <p>
          Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de
          suppression de vos données : contact@diaspoinvest.com.
        </p>
      </>
    ),
  },
}

export default function Modal({ type, onClose }) {
  useEffect(() => {
    if (!type) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [type, onClose])

  if (!type) return null
  const data = CONTENU[type]
  if (!data) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{data.titre}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal-body">{data.corps}</div>
      </div>
    </div>
  )
}
