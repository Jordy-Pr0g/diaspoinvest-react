import { useEffect, useMemo, useState, useRef } from 'react'

const TAUX_FCFA = 655.957

// Dividendes annuels vérifiés (FCFA/action, dernier exercice fiscal)
const DIV_CONNUS = {
  SNTS:  1740, ORAC: 720,  SGBC: 2062, PALC: 502,
  CBIBF: 900,  SLBC: 2000, STBC: 4800, BOAB: 526,
  BICC:  1500, ECOC: 600,  NTLC: 700,  TTLC: 200,
  TTLS:  180,  BOABF: 200, BOAC: 340,  BOAM: 200,
  BOAN:  300,  BOAS: 250,  NSBC: 550,  SPHC: 500,
  SIBC:  400,  ONTBF: 150, CIEC: 200,  SDCC: 400,
  ORGT:  120,  BICB: 300,  CABC: 200,
}

const NF     = new Intl.NumberFormat('fr-FR')
const fmt    = n => NF.format(Math.round(n))          // 1 000 000
const fmtEUR = n => NF.format(Math.round(n / TAUX_FCFA)) + ' €'

export default function Calculateur() {
  const [apport,    setApport]    = useState(100000)
  const [duree,     setDuree]     = useState(10)
  const [titres,    setTitres]    = useState([])  // [{symbole, nom, cours, taux}]
  const [selIdx,    setSelIdx]    = useState(0)
  const [search,    setSearch]    = useState('')
  const [loadState, setLoadState] = useState('loading') // loading | ok | error
  const [dateData,  setDateData]  = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json || !json.actions) { setLoadState('error'); return }

        if (json.genere_le) {
          const d = new Date(json.genere_le)
          setDateData(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }

        const avecDiv = []
        const sansDiv = []

        json.actions.forEach(a => {
          const c = a.cours_cloture
          if (!c || c <= 0) return
          const div = DIV_CONNUS[a.symbole]
          if (div) {
            avecDiv.push({ symbole: a.symbole, nom: a.nom, cours: c, div, taux: (div / c) * 100 })
          } else {
            sansDiv.push({ symbole: a.symbole, nom: a.nom, cours: c, div: null, taux: null })
          }
        })

        avecDiv.sort((a, b) => b.taux - a.taux)
        sansDiv.sort((a, b) => a.symbole.localeCompare(b.symbole))

        setTitres([...avecDiv, ...sansDiv])
        setLoadState('ok')
      })
      .catch(() => setLoadState('error'))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return titres
    const q = search.toLowerCase()
    return titres.filter(t =>
      t.symbole.toLowerCase().includes(q) || t.nom.toLowerCase().includes(q)
    )
  }, [titres, search])

  const titre = filtered[selIdx] || titres[0] || null
  const taux  = titre?.taux ?? 6.0 // taux par défaut si pas de dividende connu

  const res = useMemo(() => {
    if (!titre) return null
    const capitalInvesti   = apport * 12 * duree
    const dividendeAnnuel  = titre.taux
      ? (capitalInvesti / titre.cours) * titre.div        // calcul actions réelles
      : capitalInvesti * (taux / 100)
    const dividendeMensuel = dividendeAnnuel / 12
    const nbActions        = Math.floor(capitalInvesti / titre.cours)
    return { capitalInvesti, dividendeAnnuel, dividendeMensuel, nbActions }
  }, [apport, duree, titre, taux])

  // Reset index quand la recherche change
  function onSearch(v) { setSearch(v); setSelIdx(0) }

  return (
    <section className="section calculateur" id="calculateur">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" style={{ color: '#E8C46A' }}>Simulateur DCA</span>
          <h2>Combien pourrait te rapporter ton DCA ?</h2>
          <p>
            Choisis un montant mensuel, une durée et une action BRVM.
            {dateData && (
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                {' '}· Cours du {dateData}
              </span>
            )}
          </p>
        </div>

        <div className="calc-shell">
          {/* Panneau de réglages */}
          <div className="calc-panel">

            {/* Recherche + Select action */}
            <div className="calc-field" style={{ marginBottom: 16 }}>
              <label>Action BRVM</label>

              {loadState === 'loading' && (
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, padding: '10px 0' }}>
                  Chargement des cours…
                </div>
              )}
              {loadState === 'error' && (
                <div style={{ color: '#FF7676', fontSize: 13, padding: '10px 0' }}>
                  Données non disponibles. Réessaie dans un instant.
                </div>
              )}

              {loadState === 'ok' && (
                <>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Rechercher (nom ou code)…"
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                    style={{
                      display: 'block', width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderBottom: 'none',
                      borderRadius: '10px 10px 0 0',
                      padding: '10px 14px',
                      color: '#fff',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 13, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <select
                    className="calc-select"
                    value={selIdx}
                    onChange={e => setSelIdx(Number(e.target.value))}
                    style={{ borderRadius: '0 0 10px 10px', marginTop: 0 }}
                  >
                    {filtered.length === 0 && (
                      <option disabled>Aucun résultat</option>
                    )}
                    {filtered.some(t => t.taux) && (
                      <optgroup label="── Avec dividende connu ─────────────">
                        {filtered.filter(t => t.taux).map((t, i) => (
                          <option key={t.symbole} value={filtered.indexOf(t)}>
                            {t.symbole} · {t.nom.slice(0,28)} · {t.taux.toFixed(2).replace('.',',')}%
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {filtered.some(t => !t.taux) && (
                      <optgroup label="── Autres titres ───────────────────">
                        {filtered.filter(t => !t.taux).map((t) => (
                          <option key={t.symbole} value={filtered.indexOf(t)}>
                            {t.symbole} · {t.nom.slice(0,30)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {titre && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 12 }}>
                      <span>Cours : <b style={{ color: '#C9A84C' }}>{fmt(titre.cours)} FCFA</b></span>
                      {titre.taux && <span>Rendement : <b style={{ color: '#2ECC8B' }}>{titre.taux.toFixed(2).replace('.',',')} %</b></span>}
                      {!titre.taux && <span style={{ color: 'rgba(201,168,76,0.5)' }}>Dividende non connu</span>}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sliders */}
            <div className="calc-field">
              <label htmlFor="apport">
                Apport mensuel <span className="val">{fmt(apport)} FCFA</span>
              </label>
              <input id="apport" type="range" min="10000" max="500000" step="10000"
                value={apport} onChange={e => setApport(Number(e.target.value))} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>
                <span>10 000</span><span>500 000 FCFA</span>
              </div>
            </div>

            <div className="calc-field" style={{ marginBottom: 0 }}>
              <label htmlFor="duree">
                Durée d'investissement <span className="val">{duree} ans</span>
              </label>
              <input id="duree" type="range" min="1" max="30" step="1"
                value={duree} onChange={e => setDuree(Number(e.target.value))} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:3 }}>
                <span>1 an</span><span>30 ans</span>
              </div>
            </div>
          </div>

          {/* Panneau de résultats */}
          <div className="calc-result">
            {res && titre ? (
              <>
                <div className="res-label">Dividende annuel estimé</div>
                <div className="res-big">{fmt(res.dividendeAnnuel)} FCFA</div>
                <div className="res-sub">
                  ≈ {fmtEUR(res.dividendeAnnuel)} · soit {fmt(res.dividendeMensuel)} FCFA/mois
                </div>

                <div className="calc-rows">
                  <div className="calc-row">
                    <span>Capital total investi</span>
                    <span>{fmt(res.capitalInvesti)} FCFA</span>
                  </div>
                  <div className="calc-row">
                    <span>Équivalent euros</span>
                    <span>{fmtEUR(res.capitalInvesti)}</span>
                  </div>
                  {titre.cours && (
                    <div className="calc-row">
                      <span>Actions accumulées</span>
                      <span>≈ {res.nbActions} titres {titre.symbole}</span>
                    </div>
                  )}
                  {titre.taux && (
                    <div className="calc-row">
                      <span>Rendement retenu</span>
                      <span style={{ color: '#2ECC8B' }}>{titre.taux.toFixed(2).replace('.',',')} % brut</span>
                    </div>
                  )}
                </div>

                <p className="calc-note">
                  ⚠️ Simulation pédagogique simplifiée, hors variation de cours, réinvestissement
                  et frais de courtage. Dividendes perçus depuis la France soumis au PFU 30 %.
                  Compte à déclarer (formulaire 3916).
                </p>

                <a
                  href="https://diaspoinvest.lemonsqueezy.com/checkout/buy/a57a680d-8503-4ca1-8e80-44906ae9a3c2"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display:'block', textAlign:'center',
                    marginTop:16, padding:'12px',
                    background:'rgba(201,168,76,0.12)',
                    border:'1px solid rgba(201,168,76,0.3)',
                    borderRadius:10,
                    color:'#C9A84C', fontWeight:700, fontSize:13,
                    textDecoration:'none',
                  }}
                >
                  Obtenir le Tracker Dashboard · 24,99 €
                </a>
              </>
            ) : (
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:14, textAlign:'center', padding:'20px 0' }}>
                Sélectionne une action pour voir la simulation.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
