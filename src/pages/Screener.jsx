import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getMeta, SECTEURS, PAYS_LABEL } from '../data/brvm-meta.js'

const OR    = '#C9A84C'
const VERT  = '#0D3B2E'
const VERT3 = '#2ECC8B'
const CARD  = 'rgba(255,255,255,0.04)'
const BDR   = 'rgba(255,255,255,0.09)'
const GRIS  = 'rgba(255,255,255,0.4)'
const RED   = '#FF7676'

const fmt = v => Math.round(v).toLocaleString('fr-FR')
const fmtPct = v => (v >= 0 ? '+' : '') + v.toFixed(2).replace('.', ',') + ' %'

const LABEL_COLORS = {
  'Blue Chip':      { bg: 'rgba(201,168,76,0.15)',  border: 'rgba(201,168,76,0.4)',  color: OR     },
  'Haut Dividende': { bg: 'rgba(46,204,139,0.12)',  border: 'rgba(46,204,139,0.4)',  color: VERT3  },
  'Stable':         { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)' },
  'Croissance':     { bg: 'rgba(99,179,237,0.12)',  border: 'rgba(99,179,237,0.4)',  color: '#63B3ED' },
}

const SORT_OPTIONS = [
  { value: 'rendement_desc', label: 'Rendement ↓' },
  { value: 'cours_asc',      label: 'Cours ↑' },
  { value: 'cours_desc',     label: 'Cours ↓' },
  { value: 'variation_desc', label: 'Variation ↓' },
  { value: 'nom_asc',        label: 'A → Z' },
]

