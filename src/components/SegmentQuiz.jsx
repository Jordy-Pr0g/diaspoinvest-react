import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Liens produits reels (source unique : src/data.js)
const GUMROAD = {
  guideEurope: 'https://diaspoinvest.gumroad.com/l/oxxzda',
  guideUemoa:  'https://diaspoinvest.gumroad.com/l/dpqvqo',
  tracker:     'https://diaspoinvest.gumroad.com/l/tocir',
  packEurope:  'https://diaspoinvest.gumroad.com/l/ecspxh',
  packUemoa:   'https://diaspoinvest.gumroad.com/l/cvkcwo',
}

const QUESTIONS = [
  {
    id: 'experience',
    text: 'Tu connais déjà la bourse africaine ?',
    answers: [
      { label: 'Non, je découvre', value: 'beginner' },
      { label: 'Un peu, je débute', value: 'junior' },
      { label: 'Oui, j\'investis déjà', value: 'advanced' },
    ],
  },
  {
    id: 'goal',
    text: 'Qu\'est-ce qui t\'intéresse le plus aujourd\'hui ?',
    answers: [
      { label: 'Comprendre comment ça marche', value: 'learn' },
      { label: 'Choisir et analyser des actions', value: 'analyze' },
      { label: 'Optimiser : frais, fiscalité, stratégie', value: 'optimize' },
    ],
  },
  {
    id: 'location',
    text: 'Tu vis où en ce moment ?',
    answers: [
      { label: 'En Afrique de l\'Ouest (Côte d\'Ivoire, Sénégal, Bénin…)', value: 'uemoa' },
      { label: 'Ailleurs en Afrique (Cameroun, Gabon, Maroc…)', value: 'afrique' },
      { label: 'En Europe, au Canada, ailleurs', value: 'monde' },
    ],
  },
]

const TITLES = {
  beginner: 'Tu débutes ? Voici par où commencer',
  junior: 'Tu connais les bases ? Voici la suite',
  advanced: 'Tu connais déjà ? Allons à l\'essentiel',
}
const GOAL_INTRO = {
  learn: 'De quoi bien comprendre comment tout ça marche.',
  analyze: 'De quoi choisir et analyser des actions par toi-même.',
  optimize: 'De quoi optimiser tes frais, ta fiscalité et ta stratégie.',
}

