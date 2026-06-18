import { useEffect, useState, useRef } from 'react'
import { LIENS } from '../data.js'

// Dividendes annuels vérifiés (FCFA/action, dernier exercice fiscal)
const DIV_CONNUS = {
  SNTS:  { div: 1740, nom: 'Sonatel' },
  ORAC:  { div: 720,  nom: 'Orange CI' },
  SGBC:  { div: 2062, nom: 'SGBCI' },
  PALC:  { div: 502,  nom: 'PALMCI' },
  CBIBF: { div: 900,  nom: 'Coris Bank BF' },
  SLBC:  { div: 2000, nom: 'Solibra CI' },
  STBC:  { div: 4800, nom: 'SITAB CI' },
  BOAB:  { div: 526,  nom: 'BOA Bénin' },
}

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'
const RED   = '#FF6B6B'

function Sparkline({ values, color, width = 80, height = 32 }) {
  if (!values || values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(values.length - 1) / (values.length - 1) * width}
        cy={height - ((values[values.length - 1] - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  )
}

function BarChart({ items }) {
  const max = Math.max(...items.map(i => i.taux))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => (
        <div key={item.symbole}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'DM Mono, monospace' }}>
              {item.symbole}
            </span>
            <span style={{ fontSize: 12, color: OR, fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>
              {item.taux.toFixed(2).replace('.', ',')} %
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(item.taux / max) * 100}%`,
              background: `linear-gradient(90deg, ${OR}, #F0D080)`,
              borderRadius: 3,
              transition: 'width 1s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {Math.round(item.cours).toLocaleString('fr-FR')} FCFA · div. {Math.round(item.div).toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      ))}
    </div>
  )
}

function TickerItem({ symbole, variation, positif }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 14px', margin: '0 8px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 6,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 700, color: '#fff' }}>
        {symbole}
      </span>
      <span style={{
        fontFamily: 'DM Mono, monospace', fontSize: 11,
        color: positif ? VERT3 : RED,
        fontWeight: 600,
      }}>
        {positif ? '▲' : '▼'} {Math.abs(variation).toFixed(2).replace('.', ',')} %
      </span>
    </span>
  )
}

