import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getMeta, PAYS_LABEL } from '../data/brvm-meta.js'
import { useMeta } from '../hooks/useMeta.js'

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const CARD  = 'rgba(255,255,255,0.04)'
const BDR   = 'rgba(255,255,255,0.09)'
const GRIS  = 'rgba(255,255,255,0.4)'

const fmt = v => Math.round(v).toLocaleString('fr-FR')
const ANNEE_COURANTE = 2025   // dernier exercice de référence

// "DD/MM/YYYY" -> Date, sinon null
const parseDate = s => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '')
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null
}
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const jolieDate = d => `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`

const SORT_OPTIONS = [
  { value: 'rendement_desc', label: 'Rendement ↓' },
  { value: 'montant_desc',   label: 'Montant ↓' },
  { value: 'detach_asc',     label: 'Détachement (le plus proche)' },
  { value: 'nom_asc',        label: 'A → Z' },
]

export default function Dividendes() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [dateData, setDateData] = useState('')
  const [sortBy, setSortBy]   = useState('rendement_desc')
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(null)

  useMeta({
    title: 'Calendrier des dividendes BRVM 2026 · dates de détachement et rendements | DiaspoInvest',
    description: 'Le calendrier des dividendes de la BRVM : prochains détachements, montants par action, rendements et dates de mise en paiement des sociétés cotées. Données croisées BRVM.org, Sikafinance et Fluxbourse.',
    url: 'https://diaspoinvest.fr/dividendes',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/brvm-data').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/brvm-data?dataset=dividendes').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([data, div]) => {
        if (data?.genere_le) {
          setDateData(new Date(data.genere_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }
        const coursBySym = {}
        ;(data?.actions || []).forEach(a => { if (a.symbole) coursBySym[a.symbole] = a.cours_cloture })

        const list = (div?.societes || [])
          .filter(s => s.symbole && s.montant_retenu != null)
          .map(s => {
            const meta = getMeta(s.symbole)
            const cours = coursBySym[s.symbole] || null
            const rendement = (cours && s.montant_retenu) ? (s.montant_retenu / cours) * 100
                              : (s.rendement_net ?? null)
            const exo = parseInt(s.exercice) || null
            return {
              symbole: s.symbole,
              nom: s.nom || meta.nom || s.symbole,
              montant: s.montant_retenu,
              rendement,
              cours,
              exercice: exo,
              ancien: exo != null && exo < ANNEE_COURANTE,
              dateEx: parseDate(s.date_ex),
              datePaiement: s.date_paiement || null,
              officiel: s.concordance === 'CONFIRME_OFFICIEL',
              secteur: meta.secteur,
              pays: meta.pays,
            }
          })
        setRows(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => { document.title = 'DiaspoInvest · Investir sur la bourse africaine' }
  }, [])

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  // Prochains détachements : date_ex >= aujourd'hui, du plus proche au plus lointain
  const aVenir = useMemo(() =>
    rows.filter(r => r.dateEx && r.dateEx >= today).sort((a, b) => a.dateEx - b.dateEx),
  [rows, today])

  const liste = useMemo(() => {
    let res = [...rows]
    if (search.trim()) {
      const q = search.toLowerCase()
      res = res.filter(r => r.symbole.toLowerCase().includes(q) || r.nom.toLowerCase().includes(q))
    }
    res.sort((a, b) => {
      if (sortBy === 'rendement_desc') return (b.rendement ?? -1) - (a.rendement ?? -1)
      if (sortBy === 'montant_desc')   return (b.montant ?? -1) - (a.montant ?? -1)
      if (sortBy === 'nom_asc')        return a.nom.localeCompare(b.nom)
      if (sortBy === 'detach_asc') {
        const ka = a.dateEx ? a.dateEx.getTime() : Infinity
        const kb = b.dateEx ? b.dateEx.getTime() : Infinity
        return ka - kb
      }
      return 0
    })
    return res
  }, [rows, search, sortBy])

  const rendMoyen = rows.length
    ? rows.filter(r => r.rendement).reduce((s, r) => s + r.rendement, 0) / rows.filter(r => r.rendement).length
    : 0

  const select = {
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${BDR}`,
    borderRadius: 10, padding: '9px 14px', color: '#fff',
    fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer',
  }

  const rendColor = r => !r ? 'rgba(255,255,255,0.2)' : r >= 8 ? VERT3 : r >= 5 ? OR : '#F1F5F9'

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0A1F17 0%, #0E2A1F 50%, #0C241B 100%)', paddingTop: 80 }}>
        <style>{`
          .div-grid { display: flex; flex-direction: column; gap: 8px; }
          .div-card {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 14px; padding: 15px 20px; display: grid;
            grid-template-columns: 200px 1fr auto; gap: 20px; align-items: center; transition: all .2s;
          }
          .div-card:hover { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.04); }
          .cal-row {
            display: flex; align-items: center; gap: 18px; padding: 14px 18px;
            background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.18);
            border-left: 4px solid ${OR}; border-radius: 12px;
          }
          .cal-date {
            flex: none; text-align: center; min-width: 66px;
            font-family: 'DM Mono',monospace;
          }
          .stat-pill {
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 30px; padding: 6px 16px; font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 600;
          }
          .stat-pill span { color: ${OR}; }
          .scr-select { color: #fff; } .scr-select option { background: #0E2A1F; color: #F1F5F9; }
          @media(max-width:768px){
            .div-card { grid-template-columns: 1fr; gap: 10px; }
            .cal-row { flex-wrap: wrap; gap: 12px; }
          }
        `}</style>

        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>

          {/* En-tête */}
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Accueil</Link>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>
                  Calendrier des dividendes BRVM
                </span>
                <h1 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'Playfair Display,serif', margin: 0, lineHeight: 1.2 }}>
                  Qui verse, combien,<br />et quand ?
                </h1>
              </div>
              {dateData && (
                <div style={{ fontSize: 11, color: GRIS, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BDR}`, borderRadius: 8, padding: '8px 14px' }}>
                  Cours du {dateData}
                </div>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginTop: 16, maxWidth: 680 }}>
              Le jour du <strong style={{ color: '#F1F5F9' }}>détachement</strong>, l'action se met à coter sans le dividende : son cours baisse mécaniquement du montant versé. Pour toucher le dividende, il faut détenir le titre <strong style={{ color: '#F1F5F9' }}>avant</strong> cette date.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRIS }}>Chargement des dividendes BRVM…</div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <div className="stat-pill"><span>{rows.length}</span> sociétés à dividende</div>
                <div className="stat-pill">Rendement moyen : <span>{rendMoyen.toFixed(2).replace('.', ',')} %</span></div>
                <div className="stat-pill"><span>{aVenir.length}</span> détachement{aVenir.length > 1 ? 's' : ''} à venir</div>
              </div>

              {/* Prochains détachements */}
              <h2 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'Playfair Display,serif', margin: '0 0 14px' }}>
                Prochains détachements
              </h2>
              {aVenir.length === 0 ? (
                <div style={{ color: GRIS, fontSize: 13, background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '18px 20px', marginBottom: 40, lineHeight: 1.6 }}>
                  Aucun détachement annoncé dans les prochaines semaines. La saison des dividendes sur la BRVM se concentre surtout entre <strong style={{ color: '#F1F5F9' }}>avril et août</strong>, après les assemblées générales. Reviens régulièrement, ce calendrier se remplit dès qu'une société publie sa date.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
                  {aVenir.map(r => (
                    <div key={r.symbole} className="cal-row">
                      <div className="cal-date">
                        <div style={{ fontSize: 22, fontWeight: 900, color: OR, lineHeight: 1 }}>{r.dateEx.getDate()}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginTop: 2 }}>{MOIS[r.dateEx.getMonth()]}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <Link to={`/screener/${r.symbole}`} style={{ fontFamily: 'DM Mono,monospace', fontSize: 16, fontWeight: 900, color: OR }}>{r.symbole}</Link>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{r.nom.slice(0, 30)}</span>
                        </div>
                        <div style={{ fontSize: 11, color: GRIS, marginTop: 3 }}>
                          Détachement le {jolieDate(r.dateEx)}{r.datePaiement && ` · versé le ${r.datePaiement}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 18, fontWeight: 900, color: VERT3 }}>{fmt(r.montant)} F</div>
                        {r.rendement && <div style={{ fontSize: 12, color: OR, fontWeight: 700 }}>{r.rendement.toFixed(2).replace('.', ',')} %</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Classement complet */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <h2 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'Playfair Display,serif', margin: 0 }}>
                  Tous les dividendes
                </h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input className="scr-select" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...select, width: 150 }} />
                  <select className="scr-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...select, width: 'auto' }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="div-grid">
                {liste.map(r => (
                  <div key={r.symbole} className="div-card">
                    {/* identité */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <Link to={`/screener/${r.symbole}`} style={{ fontFamily: 'DM Mono,monospace', fontSize: 17, fontWeight: 900, color: OR, letterSpacing: 0.5 }}>{r.symbole}</Link>
                        {r.officiel && (
                          <span title="Dividende confirmé par la source officielle BRVM" style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.35)', color: VERT3 }}>✓ officiel</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.35, margin: '4px 0 6px' }}>{r.nom.slice(0, 30)}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: GRIS }}>{PAYS_LABEL[r.pays]?.split(' ')[0] || r.pays}</span>
                        {r.exercice && (
                          <span title={r.ancien ? "Dernier dividende connu : exercice ancien" : "Exercice le plus récent"}
                            style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                              background: r.ancien ? 'rgba(255,118,118,0.1)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${r.ancien ? 'rgba(255,118,118,0.3)' : 'rgba(255,255,255,0.1)'}`,
                              color: r.ancien ? '#FF9A9A' : GRIS }}>
                            Exercice {r.exercice}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* chiffres */}
                    <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Rendement</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 22, fontWeight: 900, color: rendColor(r.rendement) }}>
                          {r.rendement ? `${r.rendement.toFixed(2).replace('.', ',')} %` : '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Dividende</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 700, color: VERT3 }}>{fmt(r.montant)} F</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Détachement</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 700, color: r.dateEx ? '#F1F5F9' : 'rgba(255,255,255,0.25)' }}>
                          {r.dateEx ? jolieDate(r.dateEx) : 'à préciser'}
                        </div>
                      </div>
                    </div>
                    {/* CTA */}
                    <div style={{ textAlign: 'right' }}>
                      <Link to={`/screener/${r.symbole}`} onClick={e => e.stopPropagation()}
                        style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#F1F5F9', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 14px', whiteSpace: 'nowrap' }}>
                        Détail →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 40, lineHeight: 1.7 }}>
                DiaspoInvest · Données éducatives uniquement · Sources croisées : BRVM.org (officiel) + Sikafinance + Fluxbourse<br />
                Le rendement est calculé sur le dernier cours connu et le dernier dividende par action. Un rendement élevé n'est pas un gage de solidité : il peut refléter une baisse du cours. Ne constitue pas un conseil en investissement.
              </div>
            </>
          )}
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
