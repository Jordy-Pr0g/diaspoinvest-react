import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getMeta } from '../data/brvm-meta.js'

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const RED   = '#FF7676'
const GRIS  = 'rgba(255,255,255,0.4)'
const BDR   = 'rgba(255,255,255,0.09)'

const fmt     = v => Math.round(v).toLocaleString('fr-FR')
const fmtPct  = v => (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + ' %'
const fmtDate = d => { const dt = new Date(d); return dt.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) }

const TICKERS_POPULAIRES = ['SNTS', 'ORAC', 'SGBC', 'CBIBF', 'STBC', 'NTLC', 'SLBC', 'BOAB']

function runBacktest(history, apport, debut) {
  const mois = history.filter(h => h.date >= debut).sort((a, b) => a.date.localeCompare(b.date))
  if (mois.length < 2) return null

  let actions = 0
  let capitalInvesti = 0
  const courbe = []

  for (const m of mois) {
    if (!m.close || m.close <= 0) continue
    const achetees = Math.floor(apport / m.close)
    actions += achetees
    capitalInvesti += achetees * m.close
    courbe.push({
      date: m.date,
      cours: m.close,
      actionsTotal: actions,
      valeur: actions * m.close,
      investi: capitalInvesti,
    })
  }

  const dernierCours = mois[mois.length - 1]?.close || 0
  const valeurFinale = actions * dernierCours
  const plusValue = valeurFinale - capitalInvesti
  const performance = capitalInvesti > 0 ? (plusValue / capitalInvesti) * 100 : 0

  return { actions, capitalInvesti, valeurFinale, plusValue, performance, courbe, nbMois: mois.length }
}

