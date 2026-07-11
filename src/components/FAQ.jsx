import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FAQ_ITEMS } from '../data.js'

export default function FAQ() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(null)
  const items = i18n.language === 'en' ? t('data.faq', { returnObjects: true }) : FAQ_ITEMS

  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('faq.eyebrow')}</span>
          <h2>{t('faq.titre')}</h2>
          <p style={{ color: 'rgba(241,245,249,0.5)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            {t('faq.sousTitre')}
          </p>
        </div>

        <div className="faq-list">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item${isOpen ? ' open' : ''}`} key={item.q}>
                <button
                  className="faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <svg
                    className="faq-chevron"
                    width="18" height="18" viewBox="0 0 18 18"
                    fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="4 7 9 12 14 7" />
                  </svg>
                </button>
                <div className="faq-a">
                  <p>{item.r}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'rgba(241,245,249,0.35)' }}>
          {t('faq.questionNonCouverte')}{' '}
          <a href="mailto:contact@diaspoinvest.fr" style={{ color: '#C9A84C', fontWeight: 600 }}>
            {t('faq.ecrisNous')}
          </a>
        </p>
      </div>
    </section>
  )
}