export default function BrvmLive() {
  const [data, setData]   = useState(null)
  const [date, setDate]   = useState('')
  const [topDiv, setTopDiv] = useState([])
  const [indices, setIndices] = useState([])
  const [ticker, setTicker]   = useState([])
  const tickerRef = useRef(null)

  useEffect(() => {
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json) return
        setData(json)

        // Date formatée
        if (json.genere_le) {
          const d = new Date(json.genere_le)
          setDate(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }

        // Indices
        if (json.indices && json.indices.length) {
          setIndices(json.indices.slice(0, 3))
        }

        // Top dividendes
        const avecDiv = (json.actions || [])
          .filter(a => DIV_CONNUS[a.symbole] && a.cours_cloture > 0)
          .map(a => ({
            symbole: a.symbole,
            nom: DIV_CONNUS[a.symbole].nom,
            cours: a.cours_cloture,
            div: DIV_CONNUS[a.symbole].div,
            taux: (DIV_CONNUS[a.symbole].div / a.cours_cloture) * 100,
          }))
          .sort((a, b) => b.taux - a.taux)
          .slice(0, 5)
        setTopDiv(avecDiv)

        // Ticker — toutes les actions avec variation
        const tkr = (json.actions || [])
          .filter(a => a.variation_pct !== undefined && a.variation_pct !== null)
          .map(a => ({
            symbole: a.symbole,
            variation: a.variation_pct,
            positif: a.variation_pct >= 0,
          }))
        setTicker([...tkr, ...tkr]) // doublé pour l'animation infinie
      })
      .catch(() => {})
  }, [])

  // CSS animation ticker
  useEffect(() => {
    if (!tickerRef.current || ticker.length === 0) return
    const el = tickerRef.current
    const w = el.scrollWidth / 2
    el.style.setProperty('--ticker-w', `${w}px`)
  }, [ticker])

  const hausse = ticker.filter((t, i) => i < ticker.length / 2 && t.positif).length
  const baisse = ticker.filter((t, i) => i < ticker.length / 2 && !t.positif).length

  return (
    <section className="section brvm-live" id="marche" style={{ padding: '60px 0 40px' }}>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--ticker-w, 2000px))); }
        }
        .ticker-track {
          display: inline-flex;
          animation: ticker-scroll 35s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
        .brvm-card {
          background: #0F1A12;
          border: 1px solid #1E2E21;
          border-radius: 16px;
          padding: 20px;
        }
        .brvm-card-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.35);
          font-weight: 700;
          margin-bottom: 14px;
        }
        .indice-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .indice-row:last-child { border-bottom: none; }
        .indice-name { font-size: 13px; font-weight: 700; color: #fff; }
        .indice-val  { font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 900; color: ${OR}; }
        .indice-var  { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; }
        .market-pulse {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(46,204,139,0.1); border: 1px solid rgba(46,204,139,0.3);
          border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700;
          color: ${VERT3}; letter-spacing: 0.5px;
        }
        .pulse-dot {
          width: 7px; height: 7px; border-radius: 50%; background: ${VERT3};
          animation: pulse-anim 1.5s ease-in-out infinite;
        }
        @keyframes pulse-anim {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.7); }
        }
        .stat-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 12px 16px; text-align: center;
        }
        .stat-pill-val { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 900; }
        .stat-pill-lab { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
        .div-badge {
          display: inline-block;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 6px; padding: 2px 8px;
          font-size: 10px; font-weight: 700; color: ${OR};
          text-transform: uppercase; letter-spacing: 1px;
        }
      `}</style>

      <div className="container">
        {/* En-tête section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">Marché en direct</span>
            <h2 style={{ marginTop: 6, marginBottom: 6 }}>La BRVM aujourd'hui</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 460 }}>
              47 actions. 8 pays. Des dividendes que la plupart de la diaspora ne connaît pas encore.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div className="market-pulse">
              <div className="pulse-dot" />
              Données live
            </div>
            {date && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono, monospace' }}>
                Clôture du {date}
              </span>
            )}
          </div>
        </div>

        {/* Ticker */}
        {ticker.length > 0 && (
          <div style={{
            overflow: 'hidden',
            background: '#0A130C',
            border: '1px solid #1E2E21',
            borderRadius: 12,
            padding: '10px 0',
            marginBottom: 28,
          }}>
            <div ref={tickerRef} className="ticker-track">
              {ticker.map((t, i) => (
                <TickerItem key={i} symbole={t.symbole} variation={t.variation} positif={t.positif} />
              ))}
            </div>
          </div>
        )}

        {/* Stats rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          <div className="stat-pill">
            <div className="stat-pill-val" style={{ color: OR }}>47</div>
            <div className="stat-pill-lab">Actions cotées</div>
          </div>
          <div className="stat-pill">
            <div className="stat-pill-val" style={{ color: VERT3 }}>{hausse}</div>
            <div className="stat-pill-lab">En hausse</div>
          </div>
          <div className="stat-pill">
            <div className="stat-pill-val" style={{ color: RED }}>{baisse}</div>
            <div className="stat-pill-lab">En baisse</div>
          </div>
          <div className="stat-pill">
            <div className="stat-pill-val" style={{ color: OR }}>+28,89%</div>
            <div className="stat-pill-lab">BRVM 2024</div>
          </div>
        </div>

        {/* 2 colonnes : indices + top dividendes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 20 }}>

          {/* Indices BRVM */}
          <div className="brvm-card">
            <div className="brvm-card-title">Indices BRVM</div>
            {indices.length > 0 ? (
              indices.map(idx => (
                <div className="indice-row" key={idx.nom || idx.indice}>
                  <span className="indice-name">{idx.nom || idx.indice}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="indice-val">{idx.valeur ? Number(idx.valeur).toLocaleString('fr-FR') : '—'}</div>
                    {idx.variation_pct !== undefined && (
                      <div className="indice-var" style={{ color: idx.variation_pct >= 0 ? VERT3 : RED }}>
                        {idx.variation_pct >= 0 ? '▲' : '▼'} {Math.abs(idx.variation_pct).toFixed(2).replace('.', ',')} %
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="indice-row">
                  <span className="indice-name">BRVM Composite</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="indice-val">—</div>
                  </div>
                </div>
                <div className="indice-row">
                  <span className="indice-name">BRVM 10</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="indice-val">—</div>
                  </div>
                </div>
              </>
            )}

            {/* Comparatif clé */}
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 10, color: OR, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Comparatif 2024
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 900, color: VERT3 }}>+28,89%</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>BRVM</div>
                </div>
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>vs</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>+0,92%</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>CAC 40</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top dividendes */}
          <div className="brvm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="brvm-card-title" style={{ marginBottom: 0 }}>Top rendements dividende</div>
              <span className="div-badge">Vérifié</span>
            </div>
            {topDiv.length > 0 ? (
              <BarChart items={topDiv} />
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Chargement des données...
              </div>
            )}
          </div>
        </div>

        {/* Bandeau CTA subtil */}
        <div style={{
          background: 'linear-gradient(135deg, #0D2B1E, #071510)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 16,
          padding: '22px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
              Tu vois ces chiffres. Et après ?
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Le Tracker Dashboard te permet de suivre ton propre portefeuille BRVM —
              combien tu possèdes, combien tu reçois, quelle est ta fiscalité réelle.
            </div>
          </div>
          <a
            href={LIENS.calculateur}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              background: OR,
              color: '#0D2B1E',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 13,
              padding: '12px 22px',
              borderRadius: 10,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            Voir le Tracker — 24,99 €
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
          Données BRVM · Sources : brvm.org + sikafinance.com · Non affilié à la BRVM ni au CREPMF
        </div>
      </div>
    </section>
  )
}
