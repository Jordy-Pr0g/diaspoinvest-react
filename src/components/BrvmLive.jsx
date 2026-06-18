import { useEffect, useState, useRef } from 'react'
import { LIENS } from '../data.js'

const DIV_CONNUS = {
  SNTS:  { div: 1740, nom: 'Sonatel' },
  ORAC:  { div: 720,  nom: 'Orange CI' },
  SGBC:  { div: 2062, nom: 'SGBCI' },
  PALC:  { div: 502,  nom: 'PALMCI' },
  CBIBF: { div: 900,  nom: 'Coris Bank BF' },
  SLBC:  { div: 2000, nom: 'Solibra CI' },
  STBC:  { div: 4800, nom: 'SITAB CI' },
  BOAB:  { div: 526,  nom: 'BOA Bénin' },
  BICC:  { div: 1500, nom: 'BICI CI' },
  ECOC:  { div: 600,  nom: 'Ecobank CI' },
  NTLC:  { div: 700,  nom: 'Nestlé CI' },
  TTLC:  { div: 200,  nom: 'TotalEnergies CI' },
}

// BRVM : Abidjan = UTC+0, séance 9h00–15h30 lun-ven
function isMarketOpen() {
  const now = new Date()
  const day = now.getUTCDay() // 0=dim, 6=sam
  if (day === 0 || day === 6) return false
  const min = now.getUTCHours() * 60 + now.getUTCMinutes()
  return min >= 540 && min < 930 // 9h00–15h30
}

// Noms des entreprises pour les dividendes à venir
const NOM_SOCIETE = {
  SNTS:'Sonatel', ORAC:'Orange CI', SGBC:'SGBCI', PALC:'PALMCI',
  CBIBF:'Coris Bank BF', SLBC:'Solibra CI', STBC:'SITAB CI', BOAB:'BOA Bénin',
  BICC:'BICI CI', ECOC:'Ecobank CI', NTLC:'Nestlé CI', TTLC:'TotalEnergies CI',
  TTLS:'TotalEnergies SN', BOABF:'BOA Burkina', BOAC:'BOA CI', BOAM:'BOA Mali',
  BOAN:'BOA Niger', BOAS:'BOA Sénégal', NSBC:'NSIA Banque CI', SPHC:'SAPH CI',
  SIBC:'SIB CI', ONTBF:'ONATEL BF', CIEC:'CIE CI', ORGT:'Oragroup TG',
  SDCC:'SODE CI', ETIT:'Ecobank TG', BICB:'BICIB Bénin', CABC:'SICABLE CI',
  PRSC:'PRESTIGE CI', SEMC:'SETAO CI', SDSC:'SOLIDE CI', SICC:'SICOGI CI',
  SIVC:'SIVOP CI', SMBC:'SMB CI', SOGC:'SOGB CI', STAC:'SETRAM CI',
  UNLC:'UNILEVER CI', UNXC:'UNIXX CI', ABJC:'ABIDJAN EXP', BNBC:'BNI CI',
  BOAM:'BOA Mali', BOAS:'BOA SN', CFAC:'CFAO CI', FTSC:'FILTISAC CI',
  LNBB:'LNB BF', NEIC:'NEI CI', NTLC:'Nestlé CI', SCRC:'SUCRIVOIRE CI',
}

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const RED   = '#FF6B6B'
const CARD  = '#0F1A12'
const BDR   = '#1E2E21'

const fmt = n => Math.round(n).toLocaleString('fr-FR')

function Badge({ children, color = OR }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}18`,
      border: `1px solid ${color}30`,
      borderRadius: 6, padding: '2px 8px',
      fontSize: 10, fontWeight: 700, color,
      textTransform: 'uppercase', letterSpacing: 0.8,
    }}>{children}</span>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BDR}`,
      borderRadius: 16, padding: '18px 18px',
      ...style,
    }}>{children}</div>
  )
}

function CardTitle({ children }) {
  return (
    <div style={{
      fontSize: 10, textTransform: 'uppercase', letterSpacing: 2,
      color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 14,
      fontFamily: 'Space Grotesk, sans-serif',
    }}>{children}</div>
  )
}

