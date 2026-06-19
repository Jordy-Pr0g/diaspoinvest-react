import { useMemo, useState } from 'react'

const TAUX_FCFA = 655.957
const NF        = new Intl.NumberFormat('fr-FR')
const fmt       = n => NF.format(Math.round(n))
const fmtEUR    = n => NF.format(Math.round(n / TAUX_FCFA)) + ' €'

export default function Calculateur() {
  // Mode : 'objectif' → je veux X FCFA/mois, combien investir ?
  //        'capital'  → j'investis X/mois, combien je touche ?
  const [mode,   setMode]   = useState('capital')

  // Paramètres communs
  const [duree,  setDuree]  = useState(10)   // années
  const [taux,   setTaux]   = useState(6)    // % rendement annuel

  // Mode capital → combien je touche
  const [apport, setApport] = useState(100000) // FCFA/mois

  // Mode objectif → combien je dois investir
  const [cible,  setCible]  = useState(50000)  // FCFA/mois voulu

  const res = useMemo(() => {
    const capitalTotal = apport * 12 * duree
    const divAnnuel    = capitalTotal * (taux / 100)
    const divMensuel   = divAnnuel / 12

    const capitalNecessaire = (cible * 12) / (taux / 100)
    const apportMensuel     = capitalNecessaire / (12 * duree)

    return { capitalTotal, divAnnuel, divMensuel, capitalNecessaire, apportMensuel }
  }, [apport, duree, taux, cible])

  return (
    <section className="section calculateur" id="calculateur">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" style={{ color: '#E8C46A' }}>Simulateur DCA</span>
          <h2>Combien pourrait te rapporter ton épargne ?</h2>
          <p>Simulation pédagogique. Aucune donnée de marché en temps réel.</p>
        </div>

        {/* Toggle mode */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:32 }}>
          {[
            { id: 'capital',   label: 'J\'investis → je touche combien ?' },
            { id: 'objectif',  label: 'Je veux X FCFA/mois → j\'investis combien ?' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1.5px solid',
                fontSize: 13,
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background:     mode === m.id ? '#C9A84C' : 'rgba(201,168,76,0.08)',
                color:          mode === m.id ? '#0D2B1E' : 'rgba(255,248,231,0.7)',
                borderColor:    mode === m.id ? '#C9A84C' : 'rgba(201,168,76,0.25)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="calc-shell">
          {/* Panneau réglages */}
          <div className="calc-panel">

            {mode === 'capital' ? (
              <div className="calc-field">
                <label htmlFor="apport">
                  Apport mensuel <span className="val">{fmt(apport)} FCFA</span>
                </label>
                <input id="apport" type="range" min="10000" max="500000" step="5000"
                  value={apport} onChange={e => setApport(Number(e.target.value))} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>
                  <span>10 000</span><span>500 000 FCFA</span>
                </div>
              </div>
            ) : (
              <div className="calc-field">
                <label htmlFor="cible">
                  Revenu mensuel visé <span className="val">{fmt(cible)} FCFA</span>
                </label>
                <input id="cible" type="range" min="10000" max="500000" step="5000"
                  value={cible} onChange={e => setCible(Number(e.target.value))} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>
                  <span>10 000</span><span>500 000 FCFA</span>
                </div>
              </div>
            )}

            <div className="calc-field">
              <label htmlFor="duree">
                Durée d'investissement <span className="val">{duree} ans</span>
              </label>
              <input id="duree" type="range" min="1" max="30" step="1"
                value={duree} onChange={e => setDuree(Number(e.target.value))} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>
                <span>1 an</span><span>30 ans</span>
              </div>
            </div>

            <div className="calc-field" style={{ marginBottom: 0 }}>
              <label htmlFor="taux">
                Rendement dividende annuel <span className="val">{taux} %</span>
              </label>
              <input id="taux" type="range" min="1" max="15" step="0.5"
                value={taux} onChange={e => setTaux(Number(e.target.value))} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>
                <span>1 %</span><span>15 %</span>
              </div>
              <div style={{ marginTop:6, fontSize:11, color:'rgba(255,255,255,0.3)' }}>
                Moyenne historique BRVM : ~6 %. Conservatif : 4 %. Optimiste : 8 %.
              </div>
            </div>
          </div>

          {/* Panneau résultats */}
          <div className="calc-result">
            {mode === 'capital' ? (
              <>
                <div className="res-label">Dividende annuel estimé</div>
                <div className="res-big">{fmt(res.divAnnuel)} FCFA</div>
                <div className="res-sub">
                  ≈ {fmtEUR(res.divAnnuel)} · soit {fmt(res.divMensuel)} FCFA/mois
                </div>

                <div className="calc-rows">
                  <div className="calc-row">
                    <span>Capital total investi</span>
                    <span>{fmt(res.capitalTotal)} FCFA</span>
                  </div>
                  <div className="calc-row">
                    <span>Équivalent euros</span>
                    <span>{fmtEUR(res.capitalTotal)}</span>
                  </div>
                  <div className="calc-row">
                    <span>Rendement retenu</span>
                    <span style={{ color: '#2ECC8B' }}>{taux} % brut/an</span>
                  </div>
                  <div className="calc-row">
                    <span>Durée</span>
                    <span>{duree} ans · {duree * 12} versements</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="res-label">Apport mensuel nécessaire</div>
                <div className="res-big">{fmt(res.apportMensuel)} FCFA</div>
                <div className="res-sub">
                  ≈ {fmtEUR(res.apportMensuel)}/mois pendant {duree} ans
                </div>

                <div className="calc-rows">
                  <div className="calc-row">
                    <span>Revenu mensuel visé</span>
                    <span style={{ color: '#C9A84C' }}>{fmt(cible)} FCFA</span>
                  </div>
                  <div className="calc-row">
                    <span>Capital à constituer</span>
                    <span>{fmt(res.capitalNecessaire)} FCFA</span>
                  </div>
                  <div className="calc-row">
                    <span>Équivalent euros</span>
                    <span>{fmtEUR(res.capitalNecessaire)}</span>
                  </div>
                  <div className="calc-row">
                    <span>Rendement retenu</span>
                    <span style={{ color: '#2ECC8B' }}>{taux} % brut/an</span>
                  </div>
                </div>
              </>
            )}

            <p className="calc-note">
              Simulation pédagogique simplifiée, hors variation de cours, réinvestissement
              et frais de courtage. Dividendes perçus depuis la France soumis au PFU 30 %.
              Compte à déclarer (formulaire 3916). Ceci n'est pas un conseil en investissement.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
