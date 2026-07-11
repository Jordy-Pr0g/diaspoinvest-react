import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Événement analytics Plausible (sans cookie). Silencieux si bloqué.
const fireEvent = (name, props) => {
  try { if (typeof window !== 'undefined' && window.plausible) window.plausible(name, props ? { props } : undefined) } catch {}
}

// Liens produits reels (Hotmart)
const GUMROAD = {
  guideEurope: 'https://pay.hotmart.com/F106625297S',
  guideUemoa:  'https://pay.hotmart.com/S106627946N',
  tracker:     'https://pay.hotmart.com/I106628667V',
  packEurope:  'https://pay.hotmart.com/B106692769D',
  packUemoa:   'https://pay.hotmart.com/O106693011E',
}

// Recommandations pilotées par (lieu, niveau, objectif).
// Toujours 3 items, le produit en dernier. Ressources gratuites/articles d'abord.
// I = catalogue d'items (titres/textes traduits + destination). TRACK = config par lieu.
function pickItems(I, TRACK, track, experience, goal) {
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
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(null) // null | 'ok' | 'error'
  const navigate = useNavigate()

  // Catalogue d'items (liens reels : routes, ancre landing, ou produit Gumroad).
  // Construit à chaque rendu pour suivre la langue active.
  const I = {
    artUemoa:          { title: t('quiz.items.artUemoa.title'),          text: t('quiz.items.artUemoa.text'),          to: '/blog/investir-brvm-zone-uemoa' },
    artImpotsUemoa:    { title: t('quiz.items.artImpotsUemoa.title'),    text: t('quiz.items.artImpotsUemoa.text'),    to: '/blog/fiscalite-dividendes-brvm-uemoa' },
    artDepuisEtranger: { title: t('quiz.items.artDepuisEtranger.title'), text: t('quiz.items.artDepuisEtranger.text'), to: '/blog/investir-brvm-depuis-france' },
    artOuvrir:         { title: t('quiz.items.artOuvrir.title'),         text: t('quiz.items.artOuvrir.text'),         to: '/blog/ouvrir-compte-sgi-depuis-etranger' },
    artVsLivret:       { title: t('quiz.items.artVsLivret.title'),       text: t('quiz.items.artVsLivret.text'),       to: '/blog/brvm-vs-livret-a' },
    artImpotsFr:       { title: t('quiz.items.artImpotsFr.title'),       text: t('quiz.items.artImpotsFr.text'),       to: '/blog/declarer-compte-brvm-impots-france' },
    artSonatel:        { title: t('quiz.items.artSonatel.title'),        text: t('quiz.items.artSonatel.text'),        to: '/blog/dividendes-sonatel-2025' },
    artAnalyse:        { title: t('quiz.items.artAnalyse.title'),        text: t('quiz.items.artAnalyse.text'),        to: '/blog/analyser-action-brvm' },
    artValo:           { title: t('quiz.items.artValo.title'),           text: t('quiz.items.artValo.text'),           to: '/blog/juger-cours-action-brvm' },
    artCompteResultat: { title: t('quiz.items.artCompteResultat.title'), text: t('quiz.items.artCompteResultat.text'), to: '/blog/lire-compte-resultat' },
    artSgiFrais:       { title: t('quiz.items.artSgiFrais.title'),       text: t('quiz.items.artSgiFrais.text'),       to: '/blog/sgi-frais-brvm' },
    artVsPea:          { title: t('quiz.items.artVsPea.title'),          text: t('quiz.items.artVsPea.text'),          to: '/blog/brvm-vs-pea-etf' },
    artBourses:        { title: t('quiz.items.artBourses.title'),        text: t('quiz.items.artBourses.text'),        to: '/blog/bourses-africaines-panorama' },

    toolScreener: { title: t('quiz.items.toolScreener.title'), text: t('quiz.items.toolScreener.text'), to: '/screener' },
    toolBacktest: { title: t('quiz.items.toolBacktest.title'), text: t('quiz.items.toolBacktest.text'), to: '/backtest' },
    toolCalc:     { title: t('quiz.items.toolCalc.title'),     text: t('quiz.items.toolCalc.text'),     anchor: 'calculateur' },
    toolFisc:     { title: t('quiz.items.toolFisc.title'),     text: t('quiz.items.toolFisc.text'),     to: '/fiscalite' },

    guideUemoa:  { title: t('quiz.items.guideUemoa.title'),  text: t('quiz.items.guideUemoa.text'),  href: GUMROAD.guideUemoa,  product: true },
    guideEurope: { title: t('quiz.items.guideEurope.title'), text: t('quiz.items.guideEurope.text'), href: GUMROAD.guideEurope, product: true },
    tracker:     { title: t('quiz.items.tracker.title'),     text: t('quiz.items.tracker.text'),     href: GUMROAD.tracker,     product: true },
    packUemoa:   { title: t('quiz.items.packUemoa.title'),   text: t('quiz.items.packUemoa.text'),   href: GUMROAD.packUemoa,   product: true },
    packEurope:  { title: t('quiz.items.packEurope.title'),  text: t('quiz.items.packEurope.text'),  href: GUMROAD.packEurope,  product: true },
  }

  const Q_EXPERIENCE = {
    id: 'experience',
    text: t('quiz.qExperience'),
    answers: [
      { label: t('quiz.expBeginner'), value: 'beginner' },
      { label: t('quiz.expJunior'),   value: 'junior' },
      { label: t('quiz.expAdvanced'), value: 'advanced' },
    ],
  }

  // La 2e question s'adapte au niveau choisi (mots et choix différents par profil).
  const GOAL_QUESTION = {
    beginner: {
      id: 'goal', text: t('quiz.goalBeginner'),
      answers: [
        { label: t('quiz.goalBeginnerLearn'),    value: 'learn' },
        { label: t('quiz.goalBeginnerAnalyze'),  value: 'analyze' },
        { label: t('quiz.goalBeginnerOptimize'), value: 'optimize' },
      ],
    },
    junior: {
      id: 'goal', text: t('quiz.goalJunior'),
      answers: [
        { label: t('quiz.goalJuniorLearn'),    value: 'learn' },
        { label: t('quiz.goalJuniorAnalyze'),  value: 'analyze' },
        { label: t('quiz.goalJuniorOptimize'), value: 'optimize' },
      ],
    },
    advanced: {
      id: 'goal', text: t('quiz.goalAdvanced'),
      answers: [
        { label: t('quiz.goalAdvancedLearn'),    value: 'learn' },
        { label: t('quiz.goalAdvancedAnalyze'),  value: 'analyze' },
        { label: t('quiz.goalAdvancedOptimize'), value: 'optimize' },
      ],
    },
  }

  const Q_LOCATION = {
    id: 'location',
    text: t('quiz.qLocation'),
    answers: [
      { label: t('quiz.locUemoa'),   value: 'uemoa' },
      { label: t('quiz.locAfrique'), value: 'afrique' },
      { label: t('quiz.locMonde'),   value: 'monde' },
    ],
  }

  const TITLES = {
    beginner: t('quiz.titleBeginner'),
    junior:   t('quiz.titleJunior'),
    advanced: t('quiz.titleAdvanced'),
  }
  const GOAL_INTRO = {
    learn:    t('quiz.introLearn'),
    analyze:  t('quiz.introAnalyze'),
    optimize: t('quiz.introOptimize'),
  }

  // Config par lieu : article d'intro, article fiscal, produit d'entrée, produit complet, article d'optimisation.
  // Pour "afrique" (hors UEMOA), les produits géo-spécifiques ne collent pas :
  // on s'appuie sur le Tracker (universel) et il n'y a pas d'article fiscal dédié.
  const TRACK = {
    uemoa:   { intro: I.artUemoa,          tax: I.artImpotsUemoa, entry: I.guideUemoa,  top: I.packUemoa,  compare: I.artSgiFrais },
    afrique: { intro: I.artUemoa,          tax: null,             entry: I.tracker,     top: I.tracker,    compare: I.artBourses },
    monde:   { intro: I.artDepuisEtranger, tax: I.artImpotsFr,    entry: I.guideEurope, top: I.packEurope, compare: I.artVsPea },
  }

  // Articles supplémentaires proposés en "À lire aussi", variés selon le lieu.
  const EXTRAS = {
    uemoa:   [I.artSonatel, I.artVsLivret, I.artBourses, I.artImpotsUemoa],
    afrique: [I.artOuvrir, I.artSgiFrais, I.artBourses, I.artSonatel],
    monde:   [I.artVsLivret, I.artOuvrir, I.artVsPea, I.artSonatel],
  }

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setStep((s) => s + 1)
  }

  const handleNavigate = (item) => {
    if (item.href) {
      if (item.product) fireEvent('clic_produit', { produit: item.title, lieu: answers.location || 'inconnu' })
      else fireEvent('clic_ressource', { ressource: item.title })
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
    if (!email) { onComplete(); return }
    setLoading(true)
    try {
      const r = await fetch('/api/subscribe-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          experience: answers.experience,
          goal: answers.goal,
          location: answers.location,
        }),
      })
      setSent(r.ok ? 'ok' : 'error')
      if (r.ok) fireEvent('quiz_email', { lieu: answers.location || 'inconnu', niveau: answers.experience || 'inconnu' })
    } catch {
      setSent('error')
    }
    setLoading(false)
  }

  // Quiz terminé : l'utilisateur atteint l'écran de recommandations
  useEffect(() => {
    if (step >= 3) {
      fireEvent('quiz_termine', {
        niveau: answers.experience || 'inconnu',
        objectif: answers.goal || 'inconnu',
        lieu: answers.location || 'inconnu',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const experience = answers.experience || 'beginner'
  const goal = answers.goal || 'learn'
  const track = answers.location === 'uemoa' ? 'uemoa'
    : answers.location === 'afrique' ? 'afrique'
    : 'monde'
  const questions = [Q_EXPERIENCE, GOAL_QUESTION[answers.experience || 'beginner'], Q_LOCATION]
  const items = pickItems(I, TRACK, track, experience, goal)
  const mainTitles = new Set(items.map((i) => i.title))
  const extras = (EXTRAS[track] || []).filter((x) => !mainTitles.has(x.title)).slice(0, 3)

  return (
    <div className="segment-quiz-overlay">
      <div className="segment-quiz-card">
        <button
          className="segment-quiz-close"
          onClick={() => onComplete()}
          aria-label={t('quiz.fermer')}
        >
          ✕
        </button>

        {step < questions.length ? (
          <div className="segment-quiz-question">
            <h2>{t('quiz.welcome')}</h2>
            <p className="segment-quiz-subtext">
              {t('quiz.welcomeSub')}
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

            <div className="segment-quiz-more">
              <span className="segment-quiz-more-label">{t('quiz.readAlso')}</span>
              {extras.map((x, i) => (
                <button
                  key={i}
                  type="button"
                  className="segment-quiz-more-link"
                  onClick={() => handleNavigate(x)}
                >
                  {x.title}
                </button>
              ))}
              <button
                type="button"
                className="segment-quiz-more-link segment-quiz-more-all"
                onClick={() => handleNavigate({ to: '/blog' })}
              >
                {t('quiz.allArticles')}
              </button>
            </div>

            {sent === 'ok' ? (
              <div className="segment-quiz-email-form segment-quiz-email-done">
                {t('quiz.emailDone')}
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="segment-quiz-email-form">
                <label>{t('quiz.emailLabel')}</label>
                <div className="segment-quiz-email-group">
                  <input
                    type="email"
                    placeholder={t('quiz.emailPlaceholder')}
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
                {sent === 'error' && (
                  <span className="segment-quiz-email-err">{t('quiz.emailError')}</span>
                )}
              </form>
            )}

            <button
              type="button"
              onClick={() => onComplete()}
              className="segment-quiz-done"
            >
              {t('quiz.close')}
            </button>
          </div>
        )}

        <p className="segment-quiz-legal">
          {t('quiz.legal')}
        </p>
      </div>
    </div>
  )
}
