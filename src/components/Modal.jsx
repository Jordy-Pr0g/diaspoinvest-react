import { useEffect } from 'react'

const CONTENU = {
  mentions: {
    titre: 'Mentions légales',
    corps: (
      <>
        <h4>Éditeur</h4>
        <p>
          DiaspoInvest est un projet éducatif indépendant édité par Jordan DJIOKAP,
          étudiant en Finance d'Entreprise et Ingénierie Financière, Paris (France).
        </p>
        <p>Contact : contact@diaspoinvest.fr</p>
        <p>
          DiaspoInvest est édité par une personne physique indépendante. Le site ne traite
          aucun paiement directement : les éventuels produits sont vendus via la plateforme
          Gumroad, qui agit comme vendeur de référence (« merchant of record »).
        </p>

        <h4>Objet</h4>
        <p>
          DiaspoInvest propose des contenus pédagogiques (guides PDF, outil de simulation,
          ressources) destinés à expliquer le fonctionnement de la bourse régionale africaine
          (BRVM, zone UEMOA). Ces contenus sont fournis à titre éducatif uniquement.
        </p>

        <h4>Indépendance</h4>
        <p>
          DiaspoInvest n'est ni affilié, ni partenaire, ni mandaté par la BRVM ou l'AMF-UMOA.
          La BRVM n'est citée qu'à titre de référence factuelle. Aucun logo ni élément
          d'identité officielle de la BRVM n'est utilisé.
        </p>

        <h4>Avertissement investissement</h4>
        <p>
          Le contenu diffusé ne constitue pas un conseil en investissement personnalisé au sens
          de la directive MIF2. Investir comporte un risque de perte en capital. Tout compte
          détenu à l'étranger doit être déclaré en France via le formulaire 3916.
        </p>

        <h4>Hébergement</h4>
        <p>
          Site hébergé par Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104,
          États-Unis.
        </p>

        <h4>Propriété intellectuelle</h4>
        <p>
          L'ensemble des contenus (textes, visuels, données, guides) est la propriété exclusive
          de Jordan DJIOKAP. Toute reproduction sans autorisation écrite est interdite.
        </p>
      </>
    ),
  },

  cgu: {
    titre: "Conditions Générales d'Utilisation",
    corps: (
      <>
        <h4>Objet</h4>
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et
          l'usage du site diaspoinvest.fr, édité par Jordan DJIOKAP. En naviguant sur
          le site, vous acceptez ces conditions sans réserve.
        </p>

        <h4>Accès au site</h4>
        <p>
          Le site et ses outils gratuits (screener, simulateurs, calculateurs, blog) sont
          accessibles librement. L'éditeur s'efforce d'assurer leur disponibilité mais ne
          garantit pas un accès continu et peut suspendre, modifier ou interrompre tout ou
          partie du site à tout moment, sans préavis.
        </p>

        <h4>Nature des contenus</h4>
        <p>
          L'ensemble des contenus et outils est fourni à titre strictement éducatif et
          informatif. Ils ne constituent pas un conseil en investissement, juridique ou
          fiscal personnalisé. Les données de marché proviennent de sources publiques et
          peuvent comporter des erreurs, retards ou approximations. Chaque utilisateur reste
          seul responsable de ses décisions.
        </p>

        <h4>Propriété intellectuelle</h4>
        <p>
          Les textes, visuels, données, outils et guides sont la propriété exclusive de
          Jordan DJIOKAP. Toute reproduction, extraction ou réutilisation sans autorisation
          écrite est interdite.
        </p>

        <h4>Comportement de l'utilisateur</h4>
        <p>
          L'utilisateur s'engage à ne pas perturber le fonctionnement du site, à ne pas
          tenter d'accéder à des espaces non autorisés et à ne pas en extraire massivement
          les données par des moyens automatisés.
        </p>

        <h4>Liens externes</h4>
        <p>
          Le site peut renvoyer vers des sites tiers (sources de marché, plateforme de
          paiement, réseaux sociaux). L'éditeur n'exerce aucun contrôle sur ces sites et
          décline toute responsabilité quant à leur contenu.
        </p>

        <h4>Données personnelles</h4>
        <p>
          Le traitement des données est détaillé dans la Politique de confidentialité,
          partie intégrante des présentes CGU.
        </p>

        <h4>Évolution et droit applicable</h4>
        <p>
          Ces CGU peuvent être modifiées à tout moment ; la version applicable est celle en
          ligne au moment de la consultation. Elles sont soumises au droit français.
        </p>
      </>
    ),
  },

  confidentialite: {
    titre: 'Politique de confidentialité',
    corps: (
      <>
        <h4>Données collectées</h4>
        <p>
          DiaspoInvest collecte uniquement les données que vous fournissez volontairement :
          adresse email (newsletter), avis clients (email non publié, pays, texte, note).
          Aucune donnée n'est collectée à votre insu.
        </p>

        <h4>Paiements</h4>
        <p>
          Les achats sont traités exclusivement par Gumroad (Gumroad, Inc.).
          DiaspoInvest ne stocke aucune donnée bancaire ou de carte de paiement.
        </p>

        <h4>Email marketing</h4>
        <p>
          Si vous vous inscrivez à la newsletter, votre adresse email est transmise à Brevo
          (anciennement Sendinblue) et n'est jamais revendue ni partagée avec des tiers.
          Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque email.
        </p>

        <h4>Cookies et mesure d'audience</h4>
        <p>
          Ce site n'utilise aucun cookie publicitaire ni traceur tiers. La mesure d'audience
          est réalisée en interne (compteurs agrégés de pages vues et d'actions), sans cookie
          et sans profilage. Le nombre de visiteurs uniques est estimé à partir d'un identifiant
          technique anonymisé (empreinte non réversible dérivée de l'adresse IP et du navigateur),
          jamais conservé en clair ni partagé avec des tiers. Ce dispositif est conforme au RGPD
          et ne nécessite pas de consentement préalable.
        </p>

        <h4>Durée de conservation</h4>
        <p>
          Les données newsletter sont conservées jusqu'à désinscription. Les avis clients
          sont conservés tant qu'ils sont publiés. Sur demande, suppression dans les 30 jours.
        </p>

        <h4>Vos droits (RGPD)</h4>
        <p>
          Conformément au Règlement (UE) 2016/679, vous disposez d'un droit d'accès,
          de rectification, de suppression et de portabilité de vos données. Pour exercer
          ces droits : contact@diaspoinvest.fr
        </p>
      </>
    ),
  },

  cgv: {
    titre: 'Conditions Générales de Vente',
    corps: (
      <>
        <h4>Édition et vente</h4>
        <p>
          Les produits sont conçus et édités par Jordan DJIOKAP (DiaspoInvest), France.
          Les ventes sont opérées via la plateforme Gumroad (Gumroad, Inc.), qui agit en
          qualité de vendeur de référence (« merchant of record ») : c'est Gumroad qui conclut
          la transaction avec l'acheteur et qui collecte puis reverse les taxes applicables.
          DiaspoInvest fournit le contenu, n'encaisse pas directement les paiements et ne
          stocke aucune donnée bancaire. Contact : contact@diaspoinvest.fr
        </p>

        <h4>Produits</h4>
        <p>
          DiaspoInvest propose des biens numériques dématérialisés (guides PDF, outils de
          simulation sous format tableur). Ces produits sont à usage éducatif uniquement et
          ne constituent pas un conseil en investissement.
        </p>

        <h4>Prix et taxes</h4>
        <p>
          Les prix sont affichés en euros. En tant que vendeur de référence, Gumroad calcule,
          collecte et reverse la TVA ou la taxe applicable selon le pays de l'acheteur. Les
          prix peuvent être modifiés à tout moment, sans effet sur les commandes déjà confirmées.
        </p>

        <h4>Commande et livraison</h4>
        <p>
          Les achats s'effectuent sur Hotmart. Le paiement est exigible à la commande. Après
          confirmation, le produit est livré immédiatement par email à l'adresse fournie lors
          de la commande.
        </p>

        <h4>Droit de rétractation</h4>
        <p>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
          de 14 jours ne s'applique pas aux contenus numériques dont l'exécution a commencé
          avec votre accord exprès avant l'expiration du délai de rétractation.
        </p>
        <p>
          Cependant, DiaspoInvest offre une garantie commerciale "satisfait ou remboursé"
          de 15 jours à compter de la date d'achat (garantie appliquée par la plateforme
          de paiement Hotmart). Pour en bénéficier, contactez
          contact@diaspoinvest.fr avec votre preuve d'achat.
        </p>

        <h4>Propriété intellectuelle</h4>
        <p>
          L'achat d'un produit confère une licence personnelle, non cessible et non exclusive
          d'utilisation. Toute reproduction, revente ou diffusion est strictement interdite.
        </p>

        <h4>Responsabilité</h4>
        <p>
          Les contenus sont fournis à titre éducatif. DiaspoInvest ne saurait être tenu
          responsable des décisions d'investissement prises sur la base de ces contenus.
          Les données de marché utilisées sont issues de sources publiques et peuvent comporter
          des erreurs ou retards.
        </p>

        <h4>Droit applicable</h4>
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige,
          une solution amiable sera recherchée avant tout recours juridictionnel.
          Le consommateur peut également recourir à la médiation de la consommation.
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
