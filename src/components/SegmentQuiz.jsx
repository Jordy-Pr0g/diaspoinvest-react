import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Liens produits réels (data.js)
const GUMROAD = {
  guideEurope: 'https://diaspoinvest.gumroad.com/l/oxxzda',
  guideUemoa:  'https://diaspoinvest.gumroad.com/l/dpqvqo',
  tracker:     'https://diaspoinvest.gumroad.com/l/tocir',
  packEurope:  'https://diaspoinvest.gumroad.com/l/ecspxh',
  packUemoa:   'https://diaspoinvest.gumroad.com/l/cvkcwo',
}

export default function SegmentQuiz({ onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const questions = [
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
        { label: 'Apprendre les bases', value: 'learn' },
        { label: 'Analyser & choisir des titres', value: 'analyze' },
        { label: 'Optimiser ma fiscalité', value: 'optimize' },
      ],
    },
    {
      id: 'location',
      text: 'Tu es basé en zone UEMOA ou ailleurs ?',
      answers: [
        { label: 'Zone UEMOA', value: 'uemoa' },
        { label: 'Europe', value: 'europe' },
        { label: 'Ailleurs', value: 'other' },
      ],
    },
  ]

  const isUemoa = answers.location === 'uemoa'
  const guideLink = isUemoa ? GUMROAD.guideUemoa : GUMROAD.guideEurope
  const packLink = isUemoa ? GUMROAD.packUemoa : GUMROAD.packEurope

  const recommendations = {
    beginner: {
      title: '🚀 Commence ici',
      intro: 'Tu es au bon endroit ! Voici par où commencer :',
      items: [
        { title: 'Découvre la BRVM et ses opportunités', to: '/blog/investir-brvm-depuis-france', text: 'Pourquoi investir sur la bourse africaine depuis l\'étranger' },
        { title: 'Comment ouvrir un compte ?', to: '/blog/ouvrir-compte-sgi-depuis-etranger', text: 'Les étapes concrètes, même depuis la France' },
        { title: 'Notre Guide complet (14,99 €)', href: guideLink, text: 'Tout pour débuter sereinement, expliqué simplement', product: true },
      ],
    },
    junior: {
      title: '📊 Passe au niveau supérieur',
      intro: 'Tu as les bases, place à l\'analyse :',
      items: [
        { title: 'BRVM vs Livret A : le vrai rendement', to: '/blog/brvm-vs-livret-a', text: 'Combien tu gagnes vraiment en comparaison' },
        { title: 'Screener en direct', to: '/screener', text: 'Les données temps réel pour choisir tes titres' },
        { title: 'Notre Tracker (19,99 € au lieu de 34,99 €)', href: GUMROAD.tracker, text: 'Suis ton portefeuille et simule tes rendements', product: true },
      ],
    },
    advanced: {
      title: '💰 Optimise ta stratégie',
      intro: 'Tu sais investir, optimisons maintenant :',
      items: [
        { title: 'Déclarer ta BRVM aux impôts (France)', to: '/blog/declarer-compte-brvm-impots-france', text: 'Évite la double imposition, légalement' },
        { title: 'Guide fiscalité complet', to: '/fiscalite', text: 'Tous les mécanismes fiscaux expliqués' },
        { title: 'Pack Complet (29,99 €)', href: packLink, text: 'Guide + Tracker, l\'arsenal complet de l\'investisseur', product: true },
      ],
    },
  }

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
    setStep(step + 1)
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

  const segment = answers.experience
  const reco = recommendations[segment] || recommendations.beginner

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

        {step < questions.length ? (
          <div className="segment-quiz-question">
            <h2>Bienvenue sur DiaspoInvest</h2>
            <p className="segment-quiz-subtext">
              Aide-nous à te montrer ce qui te sera le plus utile (20 secondes)
            </p>

            <div className="segment-quiz-progress">
              <div
                className="segment-quiz-progress-bar"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h3 className="segment-quiz-text">{questions[step].text}</h3>

            <div className="segment-quiz-answers">
              {questions[step].answers.map((answer) => (
                <button
                  key={answer.value}
                  className="segment-quiz-answer-btn"
                  onClick={() => handleAnswer(questions[step].id, answer.value)}
                >
                  {answer.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="segment-quiz-recommendations">
            <h2>{reco.title}</h2>
            <p className="segment-quiz-subtext">{reco.intro}</p>

            <div className="segment-quiz-reco-items">
              {reco.items.map((item, idx) => (
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
              <label>Reçois nos conseils personnalisés :</label>
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
