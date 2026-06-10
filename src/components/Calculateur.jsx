import { useMemo, useState } from 'react'
import { ACTIONS_BRVM } from '../data.js'

const TAUX_FCFA = 655.957 // 1 € = 655,957 FCFA (parité fixe)

// Parse "6,11 %" -> 0.0611
function parseRendement(str) {
  return parseFloat(str.replace('%', '').replace(',', '.').trim()) / 100
}

const fmtFCFA = (n) =>
  Math.round(n).toLocaleString('fr-FR').replace(/ /g, ' ') + ' FCFA'
const fmtEUR = (n) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

export default function Calculateur() {
  const [apport, setApport] = useState(100000) // FCFA / mois (DCA prévu Jordan : 100 000)
  const [duree, setDuree] = useState(10) // années
  const [actionIdx, setActionIdx] = useState(0)

  const action = ACTIONS_BRVM[actionIdx]
  const rendement = parseRendement(action.rendement)

  const res = useMemo(() => {
    const capitalInvesti = apport * 12 * duree
    // Dividende annuel estimé sur le capital constitué (approche simplifiée, éducative)
    const dividendeAnnuel = capitalInvesti * rendement
    const dividendeMensuel = dividendeAnnuel / 12
    return {
      capitalInvesti,
      dividendeAnnuel,
      dividendeMensuel,
      capitalEUR: capitalInvesti / TAUX_FCFA,
      dividendeAnnuelEUR: dividendeAnnuel / TAUX_FCFA,
    }
  }, [apport, duree, rendement])

  return (
    <section className="section calculateur" id="calculateur">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" style={{ color: '#E8C46A' }}>
            Simulateur DCA
          </span>
          <h2>Combien pourrait te rapporter ton DCA ?</h2>
          <p>
            Choisis un montant mensuel, une durée et une action BRVM. Estimation éducative et
            simplifiée — les rendements passés ne préjugent pas des rendements futurs.
          </p>
        </div>

        <div className="calc-shell">
          {/* Panneau de réglages */}
          <div className="calc-panel">
            <div className="calc-field">
              <label htmlFor="apport">
                Apport mensuel <span className="val">{fmtFCFA(apport)}</span>
              </label>
              <input
                id="apport"
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={apport}
                onChange={(e) => setApport(Number(e.target.value))}
              />
            </div>

            <div className="calc-field">
              <label htmlFor="duree">
                Durée d’investissement <span className="val">{duree} ans</span>
              </label>
              <input
                id="duree"
                type="range"
                min="1"
                max="30"
                step="1"
                value={duree}
                onChange={(e) => setDuree(Number(e.target.value))}
              />
            </div>

            <div className="calc-field" style={{ marginBottom: 0 }}>
              <label htmlFor="action">
                Action BRVM <span className="val">{action.rendement} de rendement</span>
              </label>
              <select
                id="action"
                className="calc-select"
                value={actionIdx}
                onChange={(e) => setActionIdx(Number(e.target.value))}
              >
                {ACTIONS_BRVM.map((a, i) => (
                  <option key={a.nom} value={i}>
                    {a.nom} — {a.rendement}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Panneau de résultats */}
          <div className="calc-result">
            <div className="res-label">Dividende annuel estimé</div>
            <div className="res-big">{fmtFCFA(res.dividendeAnnuel)}</div>
            <div className="res-sub">
              soit environ {fmtEUR(res.dividendeAnnuelEUR)} · {fmtFCFA(res.dividendeMensuel)} par
              mois
            </div>

            <div className="calc-rows">
              <div className="calc-row">
                <span>Capital total investi</span>
                <span>{fmtFCFA(res.capitalInvesti)}</span>
              </div>
              <div className="calc-row">
                <span>Équivalent en euros</span>
                <span>{fmtEUR(res.capitalEUR)}</span>
              </div>
              <div className="calc-row">
                <span>Action sélectionnée</span>
                <span>{action.nom}</span>
              </div>
            </div>

            <p className="calc-note">
              ⚠️ Estimation simplifiée à but pédagogique (dividende appliqué au capital investi,
              hors réinvestissement et variation de cours). Les dividendes perçus en France sont
              soumis au PFU de 30 % et le compte doit être déclaré (formulaire 3916).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
