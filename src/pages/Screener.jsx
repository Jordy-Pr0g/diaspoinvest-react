import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getMeta, SECTEURS, PAYS_LABEL } from '../data/brvm-meta.js'
import { useMeta } from '../hooks/useMeta.js'

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const CARD  = 'rgba(255,255,255,0.04)'
const BDR   = 'rgba(255,255,255,0.09)'
const GRIS  = 'rgba(255,255,255,0.4)'
const RED   = '#FF7676'

const fmt = v => Math.round(v).toLocaleString('fr-FR')
const fmtPct = v => (v >= 0 ? '+' : '') + v.toFixed(2).replace('.', ',') + ' %'

// "16/07/2026" -> nombre triable ; sinon null (ex : "A préciser")
const dateKey = s => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ''); return m ? Number(m[3] + m[2] + m[1]) : null }
const estDate = s => dateKey(s) != null

const LABEL_COLORS = {
  'Blue Chip':      { bg: 'rgba(201,168,76,0.15)',  border: 'rgba(201,168,76,0.4)',  color: OR     },
  'Haut Dividende': { bg: 'rgba(46,204,139,0.12)',  border: 'rgba(46,204,139,0.4)',  color: VERT3  },
  'Stable':         { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)' },
  'Croissance':     { bg: 'rgba(99,179,237,0.12)',  border: 'rgba(99,179,237,0.4)',  color: '#63B3ED' },
}

