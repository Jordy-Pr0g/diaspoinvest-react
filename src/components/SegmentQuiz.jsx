import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Liens produits réels (source : src/data.js)
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
    text: 'Tu investis sur la BRVM depuis combien de temps ?',
    answers: [
      { label: 'Jamais entendu parler', value: 'beginner' },
      { label: 'Moins de 1 an', value: 'junior' },
      { label: 'Plus d\'1 an', value: 'advanced' },
    ],
  },
  {
    id: 'goal',
    text: 'Qu\'est-ce qui t\'intéresse le plus en ce moment ?',
    answers: [
      { label: 'Comprendre et débuter', value: 'learn' },
      { label: 'Choisir mes actions', value: 'analyze' },
      { label: 'Optimiser ma fiscalité', value: 'optimize' },
    ],
  },
  {
    id: 'location',
    text: 'Où vis-tu aujourd\'hui ?',
    answers: [
      { label: 'En zone UEMOA (Afrique de l\'Ouest)', value: 'uemoa' },
      { label: 'En France', value: 'europe' },
      { label: 'Ailleurs (Canada, Belgique…)', value: 'other' },
    ],
  },
]

// Titres + intro par niveau, nuancés par objectif
const TITLES = {
  beginner: '🚀 Commence ici',
  junior: '📊 Passe au niveau supérieur',
  advanced: '💰 Affûte ta stratégie',
}
const GOAL_INTRO = {
  learn: 'On part des bases, étape par étape :',
  analyze: 'Voici de quoi choisir tes actions en confiance :',
  optimize: 'Concentrons-nous sur ce que tu gardes vraiment :',
}

// Matrice : RECOS[track][experience] → 3 items réels
const RECOS = {
  uemoa: {
    beginner: [
      { title: 'Investir sur la BRVM en zone UEMOA', text: 'Le guide du résident : SGI locale, zéro frais de change, plus-values exonérées.', to: '/blog/investir-brvm-zone-uemoa' },
      { title: 'Voir les 47 actions en direct', text: 'Cours et rendements à jour, sans inscription.', to: '/screener' },
      { title: 'Guide PDF UEMOA — 14,99 €', text: 'Tout pour débuter depuis ton pays, expliqué simplement.', href: GUMROAD.guideUemoa, product: true },
    ],
    junior: [
      { title: 'Fiscalité UEMOA : plus-values exonérées', text: 'Ce que tu paies vraiment sur tes dividendes (IRVM pays par pays).', to: '/blog/fiscalite-dividendes-brvm-uemoa' },
      { title: 'Screener en direct', text: 'Filtre les 47 actions par rendement et secteur.', to: '/screener' },
      { title: 'Tracker Dashboard — 19,99 €', text: 'Suis ton portefeuille et simule tes rendements (fiscalité UEMOA).', href: GUMROAD.tracker, product: true },
    ],
    advanced: [
      { title: 'Fiscalité dividendes UEMOA, pays par pays', text: 'IRVM Côte d\'Ivoire, Sénégal, Mali… et plus-values exonérées.', to: '/blog/fiscalite-dividendes-brvm-uemoa' },
      { title: 'Simuler ton DCA sur 30 ans', text: 'Backtest d\'un investissement régulier depuis 1998.', to: '/backtest' },
      { title: 'Pack Complet UEMOA — 29,99 €', text: 'Guide UEMOA + Tracker : l\'arsenal complet du résident.', href: GUMROAD.packUemoa, product: true },
    ],
  },
  diaspora: {
    beginner: [
      { title: 'Investir sur la BRVM depuis la France', text: 'Comment ça marche, ce que ça rapporte, ce qu\'il faut déclarer.', to: '/blog/investir-brvm-depuis-france' },
      { title: 'Ouvrir un compte SGI depuis l\'étranger', text: 'Tout à distance : documents, SGI, frais de virement.', to: '/blog/ouvrir-compte-sgi-depuis-etranger' },
      { title: 'Guide PDF Europe — 14,99 €', text: 'Le plan d\'action complet pour la diaspora en France.', href: GUMROAD.guideEurope, product: true },
    ],
    junior: [
      { title: 'BRVM vs Livret A : la comparaison honnête', text: '1,5 % garanti contre ~6,13 % brut avec risque. Comment combiner les deux.', to: '/blog/brvm-vs-livret-a' },
      { title: 'Screener en direct', text: 'Filtre les 47 actions par rendement et secteur.', to: '/screener' },
      { title: 'Tracker Dashboard — 19,99 €', text: 'Suis ton portefeuille et simule tes rendements (fiscalité France/UEMOA).', href: GUMROAD.tracker, product: true },
    ],
    advanced: [
      { title: 'Déclarer ton compte aux impôts (France)', text: 'Formulaire 3916, flat tax 30 %, éviter la double imposition.', to: '/blog/declarer-compte-brvm-impots-france' },
      { title: 'Calculateur fiscal', text: 'Estime ton imposition réelle selon ta situation.', to: '/fiscalite' },
      { title: 'Pack Complet Europe — 29,99 €', text: 'Guide + Tracker : l\'arsenal complet de la diaspora.', href: GUMROAD.packEurope, product: true },
    ],
  },
  other: {
    beginner: [
      { title: 'Investir sur la BRVM depuis l\'étranger', text: 'Pourquoi et comment investir sur la bourse africaine à distance.', to: '/blog/investir-brvm-depuis-france' },
      { title: 'Ouvrir un compte SGI depuis l\'étranger', text: 'Tout à distance : documents, SGI, frais de virement.', to: '/blog/ouvrir-compte-sgi-depuis-etranger' },
      { title: 'Guide PDF — 14,99 €', text: 'Le plan d\'action complet, étape par étape.', href: GUMROAD.guideEurope, product: true },
    ],
    junior: [
      { title: 'Dividendes Sonatel : combien ça rapporte', text: '1 740 FCFA par action, calculs nets selon ta résidence.', to: '/blog/dividendes-sonatel-2025' },
      { title: 'Screener en direct', text: 'Filtre les 47 actions par rendement et secteur.', to: '/screener' },
      { title: 'Tracker Dashboard — 19,99 €', text: 'Suis ton portefeuille et simule tes rendements.', href: GUMROAD.tracker, product: true },
    ],
    advanced: [
      { title: 'Dividendes Sonatel en détail', text: 'Rendement brut, net, et stratégie de réinvestissement.', to: '/blog/dividendes-sonatel-2025' },
      { title: 'Simuler ton DCA sur 30 ans', text: 'Backtest d\'un investissement régulier depuis 1998.', to: '/backtest' },
      { title: 'Pack Complet — 29,99 €', text: 'Guide + Tracker : l\'arsenal complet de l\'investisseur.', href: GUMROAD.packEurope, product: true },
    ],
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
    : answers.location === 'europe' ? 'diaspora'
    : 'other'
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
              3 questions pour t'orienter vers ce qui te sera vraiment utile (20 secondes)
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
              <label>Reçois nos analyses BRVM par email (facultatif) :</label>
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
          DiaspoInvest · Jamais de spam · Tu peux te désabonner à tout moment
        </p>
      </div>
    </div>
  )
}
