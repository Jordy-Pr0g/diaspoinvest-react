import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useMeta } from '../hooks/useMeta.js'

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const BDR   = 'rgba(255,255,255,0.09)'
const GRIS  = 'rgba(255,255,255,0.4)'
const AMBER = '#E6B450'

const fmt = v => (v == null ? null : Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 0 }))
const fmtPct = v => (v == null ? null : v.toFixed(2).replace('.', ',') + ' %')

// Statut de fiabilité issu du croisement multi-sources du scraper.
const STATUT = {
  CONFIRME_OFFICIEL: { label: 'Officiel BRVM', color: VERT3, bg: 'rgba(46,204,139,0.12)', bd: 'rgba(46,204,139,0.35)' },
  CONFIRME:          { label: '2 sources',     color: OR,    bg: 'rgba(201,168,76,0.12)', bd: 'rgba(201,168,76,0.35)' },
  CALENDRIER_SEUL:   { label: 'Calendrier',    color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.05)', bd: BDR },
  A_CONFIRMER:       { label: 'À confirmer',   color: AMBER, bg: 'rgba(230,180,80,0.10)', bd: 'rgba(230,180,80,0.35)' },
  ECART:             { label: 'À vérifier',    color: AMBER, bg: 'rgba(230,180,80,0.10)', bd: 'rgba(230,180,80,0.35)' },
  SOURCE_UNIQUE:     { label: '1 source',      color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.04)', bd: BDR },
}

// "16/07/2026" -> nombre triable ; sinon null (ex : "A préciser")
const dateKey = s => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '')
  return m ? Number(m[3] + m[2] + m[1]) : null
}
const estDate = s => dateKey(s) != null

function Badge({ statut }) {
  const st = STATUT[statut] || STATUT.SOURCE_UNIQUE
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
      background: st.bg, border: `1px solid ${st.bd}`, color: st.color, whiteSpace: 'nowrap' }}>
      {st.label}
    </span>
  )
}

