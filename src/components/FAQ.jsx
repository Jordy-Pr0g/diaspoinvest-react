import { useState } from 'react'
import { FAQ_ITEMS } from '../data.js'

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Questions fréquentes</span>
          <h2>Tout ce que tu te demandes</h2>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item${isOpen ? ' open' : ''}`} key={item.q}>
                <button
                  className="faq-q"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <span className="sign" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="faq-a">
                  <p>{item.r}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
