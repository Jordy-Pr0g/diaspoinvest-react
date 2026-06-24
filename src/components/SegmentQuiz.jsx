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
      { label: 'Voir ce que ça pourrait me rapporter', value: 'gain' },
      { label: 'Comprendre les impôts', value: 'tax' },
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
  advanced: 'Tu es à l\'aise ? Passe au niveau au-dessus',
}
const GOAL_INTRO = {
  learn: 'On commence simplement, sans jargon.',
  gain: 'Voici de quoi voir, concrètement, ce que ça pourrait donner.',
  tax: 'Regardons ce qu\'il te reste vraiment, une fois les impôts payés.',
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

// Matrice track x experience. 2 ressources gratuites + 1 produit honnête.
const RECOS = {
  uemoa: {
    beginner: [I.artUemoa, I.toolCalc, I.guideUemoa],
    junior:   [I.toolScreener, I.toolBacktest, I.tracker],
    advanced: [I.artImpotsUemoa, I.toolFisc, I.packUemoa],
  },
  afrique: {
    beginner: [I.artUemoa, I.toolCalc, I.tracker],
    junior:   [I.toolScreener, I.toolBacktest, I.tracker],
    advanced: [I.artSonatel, I.toolFisc, I.tracker],
  },
  monde: {
    beginner: [I.artDepuisEtranger, I.toolCalc, I.guideEurope],
    junior:   [I.toolScreener, I.toolBacktest, I.tracker],
    advanced: [I.artImpotsFr, I.toolFisc, I.packEurope],
  },
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
  const items = RECOS[track][experience]

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
