import { useState } from 'react'
import { FAQ_ITEMS } from '../data.js'

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Questions fréquentes</span>
          <h2>Tout ce que tu te demandes</h2>
          <p style={{ color: 'rgba(241,245,249,0.5)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Des réponses directes, sans jargon, sur comment investir sur la BRVM depuis l'étranger.
          </p>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => {
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
          Une question non couverte ?{' '}
          <a href="mailto:contact@diaspoinvest.fr" style={{ color: '#C9A84C', fontWeight: 600 }}>
            Écris-nous
          </a>
        </p>
      </div>
    </section>
  )
}