// Items reutilisables (liens reels : routes, ancre landing, ou produit Gumroad)
const I = {
  artUemoa:   { title: 'Investir sur la bourse africaine quand on vit en Afrique', text: 'Le guide du résident, expliqué simplement.', to: '/blog/investir-brvm-zone-uemoa' },
  artImpotsUemoa: { title: 'Les impôts sur tes gains, en clair', text: 'Ce que tu paies vraiment selon ton pays.', to: '/blog/fiscalite-dividendes-brvm-uemoa' },
  artDepuisEtranger: { title: 'Investir sur la bourse africaine depuis l\'étranger', text: 'Comment ça marche, étape par étape.', to: '/blog/investir-brvm-depuis-france' },
  artOuvrir:  { title: 'Ouvrir ton compte à distance', text: 'Les documents et les étapes, sans prendre l\'avion.', to: '/blog/ouvrir-compte-sgi-depuis-etranger' },
  artVsLivret:{ title: 'Bourse africaine ou Livret A ?', text: 'La comparaison simple, sans te noyer.', to: '/blog/brvm-vs-livret-a' },
  artImpotsFr:{ title: 'Déclarer ton compte aux impôts en France', text: 'Le formulaire à ne pas oublier, sans stress.', to: '/blog/declarer-compte-brvm-impots-france' },
  artSonatel: { title: 'Combien rapporte une action, concrètement', text: 'L\'exemple de Sonatel, chiffres à l\'appui.', to: '/blog/dividendes-sonatel-2025' },
  artAnalyse: { title: 'Analyser une action : les ratios qui comptent', text: 'PER, BPA, payout, ROE, liquidité. La méthode pour juger une entreprise.', to: '/blog/analyser-action-brvm' },
  artValo:    { title: 'Juger un cours : chère ou bon marché ?', text: 'Valorisation, dividende durable, liquidité du titre.', to: '/blog/juger-cours-action-brvm' },
  artCompteResultat: { title: 'Lire un compte de résultat', text: 'Chiffre d\'affaires, marges, résultat net : décrypter une entreprise.', to: '/blog/lire-compte-resultat' },
  artSgiFrais:{ title: 'SGI et frais : leur impact sur ton rendement', text: 'Comment choisir un courtier et pourquoi les frais comptent sur 20 ans.', to: '/blog/sgi-frais-brvm' },
  artVsPea:   { title: 'BRVM, PEA ou ETF World : comment choisir', text: 'Ce que la diaspora doit comprendre avant d\'arbitrer.', to: '/blog/brvm-vs-pea-etf' },
  artBourses: { title: 'Les bourses africaines au-delà de la BRVM', text: 'Nigeria, Afrique du Sud, Maroc… le panorama du continent.', to: '/blog/bourses-africaines-panorama' },

  toolScreener: { title: 'Voir les 47 entreprises de la bourse', text: 'Leurs prix et ce qu\'elles versent chaque année. Gratuit.', to: '/screener' },
  toolBacktest: { title: 'Combien tu aurais gagné en investissant avant', text: 'Choisis une entreprise et une somme, le calcul se fait. Gratuit.', to: '/backtest' },
  toolCalc:     { title: 'Estimer ce que ton épargne pourrait rapporter', text: 'Mets un montant, vois le résultat. Gratuit.', anchor: 'calculateur' },
  toolFisc:     { title: 'Voir ce qu\'il te reste après impôts', text: 'Compare selon ton pays. Gratuit.', to: '/fiscalite' },

  guideUemoa: { title: 'Guide PDF Résident (14,99 €)', text: 'Comprendre la bourse, ouvrir ton compte dans ton pays et gérer les impôts.', href: GUMROAD.guideUemoa, product: true },
  guideEurope:{ title: 'Guide PDF Diaspora (14,99 €)', text: 'Comprendre la bourse, ouvrir un compte à distance et déclarer en France.', href: GUMROAD.guideEurope, product: true },
  tracker:    { title: 'Tracker Dashboard (19,99 €)', text: 'Les 47 actions par secteur, une projection sur 30 ans et le suivi de ton portefeuille.', href: GUMROAD.tracker, product: true },
  packUemoa:  { title: 'Pack Complet Résident (29,99 €)', text: 'Le guide résident plus le Tracker pour suivre et projeter ton épargne.', href: GUMROAD.packUemoa, product: true },
  packEurope: { title: 'Pack Complet Diaspora (29,99 €)', text: 'Le guide diaspora plus le Tracker pour suivre et projeter ton épargne.', href: GUMROAD.packEurope, product: true },
}

// Config par lieu : article d'intro, article fiscal, produit d'entrée, produit complet.
// Pour "afrique" (hors UEMOA), les produits géo-spécifiques ne collent pas :
// on s'appuie sur le Tracker (universel) et il n'y a pas d'article fiscal dédié.
// Config par lieu. "compare" = l'article d'optimisation le plus pertinent pour le profil :
//  - monde (diaspora) : arbitrage BRVM / PEA / ETF
//  - afrique (hors UEMOA) : panorama des bourses du continent
//  - uemoa : SGI et frais
// Pour "afrique", les produits géo-spécifiques ne collent pas : on s'appuie sur le Tracker (universel).
const TRACK = {
  uemoa:   { intro: I.artUemoa,          tax: I.artImpotsUemoa, entry: I.guideUemoa,  top: I.packUemoa,  compare: I.artSgiFrais },
  afrique: { intro: I.artUemoa,          tax: null,             entry: I.tracker,     top: I.tracker,    compare: I.artBourses },
  monde:   { intro: I.artDepuisEtranger, tax: I.artImpotsFr,    entry: I.guideEurope, top: I.packEurope, compare: I.artVsPea },
}