const SORT_OPTIONS = [
  { value: 'date_asc',       label: 'Prochains détachements' },
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

  useMeta({
    title: 'Screener BRVM — Cours et dividendes en temps réel | DiaspoInvest',
    description: 'Consulte les cours, dividendes, rendements et dates de détachement des 47 actions cotées sur la BRVM. Données croisées entre BRVM.org, Sikafinance et Fluxbourse. Filtre par secteur, pays et rendement.',
    url: 'https://diaspoinvest.fr/screener',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/brvm-data').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/brvm-data?dataset=dividendes').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([data, div]) => {
        if (!data?.actions) { setLoading(false); return }
        if (data.genere_le) {
          const d = new Date(data.genere_le)
          setDateData(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }
        // Dividendes croisés multi-sources, indexés par symbole (dates + fiabilité).
        const divBySym = {}
        ;(div?.societes || []).forEach(s => { if (s.symbole) divBySym[s.symbole] = s })

        const enriched = data.actions
          .filter(a => a.cours_cloture > 0)
          .map(a => {
            const meta = getMeta(a.symbole)
            const d = divBySym[a.symbole]
            // Dividende cross-checké prioritaire (ex : SIB 425 officiel) ; sinon méta statique.
            const dividende = d && d.montant_retenu != null ? d.montant_retenu : meta.dividende
            const rendement = dividende ? (dividende / a.cours_cloture) * 100 : null
            return {
              symbole:    a.symbole,
              nom:        a.nom,
              cours:      a.cours_cloture,
              variation:  a.variation_hebdo ?? null,
              volume:     a.volume ?? 0,
              dividende,
              rendement,
              secteur:    meta.secteur,
              pays:       meta.pays,
              label:      meta.label,
              dateEx:       estDate(d?.date_ex) ? d.date_ex : null,
              datePaiement: d?.date_paiement || null,
              officiel:     d?.concordance === 'CONFIRME_OFFICIEL',
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
      if (sortBy === 'date_asc') {
        const ka = dateKey(a.dateEx), kb = dateKey(b.dateEx)
        if (ka && kb) return ka - kb          // les deux ont une date : chronologique
        if (ka) return -1                     // celui qui a une date passe devant
        if (kb) return 1
        return (b.rendement ?? -1) - (a.rendement ?? -1)   // aucun : par rendement
      }
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
    fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600,
    outline: 'none', cursor: 'pointer',
  }

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0D1525 0%, #131E30 50%, #0F1929 100%)',
        paddingTop: 80,
      }}>
        <style>{`
          .screener-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .action-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 14px;
            padding: 16px 20px;
            transition: all .2s;
            cursor: pointer;
            display: grid;
            grid-template-columns: 180px 1fr auto;
            gap: 20px;
            align-items: center;
          }
          .action-card:hover {
            border-color: rgba(201,168,76,0.35);
            background: rgba(201,168,76,0.04);
            transform: translateX(3px);
          }
          .screener-stats {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          .stat-pill {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 30px;
            padding: 6px 16px;
            font-size: 12px;
            color: rgba(255,255,255,0.55);
            font-weight: 600;
          }
          .stat-pill span { color: ${OR}; }
          .chip-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
          .chip {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 5px 13px;
            color: rgba(255,255,255,0.55);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all .15s;
            white-space: nowrap;
          }
          .chip:hover { border-color: rgba(201,168,76,0.4); color: #F1F5F9; }
          .chip.active {
            background: ${OR};
            border-color: ${OR};
            color: #0B1120;
          }
          @media(max-width:768px){
            .action-card { grid-template-columns: 1fr; gap: 10px; }
          }
        `}</style>

        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>

          {/* En-tête */}
          <div style={{ marginBottom: 40 }}>
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
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BDR}`, borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Ligne 1 : recherche + tri */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Rechercher (nom ou code)…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...select, flex: 1, minWidth: 180 }}
              />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...select, width: 'auto', minWidth: 160 }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {(search || secteur !== 'Tous' || pays !== 'Tous' || labelFilter !== 'Tous' || rendMin > 0) && (
                <button onClick={resetFiltres} style={{ fontSize: 12, color: 'rgba(255,100,100,0.65)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ✕ Réinitialiser
                </button>
              )}
            </div>

            {/* Ligne 2 : rendement min */}
            <div className="chip-row">
              <span style={{ fontSize: 11, color: GRIS, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 }}>Rendement</span>
              {[0, 2, 4, 6, 8, 10].map(v => (
                <button key={v} onClick={() => setRendMin(v)} className={`chip${rendMin === v ? ' active' : ''}`}>
                  {v === 0 ? 'Tous' : `≥ ${v} %`}
                </button>
              ))}
            </div>

            {/* Ligne 3 : secteur */}
            <div className="chip-row">
              <span style={{ fontSize: 11, color: GRIS, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 }}>Secteur</span>
              <button onClick={() => setSecteur('Tous')} className={`chip${secteur === 'Tous' ? ' active' : ''}`}>Tous</button>
              {SECTEURS.map(s => (
                <button key={s} onClick={() => setSecteur(s === secteur ? 'Tous' : s)} className={`chip${secteur === s ? ' active' : ''}`}>{s}</button>
              ))}
            </div>

            {/* Ligne 4 : label */}
            <div className="chip-row">
              <span style={{ fontSize: 11, color: GRIS, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 }}>Label</span>
              {['Tous', 'Blue Chip', 'Haut Dividende', 'Stable', 'Croissance'].map(l => (
                <button key={l} onClick={() => setLabelFilter(l)} className={`chip${labelFilter === l ? ' active' : ''}`}>{l}</button>
              ))}
            </div>

            {/* Ligne 5 : pays */}
            <div className="chip-row">
              <span style={{ fontSize: 11, color: GRIS, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 }}>Pays</span>
              <button onClick={() => setPays('Tous')} className={`chip${pays === 'Tous' ? ' active' : ''}`}>Tous</button>
              {Object.entries(PAYS_LABEL).map(([code, label]) => (
                <button key={code} onClick={() => setPays(code === pays ? 'Tous' : code)} className={`chip${pays === code ? ' active' : ''}`}>
                  {label.split(' ')[0]}
                </button>
              ))}
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

                    {/* Colonne gauche : identité */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 17, fontWeight: 900, color: OR, letterSpacing: 0.5 }}>
                          {a.symbole}
                        </span>
                        {a.variation !== null && (
                          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, fontWeight: 700,
                            color: a.variation > 0 ? VERT3 : a.variation < 0 ? RED : GRIS }}>
                            {fmtPct(a.variation)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.35, marginBottom: 8 }}>
                        {a.nom.slice(0, 32)}{a.nom.length > 32 ? '…' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: GRIS }}>
                          {a.secteur}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: GRIS }}>
                          {PAYS_LABEL[a.pays]?.split(' ')[0] || a.pays}
                        </span>
                        {lc && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: lc.bg, border: `1px solid ${lc.border}`, color: lc.color }}>
                            {a.label}
                          </span>
                        )}
                        {a.officiel && (
                          <span title="Dividende confirmé par la source officielle BRVM"
                            style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.35)', color: VERT3 }}>
                            ✓ officiel
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Colonne centre : données clés */}
                    <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Cours</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 16, fontWeight: 900, color: '#F1F5F9' }}>
                          {fmt(a.cours)} <span style={{ fontSize: 10, color: GRIS, fontWeight: 400 }}>FCFA</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Rendement</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 22, fontWeight: 900,
                          color: a.rendement ? OR : 'rgba(255,255,255,0.2)' }}>
                          {a.rendement ? `${a.rendement.toFixed(2).replace('.', ',')} %` : '—'}
                        </div>
                      </div>
                      {a.dividende && (
                        <div>
                          <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Dividende</div>
                          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 700, color: VERT3 }}>
                            {fmt(a.dividende)} F
                          </div>
                        </div>
                      )}
                      {a.dateEx && (
                        <div>
                          <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Détachement</div>
                          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>
                            {a.dateEx}
                            {a.datePaiement && <span style={{ fontSize: 10, color: GRIS, fontWeight: 400 }}> · versé {a.datePaiement}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Colonne droite : CTAs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <Link
                        to={`/screener/${a.symbole}`}
                        style={{
                          display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#F1F5F9',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 8, padding: '8px 14px', transition: 'all .15s', whiteSpace: 'nowrap',
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        Détail →
                      </Link>
                      <Link
                        to={`/backtest?ticker=${a.symbole}`}
                        style={{
                          display: 'inline-block', fontSize: 12, fontWeight: 700, color: OR,
                          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                          borderRadius: 8, padding: '8px 14px', transition: 'all .15s', whiteSpace: 'nowrap',
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        Backtest →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 40, lineHeight: 1.7 }}>
            DiaspoInvest · Données éducatives uniquement · Sources croisées : BRVM.org (officiel) + Sikafinance + Fluxbourse<br />
            {dateData && <>Cours du {dateData} · </>}
            Dividendes et dates de détachement recoupés entre plusieurs sources · Ne constitue pas un conseil en investissement
          </div>
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