export default function Screener() {
  const [actions, setActions]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [dateData, setDateData] = useState('')
  const [modal, setModal]       = useState(null)

  // Filtres
  const [search,        setSearch]        = useState('')
  const [secteur,       setSecteur]       = useState('Tous')
  const [pays,          setPays]          = useState('Tous')
  const [labelFilter,   setLabelFilter]   = useState('Tous')
  const [rendMin,       setRendMin]       = useState(0)
  const [sortBy,        setSortBy]        = useState('rendement_desc')

  useEffect(() => {
    document.title = 'Screener BRVM — DiaspoInvest'
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.actions) { setLoading(false); return }
        if (data.genere_le) {
          const d = new Date(data.genere_le)
          setDateData(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }
        const enriched = data.actions
          .filter(a => a.cours_cloture > 0)
          .map(a => {
            const meta = getMeta(a.symbole)
            const rendement = meta.dividende ? (meta.dividende / a.cours_cloture) * 100 : null
            return {
              symbole:    a.symbole,
              nom:        a.nom,
              cours:      a.cours_cloture,
              variation:  a.variation_hebdo ?? null,
              volume:     a.volume ?? 0,
              dividende:  meta.dividende,
              rendement,
              secteur:    meta.secteur,
              pays:       meta.pays,
              label:      meta.label,
            }
          })
        setActions(enriched)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => { document.title = 'DiaspoInvest — Investir sur la bourse africaine' }
  }, [])

  const filtered = useMemo(() => {
    let res = [...actions]

    if (search.trim()) {
      const q = search.toLowerCase()
      res = res.filter(a => a.symbole.toLowerCase().includes(q) || a.nom.toLowerCase().includes(q))
    }
    if (secteur !== 'Tous') res = res.filter(a => a.secteur === secteur)
    if (pays !== 'Tous')    res = res.filter(a => a.pays === pays)
    if (labelFilter !== 'Tous') res = res.filter(a => a.label === labelFilter)
    if (rendMin > 0) res = res.filter(a => a.rendement !== null && a.rendement >= rendMin)

    res.sort((a, b) => {
      if (sortBy === 'rendement_desc') return (b.rendement ?? -1) - (a.rendement ?? -1)
      if (sortBy === 'cours_asc')      return a.cours - b.cours
      if (sortBy === 'cours_desc')     return b.cours - a.cours
      if (sortBy === 'variation_desc') return (b.variation ?? -999) - (a.variation ?? -999)
      if (sortBy === 'nom_asc')        return a.nom.localeCompare(b.nom)
      return 0
    })

    return res
  }, [actions, search, secteur, pays, labelFilter, rendMin, sortBy])

  const nbAvecDiv = actions.filter(a => a.rendement !== null).length
  const rendMoyen = actions.filter(a => a.rendement).reduce((s, a) => s + a.rendement, 0) / (nbAvecDiv || 1)

  function resetFiltres() {
    setSearch(''); setSecteur('Tous'); setPays('Tous')
    setLabelFilter('Tous'); setRendMin(0); setSortBy('rendement_desc')
  }

  const select = {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${BDR}`,
    borderRadius: 10, padding: '9px 14px', color: '#fff',
    fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600,
    outline: 'none', cursor: 'pointer', width: '100%',
  }

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0D3B2E 0%, #071a10 60%, #050f09 100%)',
        paddingTop: 80,
      }}>
        <style>{`
          .screener-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 12px;
          }
          .action-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 18px 18px 14px;
            transition: all .2s;
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          .action-card:hover {
            border-color: rgba(201,168,76,0.4);
            background: rgba(201,168,76,0.05);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          }
          .action-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
            opacity: 0;
            transition: opacity .2s;
          }
          .action-card:hover::before { opacity: 1; }
          .screener-filter-bar {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
          }
          .screener-stats {
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }
          .stat-pill {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 30px;
            padding: 8px 18px;
            font-size: 13px;
            color: rgba(255,255,255,0.6);
            font-weight: 600;
          }
          .stat-pill span { color: ${OR}; }
          @media(max-width:768px){
            .screener-filter-bar { grid-template-columns: 1fr 1fr; }
            .screener-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>

          {/* En-tête */}
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              ← Accueil
            </Link>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>
                  Screener BRVM
                </span>
                <h1 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'Playfair Display,serif', margin: 0, lineHeight: 1.2 }}>
                  Filtre les 47 actions<br />de la bourse africaine
                </h1>
              </div>
              {dateData && (
                <div style={{ fontSize: 11, color: GRIS, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BDR}`, borderRadius: 8, padding: '8px 14px' }}>
                  Cours du {dateData}
                </div>
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="screener-stats">
            <div className="stat-pill">{filtered.length} / {actions.length} actions</div>
            <div className="stat-pill">Rendement moyen : <span>{rendMoyen.toFixed(2).replace('.', ',')} %</span></div>
            <div className="stat-pill"><span>{nbAvecDiv}</span> actions à dividende</div>
          </div>

          {/* Filtres */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BDR}`, borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
            <div className="screener-filter-bar">
              <input
                type="text"
                placeholder="Rechercher (nom ou code)…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...select, gridColumn: 'span 2' }}
              />
              <select value={secteur} onChange={e => setSecteur(e.target.value)} style={select}>
                <option value="Tous">Tous secteurs</option>
                {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={pays} onChange={e => setPays(e.target.value)} style={select}>
                <option value="Tous">Tous pays</option>
                {Object.entries(PAYS_LABEL).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <select value={labelFilter} onChange={e => setLabelFilter(e.target.value)} style={select}>
                <option value="Tous">Tous labels</option>
                <option value="Blue Chip">Blue Chip</option>
                <option value="Haut Dividende">Haut Dividende</option>
                <option value="Stable">Stable</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={select}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Filtre rendement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: GRIS, fontWeight: 600 }}>Rendement min :</span>
              {[0, 2, 4, 6, 8, 10].map(v => (
                <button
                  key={v}
                  onClick={() => setRendMin(v)}
                  style={{
                    background: rendMin === v ? OR : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${rendMin === v ? OR : BDR}`,
                    borderRadius: 20, padding: '5px 14px',
                    color: rendMin === v ? '#0D2B1E' : GRIS,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {v === 0 ? 'Tous' : `≥ ${v} %`}
                </button>
              ))}
              {(search || secteur !== 'Tous' || pays !== 'Tous' || labelFilter !== 'Tous' || rendMin > 0) && (
                <button
                  onClick={resetFiltres}
                  style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,100,100,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Grille d'actions */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRIS }}>Chargement des cours BRVM…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRIS }}>Aucune action ne correspond aux filtres.</div>
          ) : (
            <div className="screener-grid">
              {filtered.map(a => {
                const lc = a.label ? LABEL_COLORS[a.label] : null
                return (
                  <div key={a.symbole} className="action-card">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 900, color: OR, letterSpacing: 1 }}>
                          {a.symbole}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.3 }}>
                          {a.nom.slice(0, 35)}{a.nom.length > 35 ? '…' : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 16, fontWeight: 900, color: '#fff' }}>
                          {fmt(a.cours)}
                        </div>
                        <div style={{ fontSize: 11, color: GRIS, fontFamily: 'DM Mono,monospace' }}>FCFA</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: GRIS }}>
                        {a.secteur}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: GRIS }}>
                        {PAYS_LABEL[a.pays]?.split(' ')[0] || a.pays}
                      </span>
                      {lc && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: lc.bg, border: `1px solid ${lc.border}`, color: lc.color }}>
                          {a.label}
                        </span>
                      )}
                    </div>

                    {/* KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                          Dividende
                        </div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 900, color: a.dividende ? VERT3 : 'rgba(255,255,255,0.25)' }}>
                          {a.dividende ? `${fmt(a.dividende)} F` : '—'}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                          Rendement
                        </div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 900, color: a.rendement ? OR : 'rgba(255,255,255,0.25)' }}>
                          {a.rendement ? `${a.rendement.toFixed(2).replace('.', ',')} %` : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Variation hebdo */}
                    {a.variation !== null && (
                      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: GRIS }}>Variation hebdo</span>
                        <span style={{
                          fontFamily: 'DM Mono,monospace', fontSize: 12, fontWeight: 700,
                          color: a.variation > 0 ? VERT3 : a.variation < 0 ? RED : GRIS,
                        }}>
                          {fmtPct(a.variation)}
                        </span>
                      </div>
                    )}

                    {/* Lien backtest */}
                    <Link
                      to={`/backtest?ticker=${a.symbole}`}
                      style={{
                        display: 'block', marginTop: 14, textAlign: 'center',
                        fontSize: 12, fontWeight: 700, color: OR,
                        background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                        borderRadius: 8, padding: '8px',
                        transition: 'all .15s',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      Backtest DCA →
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 40, lineHeight: 1.7 }}>
            DiaspoInvest · Données éducatives uniquement · Source : BRVM.org + Sikafinance<br />
            {dateData && <>Cours du {dateData} · </>}
            Dividendes : dernier exercice fiscal connu · Ne constitue pas un conseil en investissement
          </div>
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
