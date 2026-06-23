import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
    if (step < questions.length - 1) {
      setStep(step + 1)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (email) {
      try {
        await fetch('/api/subscribe-segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            segment: answers.experience,
            goal: answers.goal,
          }),
        }).catch(() => {})
      } catch (err) {
        console.error('Email capture failed:', err)
      }
    }

    setLoading(false)
    routeBySegment(answers.experience)
  }

  const routeBySegment = (segment) => {
    onComplete()
    if (segment === 'beginner') {
      navigate('/guides')
    } else if (segment === 'junior') {
      navigate('/screener')
    } else {
      navigate('/blog')
    }
  }

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
          <div className="segment-quiz-email">
            <h2>Dernière étape</h2>
            <p className="segment-quiz-subtext">
              Ton email pour recevoir les mises à jour (facultatif)
            </p>

            <form onSubmit={handleEmailSubmit}>
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
                {loading ? 'Chargement...' : 'Découvrir mon chemin'}
              </button>

              <button
                type="button"
                onClick={() => routeBySegment(answers.experience)}
                className="segment-quiz-skip"
              >
                Ignorer cette étape
              </button>
            </form>
          </div>
        )}

        <p className="segment-quiz-legal">
          DiaspoInvest · Jamais de spam · Tu peux te désabonner à tout moment
        </p>
      </div>
    </div>
  )
}
