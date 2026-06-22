import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'

const OR   = '#C9A84C'
const GRIS = 'rgba(232,238,246,0.5)'

export default function APropos() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D1525 0%, #131E30 100%)', paddingTop: 80 }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 80px' }}>

          <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
            ← Accueil
          </Link>

          <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 10 }}>
            À propos
          </span>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: '#E8EEF6', lineHeight: 1.1, marginBottom: 48 }}>
            Pourquoi DiaspoInvest existe
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            <section className="apropos-section">
              <h2>Le constat de départ</h2>
              <p>
                Des millions d'Africains vivant en France et en Europe souhaitent investir dans leur pays d'origine, mais ne savent pas par où commencer. La Bourse Régionale des Valeurs Mobilières — la BRVM — regroupe huit pays d'Afrique de l'Ouest et des entreprises solides qui versent des dividendes réguliers. Elle reste pourtant largement méconnue de la diaspora.
              </p>
              <p>
                Les ressources en français adaptées à la situation des non-résidents n'existaient pas vraiment. Les textes fiscaux sont complexes, les formulaires de déclaration peu documentés, les sociétés de gestion et d'intermédiation peu connues hors du continent. Il fallait tout trouver soi-même.
              </p>
              <p>
                DiaspoInvest est né de ce manque.
              </p>
            </section>

            <section className="apropos-section">
              <h2>Jordan Djiokap, fondateur</h2>
              <p>
                Je m'appelle Jordan Djiokap. Je suis étudiant en finance à Paris, d'origine camerounaise. Quand j'ai voulu investir une partie de mon épargne sur la BRVM, j'ai cherché des guides clairs en français, adaptés à ma situation de résident en France. Je n'en ai pas trouvé.
              </p>
              <p>
                J'ai alors passé plusieurs mois à éplucher les textes de la convention fiscale France-Côte d'Ivoire, les instructions de déclaration du formulaire 3916, les conditions d'ouverture de comptes chez les SGI acceptant les non-résidents, et les données historiques de la BRVM disponibles publiquement. DiaspoInvest centralise ce travail.
              </p>
              <p>
                Je gère ce projet seul. Pas d'équipe, pas d'investisseurs, pas de conflit d'intérêt avec un courtier ou une banque. C'est un projet indépendant, financé par les guides et outils que tu peux acheter si tu veux aller plus loin.
              </p>
              <p>
                L'objectif est simple : que quelqu'un qui arrive sur DiaspoInvest aujourd'hui comprenne en quelques heures comment la BRVM fonctionne, comment y investir depuis son pays, et comment déclarer ses revenus en toute légalité.
              </p>
            </section>

            <section className="apropos-section">
              <h2>Pourquoi la BRVM plutôt qu'un autre marché</h2>
              <p>
                La BRVM n'est pas un marché spéculatif. C'est un marché de fonds propres, porté par des entreprises africaines qui ont des résultats, versent des dividendes, et opèrent dans des secteurs essentiels au quotidien de 130 millions de personnes dans la zone UEMOA.
              </p>
              <p>
                Le rendement en dividendes moyen tourne autour de 6 % par an. À titre de comparaison, le Livret A est à 1,5 %. Ce n'est pas sans risque, mais la différence mérite qu'on s'y intéresse sérieusement.
              </p>
              <p>
                Pour la diaspora, investir sur la BRVM c'est aussi un moyen de faire travailler son épargne sur le continent, au-delà des transferts d'argent classiques. C'est une façon concrète de participer au développement économique des pays d'origine.
              </p>
            </section>

            <section className="apropos-section">
              <h2>Ce que tu trouveras ici</h2>
              <p>
                Le Screener liste les 47 actions cotées sur la BRVM avec leurs cours, dividendes et rendements en temps réel. L'outil de Backtest DCA te permet de simuler ce qu'aurait donné un investissement mensuel régulier sur n'importe quelle action depuis 1998. Le calculateur fiscal estime ton imposition réelle selon ton pays de résidence. Le blog couvre les sujets que personne ne documente en français : comment ouvrir un compte SGI à distance, comment déclarer son compte aux impôts en France, quelles actions ont les meilleurs historiques de dividendes.
              </p>
              <p>
                Les outils en ligne sont gratuits et accessibles sans inscription. Les guides PDF et le Tracker vont plus loin pour ceux qui veulent des explications détaillées et des outils prêts à l'emploi.
              </p>
            </section>

            <div style={{
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: 16,
              padding: '28px 32px',
            }}>
              <p style={{ fontSize: '1.05rem', color: 'rgba(232,238,246,0.75)', lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>
                "Rendre la bourse africaine aussi accessible que l'investissement en Europe."
              </p>
              <p style={{ fontSize: 13, color: OR, fontWeight: 700, marginTop: 14, marginBottom: 0 }}>
                Jordan Djiokap · Fondateur, DiaspoInvest
              </p>
            </div>

            <section className="apropos-section">
              <h2>Contact</h2>
              <p>
                Pour toute question, correction à signaler, ou si tu veux simplement partager ton retour, écris à <a href="mailto:contact@diaspoinvest.fr" style={{ color: OR, fontWeight: 600 }}>contact@diaspoinvest.fr</a>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .apropos-section h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: #E8EEF6;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .apropos-section p {
          font-size: 1rem;
          color: rgba(232,238,246,0.65);
          line-height: 1.85;
          margin-bottom: 16px;
        }
        .apropos-section p:last-child { margin-bottom: 0; }
      `}</style>
    </>
  )
}
