import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getMeta } from '../data/brvm-meta.js'
import { useMeta } from '../hooks/useMeta.js'

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const RED   = '#FF7676'
const GRIS  = 'rgba(255,255,255,0.4)'
const BDR   = 'rgba(255,255,255,0.09)'

const PALETTE = [OR, '#63B3ED', '#E27BB0', '#2ECC8B', '#F0A35E', '#9B8AE6', '#5BC0BE', '#E5707E']

const fmt     = v => Math.round(v).toLocaleString('fr-FR')
const fmtPct  = v => (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + ' %'
const fmtDate = d => { const dt = new Date(d); return dt.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) }

const TICKERS_POPULAIRES = ['SNTS', 'ORAC', 'SGBC', 'CBIBF', 'STBC', 'NTLC', 'SLBC', 'BOAB']

function runBacktest(history, apport, debut, reportSolde = false) {
  const mois = history.filter(h => h.date >= debut).sort((a, b) => a.date.localeCompare(b.date))
  if (mois.length < 2) return null
  let actions = 0, capitalInvesti = 0, solde = 0
  const courbe = []
  for (const m of mois) {
    if (!m.close || m.close <= 0) continue
    const budget = apport + (reportSolde ? solde : 0)
    const achetees = Math.floor(budget / m.close)
    const depense = achetees * m.close
    actions += achetees
    capitalInvesti += depense
    solde = budget - depense
    courbe.push({ date: m.date, cours: m.close, actionsTotal: actions, valeur: actions * m.close, investi: capitalInvesti })
  }
  const dernierCours = mois[mois.length - 1]?.close || 0
  const valeurFinale = actions * dernierCours
  const plusValue = valeurFinale - capitalInvesti
  const performance = capitalInvesti > 0 ? (plusValue / capitalInvesti) * 100 : 0
  return { actions, capitalInvesti, valeurFinale, plusValue, performance, courbe, nbMois: mois.length, soldeRestant: Math.round(solde) }
}