export default function CalendrierDividendes() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur]   = useState(false)
  const [modal, setModal]     = useState(null)
  const [tri, setTri]         = useState('rendement') // 'rendement' | 'montant'

  useMeta({
    title: 'Calendrier des dividendes BRVM 2026 — dates et montants | DiaspoInvest',
    description: 'Dates de détachement, de paiement et montants nets des dividendes 2026 de la BRVM. Données croisées entre brvm.org (officiel), sikafinance et fluxbourse.',
    url: 'https://diaspoinvest.fr/dividendes',
  })

  useEffect(() => {
    fetch('/api/dividendes')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setErreur(true); setLoading(false) })
    return () => { document.title = 'DiaspoInvest — Investir sur la bourse africaine' }
  }, [])

  const societes = data?.societes || []

  const dateGen = useMemo(() => {
    if (!data?.genere_le) return ''
    return new Date(data.genere_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }, [data])

  // Calendrier : uniquement les sociétés avec une date de détachement réelle.
  const calendrier = useMemo(
    () => societes.filter(s => estDate(s.date_ex)).sort((a, b) => dateKey(a.date_ex) - dateKey(b.date_ex)),
    [societes],
  )

  // Liste complète, triable, sans valeur inventée (on ignore les montants nuls).
  const liste = useMemo(() => {
    const avecMontant = societes.filter(s => s.montant_retenu != null)
    return [...avecMontant].sort((a, b) =>
      tri === 'rendement'
        ? (b.rendement_net ?? -1) - (a.rendement_net ?? -1)
        : (b.montant_retenu ?? -1) - (a.montant_retenu ?? -1),
    )
  }, [societes, tri])

  const nbOfficiel = societes.filter(s => s.concordance === 'CONFIRME_OFFICIEL').length

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0D1525 0%, #131E30 50%, #0F1929 100%)',
        paddingTop: 80,
      }}>
        <style>{`
          .cal-grid { display: flex; flex-direction: column; gap: 8px; }
          .cal-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 14px; padding: 15px 20px;
            display: grid; grid-template-columns: 150px 1fr auto; gap: 18px; align-items: center;
            transition: all .2s;
          }
          .cal-card:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.03); }
          .stat-pill {
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 30px; padding: 6px 16px; font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 600;
          }
          .stat-pill span { color: ${OR}; }
          .seg { display:flex; gap:6px; }
          .seg button {
            background: rgba(255,255,255,0.05); border: 1px solid ${BDR}; color: rgba(255,255,255,0.55);
            border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
          }
          .seg button.on { background:${OR}; border-color:${OR}; color:#0B1120; }
          @media(max-width:768px){ .cal-card { grid-template-columns: 1fr; gap: 10px; } }
        `}</style>

        <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px 60px' }}>

          <Link to="/" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', gap: 6, marginBottom: 20 }}>← Accueil</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>
                Calendrier BRVM 2026
              </span>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'Playfair Display,serif', margin: 0, lineHeight: 1.2 }}>
                Dividendes de la BRVM<br />dates et montants
              </h1>
            </div>
            {dateGen && (
              <div style={{ fontSize: 11, color: GRIS, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BDR}`, borderRadius: 8, padding: '8px 14px', alignSelf: 'flex-start' }}>
                Mis à jour le {dateGen}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRIS }}>Chargement des dividendes…</div>
          ) : erreur || !societes.length ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRIS }}>
              Données indisponibles pour le moment. Réessaie dans quelques minutes.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap' }}>
                <div className="stat-pill"><span>{societes.length}</span> sociétés</div>
                <div className="stat-pill"><span>{calendrier.length}</span> détachements datés</div>
                <div className="stat-pill"><span>{nbOfficiel}</span> confirmés officiel BRVM</div>
              </div>

              {/* Calendrier chronologique */}
              {calendrier.length > 0 && (
                <>
                  <h2 style={{ fontSize: 15, color: '#fff', fontWeight: 800, margin: '0 0 12px' }}>Détachements et paiements</h2>
                  <div className="cal-grid" style={{ marginBottom: 40 }}>
                    {calendrier.map(s => (
                      <div key={s.cle} className="cal-card">
                        <div>
                          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 16, fontWeight: 900, color: OR }}>
                            {s.symbole || '—'}
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
                            {(s.nom || '').slice(0, 26)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Détachement</div>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{s.date_ex}</div>
                          </div>
                          {s.date_paiement && (
                            <div>
                              <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Paiement</div>
                              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{s.date_paiement}</div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Montant net</div>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 900, color: VERT3 }}>
                              {fmt(s.montant_retenu)} <span style={{ fontSize: 10, color: GRIS, fontWeight: 400 }}>F</span>
                            </div>
                          </div>
                          {s.rendement_net != null && (
                            <div>
                              <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Rendement</div>
                              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 900, color: OR }}>{fmtPct(s.rendement_net)}</div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Badge statut={s.concordance} /></div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Liste complète */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, color: '#fff', fontWeight: 800, margin: 0 }}>Toutes les sociétés</h2>
                <div className="seg">
                  <button className={tri === 'rendement' ? 'on' : ''} onClick={() => setTri('rendement')}>Rendement</button>
                  <button className={tri === 'montant' ? 'on' : ''} onClick={() => setTri('montant')}>Montant</button>
                </div>
              </div>
              <div className="cal-grid">
                {liste.map(s => (
                  <div key={s.cle} className="cal-card" style={{ gridTemplateColumns: '150px 1fr auto' }}>
                    <div>
                      <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 16, fontWeight: 900, color: OR }}>{s.symbole || '—'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{(s.nom || '').slice(0, 26)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Div. net (BRVM)</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 900, color: VERT3 }}>{fmt(s.montant_retenu)} <span style={{ fontSize: 10, color: GRIS, fontWeight: 400 }}>F</span></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Net France (31,4 %)</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{s.montant_net_france != null ? `${fmt(s.montant_net_france)} F` : '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6 }}>Rendement net</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 15, fontWeight: 900, color: s.rendement_net != null ? OR : 'rgba(255,255,255,0.2)' }}>{s.rendement_net != null ? fmtPct(s.rendement_net) : '—'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Badge statut={s.concordance} /></div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 40, lineHeight: 1.8 }}>
                Données croisées entre brvm.org (officiel), sikafinance et fluxbourse · Écarts signalés, aucun chiffre inventé<br />
                « Net France » = dividende après flat tax de 31,4 % (12,8 % IR + 18,6 % prélèvements sociaux, 2026)<br />
                Contenu éducatif · Ne constitue pas un conseil en investissement · Non affilié à la BRVM ni au CREPMF
              </div>
            </>
          )}
        </div>
      </main>
      <Footer onOpenModal={setModal} />
    </>
  )
}