export default function BrvmLive() {
  const [date,     setDate]     = useState('')
  const [topDiv,   setTopDiv]   = useState([])
  const [hausse,   setHausse]   = useState([])
  const [baisse,   setBaisse]   = useState([])
  const [stats,    setStats]    = useState({ total:0, enHausse:0, enBaisse:0, stable:0 })
  const [divNext,  setDivNext]  = useState([])
  const [ticker,   setTicker]   = useState([])
  const tickerRef = useRef(null)

  useEffect(() => {
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json) return

        if (json.genere_le) {
          const d = new Date(json.genere_le)
          setDate(d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }))
        }

        const actions = json.actions || []
        const avecVariation = actions.filter(a => a.variation_pct !== undefined && a.variation_pct !== null)

        // Stats marché
        const enH  = avecVariation.filter(a => a.variation_pct > 0).length
        const enB  = avecVariation.filter(a => a.variation_pct < 0).length
        const stab = avecVariation.filter(a => a.variation_pct === 0).length
        setStats({ total: actions.length, enHausse: enH, enBaisse: enB, stable: stab })

        // Top 5 hausses
        setHausse(
          avecVariation
            .filter(a => a.variation_pct > 0 && a.cours_cloture > 0)
            .sort((a,b) => b.variation_pct - a.variation_pct)
            .slice(0, 5)
        )
        // Top 5 baisses
        setBaisse(
          avecVariation
            .filter(a => a.variation_pct < 0 && a.cours_cloture > 0)
            .sort((a,b) => a.variation_pct - b.variation_pct)
            .slice(0, 5)
        )

        // Top dividendes
        const td = actions
          .filter(a => DIV_CONNUS[a.symbole] && a.cours_cloture > 0)
          .map(a => ({
            symbole: a.symbole,
            nom: DIV_CONNUS[a.symbole].nom,
            cours: a.cours_cloture,
            div: DIV_CONNUS[a.symbole].div,
            taux: (DIV_CONNUS[a.symbole].div / a.cours_cloture) * 100,
          }))
          .sort((a,b) => b.taux - a.taux)
          .slice(0, 8)
        setTopDiv(td)

        // Dividendes à venir
        setDivNext(json.dividendes_a_venir || [])

        // Ticker
        const tkr = avecVariation
          .filter(a => a.cours_cloture > 0)
          .map(a => ({ symbole: a.symbole, cours: a.cours_cloture, variation: a.variation_pct }))
        setTicker([...tkr, ...tkr])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!tickerRef.current || ticker.length === 0) return
    tickerRef.current.style.setProperty('--tw', `${tickerRef.current.scrollWidth / 2}px`)
  }, [ticker])

  const maxTaux = topDiv.length > 0 ? Math.max(...topDiv.map(t => t.taux)) : 1

  return (
    <section id="marche" style={{ padding: '64px 0 48px', borderTop: `1px solid ${BDR}` }}>
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(calc(-1 * var(--tw,2000px)))} }
        .tk-track { display:inline-flex; animation:ticker 40s linear infinite; }
        .tk-track:hover { animation-play-state:paused; }
        .mv-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .mv-row:last-child { border-bottom:none; }
        .pulse-dot { width:7px;height:7px;border-radius:50%;background:${VERT3};animation:pulseAnim 1.5s ease-in-out infinite; }
        @keyframes pulseAnim { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
      `}</style>

      <div className="container">

        {/* En-tête */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:28 }}>
          <div>
            <span className="eyebrow">Marché BRVM</span>
            <h2 style={{ marginTop:6, marginBottom:0 }}>Bourse Régionale des Valeurs Mobilières</h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:6 }}>
              Zone UEMOA · 8 pays · {stats.total} actions cotées
              {date && <span> · Clôture du {date}</span>}
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
            {/* Statut marché */}
            {(() => {
              const ouvert = isMarketOpen()
              return (
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background: ouvert ? 'rgba(46,204,139,0.1)' : 'rgba(255,107,107,0.1)',
                  border: `1px solid ${ouvert ? 'rgba(46,204,139,0.3)' : 'rgba(255,107,107,0.3)'}`,
                  borderRadius:20, padding:'5px 14px',
                  fontSize:11, fontWeight:700,
                  color: ouvert ? VERT3 : RED,
                  letterSpacing:0.5,
                }}>
                  <span style={{
                    width:7, height:7, borderRadius:'50%',
                    background: ouvert ? VERT3 : RED,
                    animation: ouvert ? 'pulseAnim 1.5s ease-in-out infinite' : 'none',
                    flexShrink:0,
                  }} />
                  {ouvert ? 'Marché ouvert' : 'Marché fermé'}
                </div>
              )
            })()}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div className="pulse-dot" />
              <span style={{ fontSize:11, fontWeight:700, color:VERT3, textTransform:'uppercase', letterSpacing:1 }}>Données live</span>
            </div>
          </div>
        </div>

        {/* Ticker */}
        {ticker.length > 0 && (
          <div style={{ overflow:'hidden', background:'#060E09', border:`1px solid ${BDR}`, borderRadius:10, padding:'8px 0', marginBottom:24 }}>
            <div ref={tickerRef} className="tk-track">
              {ticker.map((t, i) => (
                <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'2px 18px', whiteSpace:'nowrap', borderRight:`1px solid ${BDR}` }}>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{t.symbole}</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color: t.variation >= 0 ? VERT3 : RED }}>
                    {t.variation >= 0 ? '▲' : '▼'} {Math.abs(t.variation).toFixed(2).replace('.',',')}%
                  </span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'rgba(255,255,255,0.3)' }}>{fmt(t.cours)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4 stats rapides */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {[
            { val: stats.total,     label: 'Actions cotées',  color: OR },
            { val: stats.enHausse,  label: 'En hausse',       color: VERT3 },
            { val: stats.enBaisse,  label: 'En baisse',       color: RED },
            { val: stats.stable,    label: 'Stables',         color: 'rgba(255,255,255,0.4)' },
          ].map(s => (
            <Card key={s.label} style={{ textAlign:'center', padding:'14px 10px' }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:900, color:s.color }}>{s.val || 0}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5, marginTop:4 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* 3 colonnes : hausses / baisses / dividendes à venir */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:20 }}>

          {/* Hausses */}
          <Card>
            <CardTitle>Top hausses du jour</CardTitle>
            {hausse.length === 0
              ? <div style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>Données indisponibles</div>
              : hausse.map(a => (
                <div className="mv-row" key={a.symbole}>
                  <div>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#fff' }}>{a.symbole}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{fmt(a.cours_cloture)} FCFA</div>
                  </div>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:VERT3 }}>
                    ▲ {a.variation_pct.toFixed(2).replace('.',',')} %
                  </span>
                </div>
              ))
            }
          </Card>

          {/* Baisses */}
          <Card>
            <CardTitle>Top baisses du jour</CardTitle>
            {baisse.length === 0
              ? <div style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>Données indisponibles</div>
              : baisse.map(a => (
                <div className="mv-row" key={a.symbole}>
                  <div>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#fff' }}>{a.symbole}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{fmt(a.cours_cloture)} FCFA</div>
                  </div>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:RED }}>
                    ▼ {Math.abs(a.variation_pct).toFixed(2).replace('.',',')} %
                  </span>
                </div>
              ))
            }
          </Card>

          {/* Dividendes à venir */}
          <Card>
            <CardTitle>Prochains détachements</CardTitle>
            {divNext.length === 0
              ? <div style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>Aucun détachement prévu</div>
              : divNext.slice(0, 5).map((d, i) => {
                const sym  = d.symbole || d.titre || '?'
                const nom  = NOM_SOCIETE[sym] || sym
                const date = d.date_detachement || d.date || ''
                // Formatage de la date si ISO
                const dateAff = date ? (() => {
                  try {
                    return new Date(date).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
                  } catch { return date }
                })() : ''
                return (
                  <div className="mv-row" key={i}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{nom}</div>
                      <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{sym}</div>
                    </div>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, fontWeight:700, color:OR }}>
                      {dateAff}
                    </span>
                  </div>
                )
              })
            }
          </Card>
        </div>

        {/* Rendements dividende — tableau complet */}
        <Card style={{ marginBottom:20 }}>
          <CardTitle>Rendements dividende</CardTitle>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10 }}>
            {topDiv.map(t => (
              <div key={t.symbole} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.025)', borderRadius:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#fff' }}>{t.symbole}</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginLeft:8 }}>{t.nom}</span>
                  </div>
                  <span style={{ fontFamily:'DM Mono,monospace', fontWeight:900, fontSize:15, color:OR }}>
                    {t.taux.toFixed(2).replace('.',',')} %
                  </span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${(t.taux/maxTaux)*100}%`, height:'100%', background:`linear-gradient(90deg,${OR},#F0D080)`, borderRadius:2, transition:'width 1s ease' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:4 }}>
                  <span>Cours : {fmt(t.cours)} FCFA</span>
                  <span>Div. : {fmt(t.div)} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA subtil */}
        <div style={{
          background:'linear-gradient(135deg,rgba(13,59,46,0.7),rgba(6,21,10,0.9))',
          border:`1px solid rgba(201,168,76,0.18)`,
          borderRadius:14, padding:'20px 22px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:14,
        }}>
          <div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>
              Suis ces 47 actions mois par mois
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
              Le Tracker Dashboard calcule tes dividendes nets, suit ton portefeuille et t'alerte sur les détachements.
            </div>
          </div>
          <a href={LIENS.calculateur} target="_blank" rel="noreferrer" style={{
            display:'inline-block', background:OR, color:'#0D2B1E',
            fontFamily:'Space Grotesk,sans-serif', fontWeight:900, fontSize:13,
            padding:'12px 20px', borderRadius:10, textDecoration:'none',
            whiteSpace:'nowrap', flexShrink:0,
          }}>
            Voir le Tracker · 24,99 €
          </a>
        </div>

        <div style={{ textAlign:'center', marginTop:12, fontSize:10, color:'rgba(255,255,255,0.18)', lineHeight:1.7 }}>
          Sources : brvm.org · sikafinance.com · Non affilié à la BRVM ni au CREPMF
        </div>
      </div>
    </section>
  )
}