function MiniChart({ courbe }) {
  if (!courbe || courbe.length < 2) return null
  const W = 600, H = 160, PAD = 20

  const vals = courbe.map(c => c.valeur)
  const invs  = courbe.map(c => c.investi)
  const minV  = Math.min(...vals, ...invs)
  const maxV  = Math.max(...vals, ...invs)
  const range = maxV - minV || 1

  const xScale = i => PAD + (i / (courbe.length - 1)) * (W - PAD * 2)
  const yScale = v => H - PAD - ((v - minV) / range) * (H - PAD * 2)

  const pathValeur  = courbe.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(c.valeur).toFixed(1)}`).join(' ')
  const pathInvesti = courbe.map((c, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(c.investi).toFixed(1)}`).join(' ')

  // Fill under valeur
  const fillPath = pathValeur + ` L${xScale(courbe.length - 1).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={OR} stopOpacity="0.25" />
          <stop offset="100%" stopColor={OR} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#fillGrad)" />
      <path d={pathInvesti} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4,4" />
      <path d={pathValeur} fill="none" stroke={OR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Légende */}
      <g transform={`translate(${PAD},${H - 8})`}>
        <line x1="0" y1="0" x2="16" y2="0" stroke={OR} strokeWidth="2" />
        <text x="20" y="4" fill={GRIS} fontSize="10" fontFamily="DM Mono,monospace">Valeur portefeuille</text>
        <line x1="140" y1="0" x2="156" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,4" />
        <text x="160" y="4" fill={GRIS} fontSize="10" fontFamily="DM Mono,monospace">Capital investi</text>
      </g>
    </svg>
  )
}

export default function Backtest() {
  const [searchParams] = useSearchParams()
  const [modal, setModal] = useState(null)

  const [ticker,   setTicker]   = useState(searchParams.get('ticker') || 'SNTS')
  const [apport,   setApport]   = useState(50000)
  const [debut,    setDebut]    = useState('2020-01-01')
  const [history,  setHistory]  = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [result,   setResult]   = useState(null)

  const meta = getMeta(ticker)

  const loadHistory = useCallback(async (t) => {
    setLoading(true); setError(null); setHistory(null); setResult(null)
    try {
      const r = await fetch(`/api/brvm-history?ticker=${t}`)
      if (!r.ok) throw new Error(`Historique non disponible pour ${t}`)
      const data = await r.json()
      setHistory(data.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = `Backtest DCA ${ticker} — DiaspoInvest`
    loadHistory(ticker)
    return () => { document.title = 'DiaspoInvest — Investir sur la bourse africaine' }
  }, [ticker])

  useEffect(() => {
    if (!history || !apport || !debut) return
    const res = runBacktest(history, apport, debut)
    setResult(res)
  }, [history, apport, debut])

  // Années disponibles dans l'historique
  const yearMin = history && history.length > 0
    ? parseInt(history[0].date.slice(0, 4))
    : 2010

  const input = {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${BDR}`,
    borderRadius: 12, padding: '12px 16px', color: '#fff',
    fontFamily: 'DM Mono,monospace', fontSize: 18, fontWeight: 900,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${BDR}`,
    borderRadius: 16, padding: '20px',
  }

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0D3B2E 0%, #071a10 60%, #050f09 100%)',
        paddingTop: 80,
      }}>
        <div className="container" style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px 60px' }}>

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
              Simule un investissement DCA réel sur des cours historiques officiels BRVM.
            </p>
          </div>

          {/* Sélection ticker */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
              Action
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {TICKERS_POPULAIRES.map(t => (
                <button
                  key={t}
                  onClick={() => setTicker(t)}
                  style={{
                    background: ticker === t ? OR : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${ticker === t ? OR : BDR}`,
                    borderRadius: 8, padding: '7px 14px',
                    color: ticker === t ? '#0D2B1E' : GRIS,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'DM Mono,monospace',
                    transition: 'all .15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ou tape un code (ex: PALC)"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase().trim())}
              onBlur={() => ticker && loadHistory(ticker)}
              style={{ ...input, fontSize: 15, fontWeight: 600 }}
            />
          </div>

          {/* Paramètres */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={card}>
              <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>
                Apport mensuel
              </div>
              <input
                type="number"
                value={apport}
                min="1000"
                step="5000"
                onChange={e => setApport(parseInt(e.target.value) || 0)}
                style={input}
              />
              <div style={{ fontSize: 11, color: GRIS, marginTop: 6, fontFamily: 'DM Mono,monospace' }}>FCFA / mois</div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>
                Depuis
              </div>
              <select
                value={debut}
                onChange={e => setDebut(e.target.value)}
                style={{ ...input, fontSize: 15, fontWeight: 600, appearance: 'none', cursor: 'pointer' }}
              >
                {Array.from({ length: 2026 - yearMin }, (_, i) => {
                  const y = yearMin + i + 1
                  return <option key={y} value={`${y}-01-01`}>Janvier {y}</option>
                }).reverse()}
              </select>
            </div>
          </div>

          {/* États */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: GRIS }}>
              Chargement de l'historique {ticker}…
            </div>
          )}
          {error && (
            <div style={{ background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 12, padding: '16px 20px', color: RED, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Résultats */}
          {result && !loading && (
            <>
              {/* Résultat principal */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(13,59,46,0.6))',
                border: '1.5px solid rgba(201,168,76,0.3)',
                borderRadius: 20, padding: '28px 24px', marginBottom: 16,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${OR}, transparent)` }} />

                <div style={{ fontSize: 12, color: GRIS, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                  {fmt(apport)} FCFA/mois dans {ticker} depuis {new Date(debut).getFullYear()} · {result.nbMois} mois
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Valeur aujourd'hui</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 32, fontWeight: 900, color: OR, lineHeight: 1 }}>
                      {fmt(result.valeurFinale)}
                    </div>
                    <div style={{ fontSize: 11, color: GRIS, fontFamily: 'DM Mono,monospace', marginTop: 4 }}>FCFA</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Capital investi</div>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                      {fmt(result.capitalInvesti)}
                    </div>
                    <div style={{ fontSize: 11, color: GRIS, fontFamily: 'DM Mono,monospace', marginTop: 4 }}>FCFA</div>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Plus-value</div>
                    <div style={{
                      fontFamily: 'DM Mono,monospace', fontSize: 22, fontWeight: 900,
                      color: result.plusValue >= 0 ? VERT3 : RED,
                    }}>
                      {result.plusValue >= 0 ? '+' : ''}{fmt(result.plusValue)} FCFA
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>Performance</div>
                    <div style={{
                      fontFamily: 'DM Mono,monospace', fontSize: 28, fontWeight: 900,
                      color: result.performance >= 0 ? VERT3 : RED,
                    }}>
                      {fmtPct(result.performance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs secondaires */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Actions accumulées', val: `${result.actions.toLocaleString('fr-FR')} titres` },
                  { label: 'Durée', val: `${result.nbMois} mois` },
                  { label: 'Rendement actuel', val: meta.dividende && result.actions
                      ? `${fmt(result.actions * meta.dividende)} FCFA/an`
                      : '—' },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BDR}`, borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 900, color: VERT3, display: 'block', lineHeight: 1, marginBottom: 6 }}>{val}</div>
                    <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Graphique */}
              {result.courbe.length > 3 && (
                <div style={{ ...card, marginBottom: 16, padding: '20px 16px' }}>
                  <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 16 }}>
                    Évolution du portefeuille
                  </div>
                  <MiniChart courbe={result.courbe} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono,monospace', marginTop: 8 }}>
                    <span>{fmtDate(result.courbe[0].date)}</span>
                    <span>{fmtDate(result.courbe[result.courbe.length - 1].date)}</span>
                  </div>
                </div>
              )}

              {/* CTA Tracker */}
              <div style={{
                background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 14, padding: '18px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    Prêt à investir pour de vrai ?
                  </div>
                  <div style={{ fontSize: 12, color: GRIS }}>
                    Le Tracker Dashboard te permet de suivre ton portefeuille réel et simuler ton DCA.
                  </div>
                </div>
                <a
                  href="https://diaspoinvest.gumroad.com/l/tocir"
                  target="_blank" rel="noreferrer"
                  style={{
                    background: OR, color: '#0D2B1E', fontWeight: 700, fontSize: 13,
                    padding: '10px 20px', borderRadius: 10, whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
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
