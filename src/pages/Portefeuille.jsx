import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useMeta } from '../hooks/useMeta.js'

const OR = '#C9A84C'
const VERT = '#2ECC8B'
const RED = '#FF7676'
const CARD = 'rgba(255,255,255,0.04)'
const BDR = 'rgba(255,255,255,0.09)'
const GRIS = 'rgba(255,255,255,0.45)'

const INITIAL = 1000000 // 1 000 000 FCFA virtuels au départ
const KEY = 'di_portefeuille'

const fmt = v => Math.round(v).toLocaleString('fr-FR')
const pct = v => (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + ' %'
const couleur = v => (v > 0 ? VERT : v < 0 ? RED : GRIS)

const charger = () => {
  try { const p = JSON.parse(localStorage.getItem(KEY)); if (p && p.positions) return p } catch { /* */ }
  return { cash: INITIAL, depot: INITIAL, positions: {} }
}

const PALETTE = ['#C9A84C', '#2ECC8B', '#63B3ED', '#E27BB0', '#F0A35E', '#9B8AE6', '#5BC0BE', '#E5707E']

// Panier v4 — plan d'investissement réel audité (02/07/2026), exécution août-déc 2026
const PLAN_V4 = {
  depot: 1049532,
  positions: {
    SNTS: { qty: 7, pru: 29300 },   // Sonatel — ancre, PER 7,1x, div. 1740 net
    ORAC: { qty: 12, pru: 16700 },  // Orange CI — div. 704 régulier
    PALC: { qty: 20, pru: 8730 },   // Palm CI — agro, +4% vs MM12
    TTLC: { qty: 55, pru: 2950 },   // TotalEnergies CI — énergie
    ONTBF: { qty: 38, pru: 2800 },  // Moov BF — limité à 10% (risque pays)
  },
}

function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.val, 0) || 1
  const R = 54, C = 2 * Math.PI * R
  let acc = 0
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <g transform="translate(70,70) rotate(-90)">
        <circle r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="18" />
        {parts.map((p, i) => {
          const frac = p.val / total
          const el = <circle key={p.label} r={R} fill="none" stroke={PALETTE[i % PALETTE.length]}
            strokeWidth="18" strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} />
          acc += frac
          return el
        })}
      </g>
      <text x="70" y="66" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{parts.length}</text>
      <text x="70" y="82" textAnchor="middle" fontSize="9" fill={GRIS}>ligne(s)</text>
    </svg>
  )
}