// Recommandations pilotées par (lieu, niveau, objectif).
// Toujours 3 items, le produit en dernier. Ressources gratuites/articles d'abord.
function pickItems(track, experience, goal) {
  const T = TRACK[track]
  const taxArticle = T.tax || I.toolFisc // afrique : pas d'article fiscal dédié
  const POOL = {
    // Comprendre comment ça marche
    learn: {
      beginner: [T.intro, I.toolCalc, T.entry],
      junior:   [T.intro, I.toolScreener, T.entry],
      advanced: [I.artCompteResultat, I.artAnalyse, T.top],
    },
    // Choisir et analyser des actions
    analyze: {
      beginner: [I.toolScreener, T.intro, T.entry],
      junior:   [I.toolScreener, I.toolBacktest, I.tracker],
      advanced: [I.artAnalyse, I.artValo, I.tracker],
    },
    // Optimiser : frais, fiscalité, stratégie
    optimize: {
      beginner: [I.artSgiFrais, I.toolFisc, T.entry],
      junior:   [I.artSgiFrais, taxArticle, I.tracker],
      advanced: [T.compare, I.toolFisc, T.top],
    },
  }
  return POOL[goal][experience]
}

export default function SegmentQuiz({ onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setStep((s) => s + 1)
  }

  const handleNavigate = (item) => {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener')
    } else if (item.anchor) {
      onComplete()
      setTimeout(() => {
        document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    } else if (item.to) {
      onComplete()
      navigate(item.to)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (email) {
      await fetch('/api/subscribe-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          segment: answers.experience,
          goal: answers.goal,
        }),
      }).catch(() => {})
    }
    setLoading(false)
    onComplete()
  }

  const experience = answers.experience || 'beginner'
  const goal = answers.goal || 'learn'
  const track = answers.location === 'uemoa' ? 'uemoa'
    : answers.location === 'afrique' ? 'afrique'
    : 'monde'
  const items = pickItems(track, experience, goal)

  return (
    <div className="segment-quiz-overlay">
      <div className="segment-quiz-card">
        <button
          className="segment-quiz-close"
          onClick={() => onComplete()}
          aria-label="Fermer"
        >
          ✕
        </button>

        {step < QUESTIONS.length ? (
          <div className="segment-quiz-question">
            <h2>Bienvenue sur DiaspoInvest</h2>
            <p className="segment-quiz-subtext">
              3 petites questions pour te montrer ce qui te sera vraiment utile (20 secondes).
            </p>

            <div className="segment-quiz-progress">
              <div
                className="segment-quiz-progress-bar"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            <h3 className="segment-quiz-text">{QUESTIONS[step].text}</h3>

            <div className="segment-quiz-answers">
              {QUESTIONS[step].answers.map((answer) => (
                <button
                  key={answer.value}
                  className="segment-quiz-answer-btn"
                  onClick={() => handleAnswer(QUESTIONS[step].id, answer.value)}
                >
                  {answer.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="segment-quiz-recommendations">
            <h2>{TITLES[experience]}</h2>
            <p className="segment-quiz-subtext">{GOAL_INTRO[goal]}</p>

            <div className="segment-quiz-reco-items">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className={`segment-quiz-reco-item${item.product ? ' is-product' : ''}`}
                >
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                  <span className="segment-quiz-reco-arrow">→</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleEmailSubmit} className="segment-quiz-email-form">
              <label>Reçois nos conseils sur la bourse africaine par email (facultatif) :</label>
              <div className="segment-quiz-email-group">
                <input
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="segment-quiz-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="segment-quiz-submit"
                >
                  {loading ? '...' : '→'}
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={() => onComplete()}
              className="segment-quiz-done"
            >
              Fermer et explorer le site
            </button>
          </div>
        )}

        <p className="segment-quiz-legal">
          DiaspoInvest · Jamais de spam · Tu peux te désinscrire quand tu veux
        </p>
      </div>
    </div>
  )
}
