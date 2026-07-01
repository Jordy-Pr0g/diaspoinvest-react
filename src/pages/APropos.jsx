import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom'
import { useMeta } from '../hooks/useMeta.js'

const OR   = '#C9A84C'
const GRIS = 'rgba(232,238,246,0.5)'

export default function APropos() {
  useMeta({
    title: 'À propos — DiaspoInvest par Jordan Djiokap',
    description: 'DiaspoInvest est un projet éducatif indépendant créé par Jordan Djiokap, étudiant en Finance à l\'INSEEC Paris, pour aider la diaspora africaine à investir sur la BRVM.',
    url: 'https://diaspoinvest.fr/a-propos',
  })

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D1525 0%, #131E30 100%)', paddingTop: 80 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px 24px 96px' }}>

          <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
            ← Accueil
          </Link>

          <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 10 }}>
            À propos
          </span>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: '#E8EEF6', lineHeight: 1.1, marginBottom: 56 }}>
            DiaspoInvest
          </h1>

          <div className="apropos-prose">

            <p>
              Je suis Jordan DJIOKAP, étudiant en Finance d'Entreprise et Ingénierie Financière. Mon quotidien, c'est d'analyser des modèles d'investissement européens : valorisation d'actifs, gestion de portefeuille, ETF, produits dérivés.
            </p>

            <p>
              Quand j'ai voulu diversifier mon propre portefeuille, j'ai cherché où investir. ETF, PEA, MSCI World, indices européens... tout pointait vers les mêmes marchés occidentaux. Alors j'ai posé une question simple : est-ce qu'il existe quelque chose lié à l'Afrique ?
            </p>

            <p>
              La réponse m'a surpris. La BRVM, Bourse Régionale des Valeurs Mobilières, existe depuis 1998. Elle regroupe les principales entreprises de huit pays de la zone UEMOA et verse des dividendes chaque année à ses actionnaires. Le rendement moyen tourne autour de 6 % par an. Le BRVM Composite a progressé de 28,89 % en 2024 quand le CAC 40 affichait 0,92 %. Pourtant, presque personne n'en parle, même au sein de la diaspora.
            </p>

            <p>
              Avec ma formation, j'avais les outils pour analyser ce marché. Ce qui manquait, c'étaient des ressources en français pensées pour quelqu'un qui vit hors de la zone UEMOA : comment ouvrir un compte à distance, comment déclarer les revenus aux impôts en France, quelles actions regarder en premier, comment construire une stratégie d'investissement régulier sur le long terme.
            </p>

            <p>
              J'ai créé DiaspoInvest pour combler ce vide. Le Screener liste les 47 actions cotées avec leurs cours et rendements en temps réel. Le backtest DCA permet de simuler ce qu'aurait donné un investissement mensuel régulier sur n'importe quelle action depuis 1998. Le calculateur fiscal estime l'imposition réelle selon le pays de résidence. Le blog couvre les sujets que personne ne documente en français.
            </p>

            <p>
              Je gère ce projet seul. Pas de conflit d'intérêt avec un courtier, une SGI ou une institution financière. Les outils en ligne sont gratuits. Les guides et le Tracker vont plus loin pour ceux qui veulent une méthode complète.
            </p>

            <p>
              Si tu cherchais une façon d'investir au pays sans jamais trouver de réponse claire, tu es au bon endroit.
            </p>

            <div style={{
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderRadius: 14,
              padding: '24px 28px',
              margin: '40px 0',
            }}>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'rgba(232,238,246,0.75)', fontSize: '1.05rem', lineHeight: 1.75 }}>
                "Rendre la bourse africaine aussi accessible que l'investissement en Europe."
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 13, color: OR, fontWeight: 700 }}>
                Jordan DJIOKAP — DiaspoInvest
              </p>
            </div>

            <p>
              Pour toute question ou retour, écris à <a href="mailto:contact@diaspoinvest.fr" style={{ color: OR, fontWeight: 600 }}>contact@diaspoinvest.fr</a>.
            </p>

          </div>

        </div>
      </main>
      <Footer />

      <style>{`
        .apropos-prose p {
          font-size: 1.05rem;
          color: rgba(232,238,246,0.68);
          line-height: 1.85;
          margin-bottom: 22px;
        }
        .apropos-prose p:last-child { margin-bottom: 0; }
        .apropos-prose a:hover { opacity: 0.75; }
      `}</style>
    </>
  )
}