function MiniChart({ courbe }) {
  const [hovered, setHovered] = useState(null)
  if (!courbe || courbe.length < 2) return null
  const W = 600, H = 200, PAD = 20, PAD_TOP = 16
  const vals = courbe.map(c => c.valeur), invs = courbe.map(c => c.investi)
  const minV = Math.min(...vals, ...invs), maxV = Math.max(...vals, ...invs), range = maxV - minV || 1
  const xScale = i => PAD + (i / (courbe.length - 1)) * (W - PAD * 2)
  const yScale = v => PAD_TOP + (1 - (v - minV) / range) * (H - PAD_TOP - PAD)
  const pathValeur  = courbe.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(c.valeur).toFixed(1)}`).join(' ')
  const pathInvesti = courbe.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(c.investi).toFixed(1)}`).join(' ')
  const fillPath = pathValeur + ` L${xScale(courbe.length - 1).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`
  const GRIS2 = '#94A3B8'
  function onMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const idx = Math.round(((e.clientX - rect.left) * (W / rect.width) - PAD) / (W - PAD * 2) * (courbe.length - 1))
    setHovered(Math.max(0, Math.min(courbe.length - 1, idx)))
  }
  const h = hovered !== null ? courbe[hovered] : null
  const hx = hovered !== null ? xScale(hovered) : null
  const perf = h ? ((h.valeur - h.investi) / h.investi * 100) : 0
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={onMouseMove} onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OR} stopOpacity="0.2" />
            <stop offset="100%" stopColor={OR} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#fillGrad)" />
        <path d={pathInvesti} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
        <path d={pathValeur} fill="none" stroke={OR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {hovered !== null && (
          <>
            <line x1={hx} y1={PAD_TOP} x2={hx} y2={H - PAD} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={hx} cy={yScale(courbe[hovered].valeur)} r="5" fill={OR} stroke="#0B1120" strokeWidth="2" />
            <circle cx={hx} cy={yScale(courbe[hovered].investi)} r="4" fill="rgba(255,255,255,0.4)" stroke="#0B1120" strokeWidth="2" />
          </>
        )}
        <g transform={`translate(${PAD},${H - 6})`}>
          <line x1="0" y1="0" x2="16" y2="0" stroke={OR} strokeWidth="2" />
          <text x="20" y="4" fill={GRIS2} fontSize="10" fontFamily="DM Mono,monospace">Valeur portefeuille</text>
          <line x1="148" y1="0" x2="164" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x="168" y="4" fill={GRIS2} fontSize="10" fontFamily="DM Mono,monospace">Capital investi</text>
        </g>
      </svg>
      {h && (
        <div style={{ position: 'absolute', top: 8, left: hovered > courbe.length * 0.6 ? 'auto' : Math.max(0, (hx / W * 100) - 5) + '%', right: hovered > courbe.length * 0.6 ? '4%' : 'auto', background: '#1A2236', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '10px 14px', pointerEvents: 'none', minWidth: 180, zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 11, color: GRIS2, fontFamily: 'DM Mono,monospace', marginBottom: 8, fontWeight: 700 }}>
            {new Date(h.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
          {[
            { label: 'Cours', val: `${Math.round(h.cours).toLocaleString('fr-FR')} FCFA`, color: '#F1F5F9' },
            { label: 'Portefeuille', val: `${Math.round(h.valeur).toLocaleString('fr-FR')} FCFA`, color: OR },
            { label: 'Investi', val: `${Math.round(h.investi).toLocaleString('fr-FR')} FCFA`, color: GRIS2 },
            { label: 'Performance', val: `${perf >= 0 ? '+' : ''}${perf.toFixed(1).replace('.', ',')} %`, color: perf >= 0 ? VERT3 : '#EF4444' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#64748B' }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'DM Mono,monospace' }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Backtest() {
  const [searchParams] = useSearchParams()
  const [modal, setModal] = useState(null)

  // Liste de { sym, apport }
  const [lignes, setLignes] = useState([
    { sym: searchParams.get('ticker') || 'SNTS', apport: 50000 }
  ])
  const [newSym, setNewSym]       = useState('')
  const [debut, setDebut]         = useState('2020-01-01')
  const [reportSolde, setReportSolde] = useState(false)

  // histories et results sont des objets { [sym]: data }
  const [histories, setHistories] = useState({})
  const [loadings,  setLoadings]  = useState({})
  const [results,   setResults]   = useState({})
  const [errors,    setErrors]    = useState({})

  const mainSym = lignes[0]?.sym || 'SNTS'
  const mainMeta = getMeta(mainSym)

  useMeta({
    title: `Backtest DCA ${mainSym} — Simulateur BRVM | DiaspoInvest`,
    description: `Simule un investissement mensuel régulier sur ${mainSym} depuis 1998. Compare plusieurs actions BRVM en DCA.`,
    url: `https://diaspoinvest.fr/backtest?ticker=${mainSym}`,
  })

  const fetchHistory = useCallback(async (sym) => {
    if (!sym) return
    setLoadings(p => ({ ...p, [sym]: true }))
    setErrors(p => ({ ...p, [sym]: null }))
    try {
      const r = await fetch(`/api/brvm-history?ticker=${sym}`)
      if (!r.ok) throw new Error(`Historique non disponible pour ${sym}`)
      const data = await r.json()
      setHistories(p => ({ ...p, [sym]: data.data }))
    } catch (e) {
      setErrors(p => ({ ...p, [sym]: e.message }))
    } finally {
      setLoadings(p => ({ ...p, [sym]: false }))
    }
  }, [])

  // Charger l'historique pour chaque nouveau sym
  useEffect(() => {
    lignes.forEach(l => {
      if (l.sym && !histories[l.sym] && !loadings[l.sym]) fetchHistory(l.sym)
    })
  }, [lignes])

  // Recalculer les résultats quand history/apport/debut changent
  useEffect(() => {
    const next = {}
    lignes.forEach(l => {
      const hist = histories[l.sym]
      if (hist && l.apport && debut) next[l.sym] = runBacktest(hist, l.apport, debut, reportSolde)
    })
    setResults(next)
  }, [histories, lignes, debut, reportSolde])

  const yearMin = (() => {
    const all = Object.values(histories).flat().map(h => parseInt(h.date.slice(0, 4))).filter(Boolean)
    return all.length ? Math.min(...all) : 2010
  })()

  function addLigne() {
    const sym = newSym.toUpperCase().trim()
    if (!sym || lignes.find(l => l.sym === sym)) return
    setLignes(p => [...p, { sym, apport: 50000 }])
    setNewSym('')
  }

  function removeLigne(sym) {
    setLignes(p => p.filter(l => l.sym !== sym))
  }

  function updateApport(sym, val) {
    setLignes(p => p.map(l => l.sym === sym ? { ...l, apport: parseInt(val) || 0 } : l))
  }

  function updateSym(idx, val) {
    const sym = val.toUpperCase().trim()
    setLignes(p => p.map((l, i) => i === idx ? { ...l, sym } : l))
  }

  const input = {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${BDR}`,
    borderRadius: 12, padding: '12px 16px', color: '#fff',
    fontFamily: 'DM Mono,monospace', fontSize: 18, fontWeight: 900,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  const card = {
    background: 'rgba(255,255,255,0.04)', border: `1px solid ${BDR}`,
    borderRadius: 16, padding: '20px',
  }

  const mainResult = results[mainSym]
  const mainError  = errors[mainSym]
  const mainLoading = loadings[mainSym]

  // Comparaison triée par performance décroissante
  const comparaison = lignes
    .map((l, i) => ({ ...l, res: results[l.sym], color: PALETTE[i % PALETTE.length] }))
    .filter(l => l.res)
    .sort((a, b) => b.res.performance - a.res.performance)

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D1525 0%, #131E30 50%, #0F1929 100%)', paddingTop: 80 }}>
        <div className="container" style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 60px' }}>

          {/* En-tête */}
          <div style={{ marginBottom: 32 }}>
            <Link to="/screener" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              ← Screener
            </Link>
            <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>
              Backtest DCA
            </span>
            <h1 style={{ fontSize: '1.9rem', color: '#fff', fontFamily: 'Playfair Display,serif', margin: 0, lineHeight: 1.2 }}>
              Et si tu avais investi<br />avant ?
            </h1>
            <p style={{ fontSize: 14, color: GRIS, marginTop: 10, lineHeight: 1.6 }}>
              Simule un DCA mensuel sur une ou plusieurs actions BRVM. Compare les performances sur la même période.
            </p>
          </div>

          {/* Shortcuts ticker principal */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
              Actions à simuler
            </div>

            {/* Shortcuts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {TICKERS_POPULAIRES.map(t => (
                <button key={t} onClick={() => updateSym(0, t)}
                  style={{ background: mainSym === t ? OR : 'rgba(255,255,255,0.05)', border: `1px solid ${mainSym === t ? OR : BDR}`, borderRadius: 8, padding: '7px 14px', color: mainSym === t ? '#0D2B1E' : GRIS, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Mono,monospace', transition: 'all .15s' }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Liste des lignes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lignes.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                  <input
                    type="text"
                    value={l.sym}
                    onChange={e => updateSym(i, e.target.value)}
                    onBlur={() => l.sym && !histories[l.sym] && fetchHistory(l.sym)}
                    placeholder="Code action"
                    style={{ ...input, fontSize: 15, fontWeight: 700, width: 100, flex: '0 0 100px', padding: '10px 12px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 160 }}>
                    <input
                      type="number"
                      value={l.apport}
                      min="1000"
                      step="5000"
                      onChange={e => updateApport(l.sym, e.target.value)}
                      style={{ ...input, fontSize: 15, fontWeight: 700, padding: '10px 12px' }}
                    />
                    <span style={{ fontSize: 11, color: GRIS, whiteSpace: 'nowrap', fontFamily: 'DM Mono,monospace' }}>FCFA/mois</span>
                  </div>
                  {loadings[l.sym] && <span style={{ fontSize: 11, color: GRIS }}>…</span>}
                  {errors[l.sym] && <span style={{ fontSize: 11, color: RED }}>introuvable</span>}
                  {i > 0 && (
                    <button onClick={() => removeLigne(l.sym)}
                      style={{ background: 'none', border: `1px solid ${BDR}`, color: GRIS, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Ajouter une action */}
            {lignes.length < 8 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <input
                  type="text"
                  placeholder="Ajouter une action (ex: PALC)"
                  value={newSym}
                  onChange={e => setNewSym(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && addLigne()}
                  style={{ ...input, fontSize: 14, fontWeight: 600, flex: 1, padding: '10px 14px' }}
                />
                <button onClick={addLigne}
                  style={{ background: 'rgba(201,168,76,0.12)', border: `1px solid rgba(201,168,76,0.3)`, color: OR, borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Ajouter
                </button>
              </div>
            )}
          </div>

          {/* Date de début */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>
              Depuis
            </div>
            <select value={debut} onChange={e => setDebut(e.target.value)}
              style={{ ...input, fontSize: 15, fontWeight: 600, appearance: 'none', cursor: 'pointer' }}>
              {Array.from({ length: 2026 - yearMin }, (_, i) => {
                const y = yearMin + i + 1
                return <option key={y} value={`${y}-01-01`}>Janvier {y}</option>
              }).reverse()}
            </select>
          </div>

          {/* Option report de solde */}
          <div style={{ ...card, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Reporter le solde non utilisé</div>
              <div style={{ fontSize: 12, color: GRIS, lineHeight: 1.5 }}>
                Le reste non investi chaque mois s'ajoute au budget du mois suivant.
              </div>
            </div>
            <button
              onClick={() => setReportSolde(v => !v)}
              style={{
                flexShrink: 0, width: 52, height: 28, borderRadius: 14,
                background: reportSolde ? OR : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: reportSolde ? 26 : 3,
                width: 22, height: 22, borderRadius: 11,
                background: reportSolde ? '#0D2B1E' : 'rgba(255,255,255,0.5)',
                transition: 'left .2s',
              }} />
            </button>
          </div>

          {/* Chargement / erreur action principale */}
          {mainLoading && <div style={{ textAlign: 'center', padding: '40px 0', color: GRIS }}>Chargement {mainSym}…</div>}
          {mainError && <div style={{ background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 12, padding: '16px 20px', color: RED, fontSize: 14 }}>{mainError}</div>}

          {/* Résultat action principale */}
          {mainResult && !mainLoading && (
            <>
              <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(13,59,46,0.6))', border: '1.5px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '28px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${OR}, transparent)` }} />
                <div style={{ fontSize: 12, color: GRIS, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                  {fmt(lignes[0].apport)} FCFA/mois dans {mainSym} depuis {new Date(debut).getFullYear()} · {mainResult.nbMois} mois
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Valeur aujourd'hui</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 32, fontWeight: 900, color: OR, lineHeight: 1 }}>{fmt(mainResult.valeurFinale)}</div>
                    <div style={{ fontSize: 11, color: GRIS, fontFamily: 'DM Mono,monospace', marginTop: 4 }}>FCFA</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Capital investi</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>{fmt(mainResult.capitalInvesti)}</div>
                    <div style={{ fontSize: 11, color: GRIS, fontFamily: 'DM Mono,monospace', marginTop: 4 }}>FCFA</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Plus-value</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 22, fontWeight: 900, color: mainResult.plusValue >= 0 ? VERT3 : RED }}>
                      {mainResult.plusValue >= 0 ? '+' : ''}{fmt(mainResult.plusValue)} FCFA
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Performance</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 28, fontWeight: 900, color: mainResult.performance >= 0 ? VERT3 : RED }}>
                      {fmtPct(mainResult.performance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs secondaires */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Titres accumulés', val: `${mainResult.actions.toLocaleString('fr-FR')} titres` },
                  { label: 'Durée', val: `${mainResult.nbMois} mois` },
                  reportSolde
                    ? { label: 'Solde en attente', val: `${fmt(mainResult.soldeRestant)} FCFA` }
                    : { label: 'Dividende annuel', val: mainMeta.dividende && mainResult.actions ? `${fmt(mainResult.actions * mainMeta.dividende)} FCFA/an` : '—' },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BDR}`, borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 900, color: VERT3, display: 'block', lineHeight: 1, marginBottom: 6 }}>{val}</div>
                    <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Tableau comparatif si plusieurs actions */}
              {comparaison.length > 1 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BDR}`, borderRadius: 16, padding: '20px', marginBottom: 16, overflowX: 'auto' }}>
                  <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700, marginBottom: 16 }}>
                    Classement des {comparaison.length} actions — même période
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                    <thead>
                      <tr style={{ color: GRIS, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        <th style={{ textAlign: 'left', padding: '6px 10px' }}>#</th>
                        <th style={{ textAlign: 'left', padding: '6px 10px' }}>Action</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px' }}>Apport/mois</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px' }}>Investi</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px' }}>Valeur finale</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px' }}>Plus-value</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px' }}>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparaison.map((l, i) => (
                        <tr key={l.sym} style={{ borderTop: `1px solid ${BDR}` }}>
                          <td style={{ padding: '12px 10px', fontSize: 13, color: GRIS, fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                              <span style={{ fontFamily: 'DM Mono,monospace', fontWeight: 900, color: l.color, fontSize: 14 }}>{l.sym}</span>
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: 12, color: GRIS, fontFamily: 'DM Mono,monospace' }}>{fmt(l.apport)}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: 12, color: GRIS, fontFamily: 'DM Mono,monospace' }}>{fmt(l.res.capitalInvesti)}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#F1F5F9', fontFamily: 'DM Mono,monospace' }}>{fmt(l.res.valeurFinale)}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: l.res.plusValue >= 0 ? VERT3 : RED, fontFamily: 'DM Mono,monospace' }}>
                            {l.res.plusValue >= 0 ? '+' : ''}{fmt(l.res.plusValue)}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: 15, fontWeight: 900, color: l.res.performance >= 0 ? VERT3 : RED, fontFamily: 'DM Mono,monospace' }}>
                            {fmtPct(l.res.performance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                    Classement par performance · toutes les valeurs en FCFA
                  </div>
                </div>
              )}

              {/* Graphique action principale */}
              {mainResult.courbe.length > 3 && (
                <div style={{ ...card, marginBottom: 16, padding: '20px 16px' }}>
                  <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 16 }}>
                    Évolution — {mainSym}
                  </div>
                  <MiniChart courbe={mainResult.courbe} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono,monospace', marginTop: 8 }}>
                    <span>{fmtDate(mainResult.courbe[0].date)}</span>
                    <span>{fmtDate(mainResult.courbe[mainResult.courbe.length - 1].date)}</span>
                  </div>
                </div>
              )}

              {/* CTA Tracker */}
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Prêt à investir pour de vrai ?</div>
                  <div style={{ fontSize: 12, color: GRIS }}>Le Tracker Dashboard te permet de suivre ton portefeuille réel et simuler ton DCA.</div>
                </div>
                <a href="https://pay.hotmart.com/I106628667V" target="_blank" rel="noreferrer"
                  style={{ background: OR, color: '#0D2B1E', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 10, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                  Voir le Tracker →
                </a>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 40, lineHeight: 1.7 }}>
            Données historiques : github.com/Fredysessie/brvm-data-public · Source BRVM officielle<br />
            Simulation basée sur le cours de clôture mensuel · Frais de 0,5 % non déduits · Dividendes non inclus<br />
            Ne constitue pas un conseil en investissement · Performances passées ne préjugent pas des performances futures
          </div>
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