export default function Portefeuille() {
  const [actions, setActions] = useState([])
  const [dateData, setDateData] = useState('')
  const [loading, setLoading] = useState(true)
  const [port, setPort] = useState(charger)
  const [sel, setSel] = useState('')
  const [qty, setQty] = useState('')
  const [flash, setFlash] = useState('')
  const [editCapital, setEditCapital] = useState(false)
  const [capitalInput, setCapitalInput] = useState('')

  useMeta({
    title: 'Portefeuille virtuel BRVM — DiaspoInvest',
    description: 'Simule ton portefeuille BRVM sans risque. Ajoute des actions, suis tes plus/moins-values et visualise ton allocation par secteur.',
    url: 'https://diaspoinvest.fr/portefeuille',
  })

  useEffect(() => {
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.actions) {
          setActions(d.actions.filter(a => a.cours_cloture > 0).sort((a, b) => a.nom.localeCompare(b.nom)))
          if (d.genere_le) setDateData(new Date(d.genere_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => { document.title = 'DiaspoInvest — Investir sur la bourse africaine' }
  }, [])

  const sauver = (p) => { setPort(p); try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* */ } }
  const coursDe = sym => actions.find(a => a.symbole === sym)?.cours_cloture || 0
  const notif = m => { setFlash(m); setTimeout(() => setFlash(''), 2500) }

  const action = actions.find(a => a.symbole === sel)
  const coursSel = action?.cours_cloture || 0
  const nQty = Math.max(0, Math.floor(Number(qty) || 0))
  const coutEstime = nQty * coursSel

  function acheter() {
    if (!action || nQty <= 0) return
    if (coutEstime > port.cash) { notif('Liquidités insuffisantes.'); return }
    const pos = port.positions[sel] || { qty: 0, pru: 0 }
    const newQty = pos.qty + nQty
    const newPru = (pos.pru * pos.qty + coursSel * nQty) / newQty
    sauver({ ...port, cash: port.cash - coutEstime, positions: { ...port.positions, [sel]: { qty: newQty, pru: newPru } } })
    notif(`Acheté : ${nQty} ${sel} à ${fmt(coursSel)} FCFA.`)
    setQty('')
  }

  function vendre(sym, vendreQty) {
    const pos = port.positions[sym]; if (!pos) return
    const q = Math.min(vendreQty, pos.qty)
    const cours = coursDe(sym)
    const positions = { ...port.positions }
    if (q >= pos.qty) delete positions[sym]
    else positions[sym] = { ...pos, qty: pos.qty - q }
    sauver({ ...port, cash: port.cash + q * cours, positions })
    notif(`Vendu : ${q} ${sym} à ${fmt(cours)} FCFA.`)
  }

  function reset() {
    if (!window.confirm('Réinitialiser ton portefeuille virtuel ?')) return
    sauver({ cash: INITIAL, depot: INITIAL, positions: {} })
  }

  function chargerPlanV4() {
    if (Object.keys(port.positions).length > 0 && !window.confirm('Remplacer le portefeuille actuel par le plan v4 (5 lignes, 1 049 532 FCFA) ?')) return
    const investi = Object.values(PLAN_V4.positions).reduce((s, p) => s + p.qty * p.pru, 0)
    sauver({ depot: PLAN_V4.depot, cash: PLAN_V4.depot - investi, positions: { ...PLAN_V4.positions } })
    notif('Plan v4 chargé : 5 lignes + coussin de liquidités.')
  }

  function appliquerCapital() {
    const montant = parseInt(capitalInput.replace(/\s/g, '')) || 0
    if (montant < 10000) { notif('Montant minimum : 10 000 FCFA.'); return }
    sauver({ cash: montant, depot: montant, positions: {} })
    setEditCapital(false)
    setCapitalInput('')
    notif(`Capital réinitialisé à ${montant.toLocaleString('fr-FR')} FCFA.`)
  }

  function exportCSV() {
    const rows = [['Symbole', 'Nom', 'Quantite', 'PRU (FCFA)', 'Cours (FCFA)', 'Valeur (FCFA)', 'Gain/Perte (FCFA)', 'Performance (%)']]
    lignes.forEach(l => rows.push([l.sym, l.nom, l.qty, Math.round(l.pru), Math.round(l.cours), Math.round(l.valeur), Math.round(l.gain), l.gainPct.toFixed(2)]))
    rows.push([])
    rows.push(['Liquidites', '', '', '', '', Math.round(port.cash), '', ''])
    rows.push(['Valeur totale', '', '', '', '', Math.round(valeurTotale), '', ''])
    const csv = rows.map(r => r.join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `portefeuille-brvm-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // ── Calculs ──
  const lignes = useMemo(() => Object.entries(port.positions).map(([sym, p]) => {
    const a = actions.find(x => x.symbole === sym)
    const cours = a?.cours_cloture || p.pru
    const valeur = p.qty * cours
    const investi = p.qty * p.pru
    const gain = valeur - investi
    const gainPct = investi ? (gain / investi) * 100 : 0
    return { sym, nom: a?.nom || sym, qty: p.qty, pru: p.pru, cours, valeur, gain, gainPct }
  }).sort((a, b) => b.valeur - a.valeur), [port, actions])

  const valeurTitres = lignes.reduce((s, l) => s + l.valeur, 0)
  const valeurTotale = port.cash + valeurTitres
  const perfGlobale = port.depot ? (valeurTotale / port.depot - 1) * 100 : 0

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: `1px solid ${BDR}`, borderRadius: 10, padding: '11px 12px', color: '#fff', fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0D1525 0%, #131E30 100%)', paddingTop: 80, color: '#fff', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 90px' }}>

          <Link to="/" style={{ fontSize: 13, color: GRIS, marginBottom: 24, display: 'inline-block' }}>← Accueil</Link>
          <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>Portefeuille virtuel</span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '0 0 10px' }}>Entraîne-toi avec de l'argent fictif</h1>
          <p style={{ color: GRIS, fontSize: 15, maxWidth: 640, lineHeight: 1.6, margin: '0 0 8px' }}>
            Tu démarres avec <b style={{ color: '#fff' }}>{fmt(INITIAL)} FCFA virtuels</b>. Achète et vends de vraies actions de la BRVM aux cours réels, suis tes gains, sans risquer un centime. Tout reste sur ton appareil.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 28 }}>
            Cours de clôture {dateData ? `du ${dateData}` : '(BRVM)'}, mis à jour chaque jour. Argent fictif, à but pédagogique. Ce n'est pas un conseil en investissement.
          </p>

          {loading ? (
            <div style={{ color: GRIS, padding: 40 }}>Chargement des cours…</div>
          ) : (
            <>
              {/* Synthèse */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.04))', border: `1px solid rgba(201,168,76,0.35)`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 12, color: OR, fontWeight: 600 }}>Valeur totale</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{fmt(valeurTotale)}</div>
                  <div style={{ fontSize: 12, color: GRIS }}>FCFA</div>
                </div>
                <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 12, color: GRIS, fontWeight: 600 }}>Performance</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4, color: couleur(perfGlobale) }}>{pct(perfGlobale)}</div>
                  <div style={{ fontSize: 12, color: GRIS }}>depuis le départ</div>
                </div>
                <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: GRIS, fontWeight: 600 }}>Liquidités</div>
                    <button onClick={() => { setEditCapital(v => !v); setCapitalInput('') }}
                      style={{ fontSize: 11, color: OR, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                      {editCapital ? 'Annuler' : 'Modifier'}
                    </button>
                  </div>
                  {editCapital ? (
                    <div style={{ marginTop: 10 }}>
                      <input
                        type="number"
                        placeholder="Ex : 500000"
                        value={capitalInput}
                        onChange={e => setCapitalInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && appliquerCapital()}
                        style={{ ...inputStyle, marginBottom: 8, fontSize: 15, fontWeight: 700 }}
                        autoFocus
                      />
                      <div style={{ fontSize: 10, color: GRIS, marginBottom: 8 }}>FCFA · réinitialise les positions</div>
                      <button onClick={appliquerCapital}
                        style={{ background: OR, color: '#0D1525', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 800, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                        Appliquer
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{fmt(port.cash)}</div>
                      <div style={{ fontSize: 12, color: GRIS }}>FCFA disponibles</div>
                    </>
                  )}
                </div>
                <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 12, color: GRIS, fontWeight: 600 }}>Valeur des titres</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{fmt(valeurTitres)}</div>
                  <div style={{ fontSize: 12, color: GRIS }}>{lignes.length} ligne(s)</div>
                </div>
              </div>

              {flash && <div style={{ background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.35)', color: VERT, borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{flash}</div>}

              {/* Passer un ordre */}
              <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Passer un ordre d'achat</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <select value={sel} onChange={e => { setSel(e.target.value); setQty('') }} style={inputStyle}>
                    <option value="" style={{ background: '#15243a', color: '#fff' }}>Choisis une action…</option>
                    {actions.map(a => (
                      <option key={a.symbole} value={a.symbole} style={{ background: '#15243a', color: '#fff' }}>
                        {a.nom} ({a.symbole}) — {fmt(a.cours_cloture)} FCFA
                      </option>
                    ))}
                  </select>
                  {action && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ flex: '1 1 140px' }}>
                        <label style={{ fontSize: 12, color: GRIS, display: 'block', marginBottom: 4 }}>Quantité</label>
                        <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} placeholder="ex : 10" style={inputStyle} />
                      </div>
                      <button onClick={() => setQty(String(Math.floor(port.cash / coursSel)))}
                        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BDR}`, color: GRIS, borderRadius: 10, padding: '11px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Max</button>
                      <button onClick={acheter} disabled={nQty <= 0 || coutEstime > port.cash}
                        style={{ background: OR, color: '#0D1525', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: (nQty <= 0 || coutEstime > port.cash) ? 0.5 : 1 }}>Acheter</button>
                      <div style={{ fontSize: 13, color: GRIS, flexBasis: '100%' }}>
                        Cours : <b style={{ color: '#fff' }}>{fmt(coursSel)} FCFA</b>{nQty > 0 && <> · Coût : <b style={{ color: coutEstime > port.cash ? RED : OR }}>{fmt(coutEstime)} FCFA</b></>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Positions */}
              {lignes.length === 0 ? (
                <div style={{ background: CARD, border: `1px dashed ${BDR}`, borderRadius: 16, padding: 36, textAlign: 'center', color: GRIS }}>
                  Ton portefeuille est vide. Choisis une action ci-dessus et passe ton premier ordre.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr)', gap: 14 }}>
                  <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: 8, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
                      <thead>
                        <tr style={{ color: GRIS, textAlign: 'right' }}>
                          <th style={{ textAlign: 'left', padding: '10px 8px' }}>Action</th>
                          <th style={{ padding: '10px 8px' }}>Qté</th>
                          <th style={{ padding: '10px 8px' }}>PRU</th>
                          <th style={{ padding: '10px 8px' }}>Cours</th>
                          <th style={{ padding: '10px 8px' }}>Valeur</th>
                          <th style={{ padding: '10px 8px' }}>+/-</th>
                          <th style={{ padding: '10px 8px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lignes.map(l => (
                          <tr key={l.sym} style={{ borderTop: `1px solid ${BDR}`, textAlign: 'right' }}>
                            <td style={{ textAlign: 'left', padding: '11px 8px' }}>
                              <div style={{ fontWeight: 700 }}>{l.sym}</div>
                              <div style={{ fontSize: 11, color: GRIS, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.nom}</div>
                            </td>
                            <td style={{ padding: '11px 8px' }}>{l.qty}</td>
                            <td style={{ padding: '11px 8px', color: GRIS }}>{fmt(l.pru)}</td>
                            <td style={{ padding: '11px 8px' }}>{fmt(l.cours)}</td>
                            <td style={{ padding: '11px 8px', fontWeight: 700 }}>{fmt(l.valeur)}</td>
                            <td style={{ padding: '11px 8px', color: couleur(l.gainPct), fontWeight: 700 }}>{pct(l.gainPct)}</td>
                            <td style={{ padding: '11px 8px' }}>
                              <button onClick={() => vendre(l.sym, l.qty)} style={{ background: 'rgba(255,118,118,0.1)', border: '1px solid rgba(255,118,118,0.3)', color: RED, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Vendre</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: GRIS, fontWeight: 600, alignSelf: 'flex-start', marginBottom: 8 }}>Répartition</div>
                    <Donut parts={lignes.map(l => ({ label: l.sym, val: l.valeur }))} />
                    <div style={{ marginTop: 12, width: '100%' }}>
                      {lignes.map((l, i) => (
                        <div key={l.sym} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 5 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % PALETTE.length] }} />
                          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{l.sym}</span>
                          <span style={{ marginLeft: 'auto', color: GRIS }}>{Math.round((l.valeur / (valeurTitres || 1)) * 100)} %</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={chargerPlanV4} style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', color: OR, borderRadius: 10, padding: '9px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Charger mon plan v4</button>
                <button onClick={reset} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: GRIS, borderRadius: 10, padding: '9px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Réinitialiser</button>
                {lignes.length > 0 && (
                  <button onClick={exportCSV} style={{ background: 'transparent', border: `1px solid ${BDR}`, color: GRIS, borderRadius: 10, padding: '9px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Exporter CSV</button>
                )}
                <Link to="/screener" style={{ color: OR, fontSize: 13 }}>Explorer les 47 actions →</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
