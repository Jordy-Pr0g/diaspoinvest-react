import { useState, useEffect } from 'react'

// ── Tableau de bord de pilotage DiaspoInvest ──
// Vue unique : audience Brevo, marché BRVM (vraies courbes), boucle de conversion.
// Design : KPI primaire en haut à gauche, variations fléchées + colorées, courbe
// de tendance, entonnoir, barres sectorielles divergentes, donut, horodatage.
// Accès : même clé que le Cockpit (COCKPIT_SECRET / di_cockpit_secret).

const GOLD = '#C9A84C'
const BG = '#0D1525'
const CARD = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'
const UP = '#3FB870'
const DOWN = '#E5484D'

const OBJECTIF_CA_MOIS = 300 // € — objectif de chiffre d'affaires mensuel (ajustable)

const fmt = (n) => (n == null ? '—' : n.toLocaleString('fr-FR'))
const fmtC = (n) => (n == null ? '—' : Math.abs(n) >= 10000 ? n.toLocaleString('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }) : n.toLocaleString('fr-FR'))
const eur = (n) => (n == null ? '—' : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }))
const pct = (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)} %`
const arrow = (v) => (v > 0 ? '▲' : v < 0 ? '▼' : '◆')
const couleur = (v) => (v > 0 ? UP : v < 0 ? DOWN : 'rgba(255,255,255,0.5)')

const TICKERS = [
  { code: 'SNTS', nom: 'Sonatel' },
  { code: 'SGBC', nom: 'Société Générale CI' },
  { code: 'BOAB', nom: 'BOA Bénin' },
  { code: 'ETIT', nom: 'Ecobank' },
  { code: 'ONTBF', nom: 'Onatel' },
]

function Card({ children, style }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, ...style }}>
      {children}
    </div>
  )
}

// Placeholder de chargement (perçu plus rapide qu'un spinner)
function Skeleton({ h = 90, style }) {
  return <div style={{ height: h, background: 'rgba(255,255,255,0.05)', borderRadius: 16, animation: 'diPulse 1.2s ease-in-out infinite', ...style }} />
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '38px 0 16px' }}>
      <div style={{ width: 4, height: 18, background: GOLD, borderRadius: 2 }} />
      <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{children}</h2>
    </div>
  )
}

// KPI card : valeur + variation fléchée et colorée (le signal porte sur l'écart)
function Kpi({ label, value, sub, variation, primary, spark }) {
  return (
    <Card style={primary ? { borderColor: 'rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' } : {}}>
      <div style={{ fontSize: 12, color: primary ? GOLD : 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: primary ? 40 : 30, fontWeight: 800, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {variation != null && (
        <div style={{ fontSize: 13, fontWeight: 700, color: couleur(variation), marginTop: 4 }}>
          {arrow(variation)} {pct(variation)}
        </div>
      )}
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</div>}
      {spark && spark.length > 1 && <div style={{ marginTop: 10 }}><Sparkline values={spark} color={primary ? GOLD : 'rgba(255,255,255,0.35)'} /></div>}
    </Card>
  )
}

// Barre de progression vers un objectif (Lean Analytics : "draw a line in the sand")
function GoalBar({ value, goal, label }) {
  const p = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  const atteint = value >= goal
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: 'rgba(255,255,255,0.6)' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: atteint ? UP : '#fff' }}>{eur(value)} / {eur(goal)} · {p.toFixed(0)} %</span>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(2, p)}%`, height: '100%', background: atteint ? UP : `linear-gradient(90deg, ${GOLD}, rgba(201,168,76,0.6))`, borderRadius: 6, transition: 'width .25s ease-out' }} />
      </div>
    </div>
  )
}

// Mini-courbe sans axe (tendance en un coup d'œil)
function Sparkline({ values, color = GOLD }) {
  if (!values || values.length < 2) return null
  const W = 100, H = 26
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * W).toFixed(1)},${(H - ((v - min) / span) * H).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 26, display: 'block' }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// Courbe (aire + ligne) interactive : survol = lecture de la valeur à ce point
function AreaChart({ data, unit = 'FCFA' }) {
  const [hover, setHover] = useState(null) // index survolé
  if (!data || data.length < 2) return <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Courbe indisponible.</div>
  const W = 640, H = 220, PT = 10, PB = 10
  const closes = data.map(d => d.close)
  const min = Math.min(...closes), max = Math.max(...closes)
  const span = max - min || 1
  const x = (i) => (i / (data.length - 1)) * W // pleine largeur (aligne l'overlay HTML)
  const y = (v) => PT + (1 - (v - min) / span) * (H - PT - PB)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.close).toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const first = data[0].close, last = data[data.length - 1].close
  const perf = ((last - first) / first) * 100
  const stroke = perf >= 0 ? UP : DOWN

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setHover(Math.round(frac * (data.length - 1)))
  }
  const pt = hover != null ? data[hover] : null
  const fracHover = hover != null ? hover / (data.length - 1) : 0

  return (
    <div>
      <div style={{ position: 'relative', cursor: 'crosshair' }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        onTouchStart={onMove} onTouchMove={onMove}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#grad)" />
          <path d={line} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx={x(data.length - 1)} cy={y(last)} r="4" fill={stroke} />
          {pt && <line x1={x(hover)} y1="0" x2={x(hover)} y2={H} stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 3" />}
          {pt && <circle cx={x(hover)} cy={y(pt.close)} r="4.5" fill="#fff" stroke={stroke} strokeWidth="2" />}
        </svg>
        {/* Infobulle HTML positionnée en pourcentage (aligne avec la courbe) */}
        {pt && (
          <div style={{
            position: 'absolute', top: -4, left: `${fracHover * 100}%`,
            transform: `translateX(${fracHover > 0.8 ? '-100%' : fracHover < 0.2 ? '0' : '-50%'})`,
            background: '#1a2740', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 10px',
            fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>{pt.date}</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{fmt(pt.close)} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{unit}</span></div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
        <span>{data[0].date} · {fmt(first)} {unit}</span>
        <span style={{ color: couleur(perf), fontWeight: 700 }}>{arrow(perf)} {pct(perf)} sur la période</span>
        <span>{data[data.length - 1].date} · {fmt(last)} {unit}</span>
      </div>
    </div>
  )
}

// Entonnoir d'audience (barres horizontales proportionnelles)
function Funnel({ steps }) {
  const max = Math.max(1, ...steps.map(s => s.value))
  return (
    <div>
      {steps.map((s, i) => (
        <div key={s.label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, color: 'rgba(255,255,255,0.7)' }}>
            <span>{s.label}</span>
            <span style={{ fontWeight: 700 }}>{fmt(s.value)}{i > 0 && steps[0].value > 0 ? ` · ${((s.value / steps[0].value) * 100).toFixed(0)} %` : ''}</span>
          </div>
          <div style={{ height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 7, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(2, (s.value / max) * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, rgba(201,168,76,0.6))`, borderRadius: 7, transition: 'width .25s ease-out' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Barres divergentes (performance sectorielle, zéro au centre)
function DivergingBars({ items }) {
  const maxAbs = Math.max(0.5, ...items.map(i => Math.abs(i.value)))
  return (
    <div>
      {items.map(it => {
        const w = (Math.abs(it.value) / maxAbs) * 50
        const positif = it.value >= 0
        return (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, fontSize: 12 }}>
            <span style={{ width: 150, textAlign: 'right', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</span>
            <div style={{ flex: 1, position: 'relative', height: 16 }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.12)' }} />
              <div style={{ position: 'absolute', left: positif ? '50%' : `${50 - w}%`, width: `${w}%`, top: 2, height: 12, background: positif ? UP : DOWN, borderRadius: 3 }} />
            </div>
            <span style={{ width: 56, color: couleur(it.value), fontWeight: 700 }}>{pct(it.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

// Donut (répartition hausses / baisses / stables)
function Donut({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const R = 60, C = 2 * Math.PI * R
  let acc = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg viewBox="0 0 160 160" style={{ width: 150, height: 150 }}>
        <g transform="translate(80,80) rotate(-90)">
          <circle r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
          {segments.map(seg => {
            const frac = seg.value / total
            const dash = `${frac * C} ${C}`
            const el = <circle key={seg.label} r={R} fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={dash} strokeDashoffset={-acc * C} />
            acc += frac
            return el
          })}
        </g>
        <text x="80" y="76" textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff">{total}</text>
        <text x="80" y="96" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)">actions</text>
      </svg>
      <div style={{ fontSize: 13 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: seg.color, display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{seg.label}</span>
            <span style={{ fontWeight: 700 }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [secret, setSecret] = useState(() => localStorage.getItem('di_cockpit_secret') || '')
  const [stats, setStats] = useState(null)
  const [brvm, setBrvm] = useState(null)
  const [ticker, setTicker] = useState('SNTS')
  const [histo, setHisto] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function charger() {
    setErreur(''); setChargement(true)
    try {
      const [rs, rb] = await Promise.all([
        fetch('/api/stats', { headers: { 'x-cockpit-secret': secret } }),
        fetch('/api/brvm-data'),
      ])
      if (rs.status === 403) { setErreur('Clé d\'accès incorrecte ou manquante.'); setChargement(false); return }
      if (!rs.ok) { const e = await rs.json().catch(() => ({})); setErreur(e.error || 'Erreur Brevo'); setChargement(false); return }
      setStats(await rs.json())
      if (rb.ok) setBrvm(await rb.json())
    } catch (e) {
      setErreur('Impossible de charger les données : ' + e.message)
    }
    setChargement(false)
  }

  async function resetCompteurs() {
    if (!window.confirm('Remettre tous les compteurs de visites et conversions à zéro ? (action définitive)')) return
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cockpit-secret': secret },
        body: JSON.stringify({ reset: true }),
      })
      charger()
    } catch { /* ignore */ }
  }

  async function chargerHisto(t) {
    setHisto(null)
    try {
      const r = await fetch(`/api/brvm-history?ticker=${t}`)
      if (r.ok) { const d = await r.json(); setHisto((d.data || []).slice(-48)) } // ~4 ans
    } catch { /* silencieux */ }
  }

  useEffect(() => { if (secret) charger() /* eslint-disable-next-line */ }, [])
  useEffect(() => { if (stats) chargerHisto(ticker) /* eslint-disable-next-line */ }, [ticker, stats])

  // ── Dérivés ──
  const listes = stats?.brevo?.listes || []
  const getAbo = (id) => listes.find(l => l.id === id)?.abonnes || 0
  const actions = brvm?.actions || []
  const indices = brvm?.indices || {}
  const composite = indices['BRVM - COMPOSITE']
  const hausses = [...actions].filter(a => a.variation_pct > 0).sort((a, b) => b.variation_pct - a.variation_pct).slice(0, 6)
  const baisses = [...actions].filter(a => a.variation_pct < 0).sort((a, b) => a.variation_pct - b.variation_pct).slice(0, 6)
  const nbHausse = actions.filter(a => a.variation_pct > 0).length
  const nbBaisse = actions.filter(a => a.variation_pct < 0).length
  const nbStable = actions.filter(a => a.variation_pct === 0).length
  const secteurs = Object.entries(indices)
    .filter(([k]) => k.includes(' - ') && !k.includes('TOTAL'))
    .map(([k, v]) => ({ label: k.replace('BRVM - ', ''), value: v.variation_pct }))
    .sort((a, b) => b.value - a.value)

  // North Star = le chiffre d'affaires. Le reste = métriques d'entrée (Lean Analytics, OMTM).
  const A = stats?.analytics
  const aDays = A?.jours || []
  const visites7 = aDays.slice(-7).reduce((s, d) => s + (d.pv || 0), 0)
  const ratioConv = A?.ratio
  const clients = getAbo(6)
  const moisPrefix = new Date().toISOString().slice(0, 7)
  const caMois = aDays.filter(j => j.date.startsWith(moisPrefix)).reduce((s, j) => s + (j.revenu || 0), 0)
  const achatsMois = aDays.filter(j => j.date.startsWith(moisPrefix)).reduce((s, j) => s + (j.achat || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 90px' }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Tableau de bord <span style={{ color: GOLD }}>DiaspoInvest</span></h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Pilotage en un coup d'œil{stats?.genere_le ? ` · données à jour le ${new Date(stats.genere_le).toLocaleString('fr-FR')}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="password" value={secret}
              onChange={e => { setSecret(e.target.value); localStorage.setItem('di_cockpit_secret', e.target.value) }}
              placeholder="Clé d'accès"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, width: 150, fontFamily: 'inherit' }} />
            <button onClick={charger} disabled={chargement || !secret}
              style={{ background: GOLD, color: BG, border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: chargement || !secret ? 0.5 : 1 }}>
              {chargement ? '…' : 'Actualiser'}
            </button>
          </div>
        </div>

        {erreur && (
          <Card style={{ marginTop: 20, borderColor: 'rgba(229,72,77,0.4)', background: 'rgba(229,72,77,0.08)' }}>
            <span style={{ color: DOWN, fontSize: 14 }}>{erreur}</span>
          </Card>
        )}

        {chargement && !stats && (
          <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
            <Skeleton h={120} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              <Skeleton /><Skeleton /><Skeleton /><Skeleton />
            </div>
            <Skeleton h={240} />
          </div>
        )}

        {!stats && !erreur && !chargement && (
          <Card style={{ marginTop: 24, textAlign: 'center', padding: 40 }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)' }}>Entre ta clé d'accès puis clique « Actualiser ».</p>
          </Card>
        )}

        {stats && (
          <>
            {/* ⭐ North Star : le chiffre d'affaires du mois. Tout le reste sert à le faire grimper. */}
            <Card style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.03))', borderColor: 'rgba(201,168,76,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>⭐ Étoile polaire · CA du mois</div>
                  <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, marginTop: 8 }}>{A?.disponible ? eur(caMois) : '—'}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
                    {A?.disponible ? `${fmt(achatsMois)} vente(s) ce mois · ${fmt(clients)} clients au total` : 'En attente des premières ventes'}. Visites et conversion ne sont que les leviers.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Visites · 7 j</div>
                    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>{A?.disponible ? fmtC(visites7) : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Taux quiz → achat</div>
                    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2, color: ratioConv != null && ratioConv >= 5 ? UP : '#fff' }}>{ratioConv == null ? '—' : `${ratioConv.toFixed(1)} %`}</div>
                  </div>
                </div>
              </div>
              {A?.disponible && (
                <div style={{ marginTop: 18 }}>
                  <GoalBar value={caMois} goal={OBJECTIF_CA_MOIS} label={`Objectif du mois`} />
                </div>
              )}
            </Card>

            {/* Métriques d'entrée (audience) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginTop: 14 }}>
              <Kpi label="Newsletter" value={fmt(getAbo(3))} sub="abonnés actifs" />
              <Kpi label="Intéressés" value={fmt(getAbo(7))} sub="prospects" />
              <Kpi label="Contacts au total" value={fmt(stats.brevo.totalContacts)} sub="tous emails confondus" />
              {composite && <Kpi label="BRVM Composite" value={fmt(composite.fermeture)} variation={composite.variation_pct} sub="contexte marché" />}
            </div>

            {/* Audience : entonnoir */}
            <SectionTitle>Audience · entonnoir email</SectionTitle>
            <Card>
              <Funnel steps={[
                { label: 'Contacts au total', value: stats.brevo.totalContacts || 0 },
                { label: 'Newsletter', value: getAbo(3) },
                { label: 'Intéressés', value: getAbo(7) },
                { label: 'Acheteurs', value: getAbo(6) },
              ]} />
            </Card>

            {/* Boucle de conversion */}
            <SectionTitle>Boucle de conversion</SectionTitle>
            <Card>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
                Chaque vente Gumroad ajoute l'acheteur à la liste <b style={{ color: '#fff' }}>Acheteurs</b> ({fmt(getAbo(6))}) et envoie un event « achat » à Plausible.
                Le ratio <b style={{ color: GOLD }}>quiz terminé → achat</b> se lira dans la zone Plausible ci-dessous une fois branchée.
              </div>
            </Card>

            {/* Visites & conversions — mesure maison */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <SectionTitle>Visites & conversions</SectionTitle>
              {stats.analytics?.disponible && (stats.analytics.totaux.pv > 0) && (
                <button onClick={resetCompteurs}
                  style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.4)', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Remettre à zéro
                </button>
              )}
            </div>
            {!stats.analytics?.disponible ? (
              <Card style={{ borderStyle: 'dashed' }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  ⏳ Stockage non activé. Crée un store <b style={{ color: '#fff' }}>KV / Upstash</b> dans Vercel (onglet Storage), gratuit.
                </div>
              </Card>
            ) : (() => {
              const A = stats.analytics
              const days = A.jours || []
              const sum = (arr) => arr.reduce((s, d) => s + (d.pv || 0), 0)
              const last7 = sum(days.slice(-7)), prev7 = sum(days.slice(-14, -7)), last30 = sum(days)
              const delta7 = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : (last7 > 0 ? 100 : null)
              const spark = days.slice(-14).map(d => d.pv)
              const hasData = (A.totaux.pv || 0) > 0
              const ratio = A.ratio
              const fiable = (A.totaux.quiz_termine || 0) >= 20
              let insight, ton = 'rgba(255,255,255,0.7)'
              if (!hasData) insight = 'Pas encore de visites enregistrées. Les chiffres apparaîtront dès les premiers visiteurs.'
              else if (ratio == null) insight = 'Trafic enregistré, mais pas encore de quiz terminé : impossible de calculer le taux de conversion pour l’instant.'
              else if (ratio < 1) { insight = `Taux de conversion faible (${ratio.toFixed(1)} %). Le contenu attire mais convertit peu : priorité à la clarté de l’offre et de la landing.`; ton = DOWN }
              else if (ratio < 5) { insight = `Taux correct (${ratio.toFixed(1)} %). Vise > 5 % en alignant mieux chaque article au bon produit.`; ton = GOLD }
              else { insight = `Très bon taux (${ratio.toFixed(1)} %). Le levier devient le trafic : concentre-toi sur l’acquisition.`; ton = UP }
              if (ratio != null && !fiable) insight += ' (Échantillon encore faible, à confirmer.)'
              return (
                <>
                  {/* Bandeau insight actionnable */}
                  <Card style={{ borderLeft: `3px solid ${ton}` }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Lecture</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{insight}</div>
                  </Card>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 14 }}>
                    <Kpi label="Vues · 7 jours" value={fmtC(last7)} variation={delta7} sub="vs 7 jours précédents" spark={spark} />
                    <Kpi label="Vues · 30 jours" value={fmtC(last30)} />
                    <Kpi label="Quiz terminés" value={fmt(A.totaux.quiz_termine)} sub={`${fmt(A.totaux.clic_produit)} clics produit`} />
                    <Kpi primary label="Taux quiz → achat"
                      value={ratio == null ? '—' : `${ratio.toFixed(1)} %`}
                      sub={`${fmt(A.totaux.achat)} achat(s) · cible 5 %`} />
                  </div>

                  {hasData ? (
                    <Card style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 14 }}>Vues de page · 30 derniers jours</div>
                      <AreaChart unit="vues" data={days.map(j => ({ date: j.date.slice(5), close: j.pv }))} />
                    </Card>
                  ) : (
                    <Card style={{ marginTop: 14, textAlign: 'center', padding: 32, borderStyle: 'dashed' }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>La courbe se remplira au fil des visites réelles.</div>
                    </Card>
                  )}

                  <Card style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 14 }}>Entonnoir de conversion</div>
                    <Funnel steps={[
                      { label: 'Vues de page', value: A.totaux.pv },
                      { label: 'Quiz terminés', value: A.totaux.quiz_termine },
                      { label: 'Clics produit', value: A.totaux.clic_produit },
                      { label: 'Achats', value: A.totaux.achat },
                    ]} />
                  </Card>
                </>
              )
            })()}

            {/* BRVM — courbe */}
            <SectionTitle>Marché BRVM{brvm?.genere_le ? ` · clôture du ${new Date(brvm.genere_le).toLocaleDateString('fr-FR')}` : ''}</SectionTitle>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Cours mensuel (FCFA)</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TICKERS.map(t => (
                    <button key={t.code} onClick={() => setTicker(t.code)}
                      style={{ background: ticker === t.code ? GOLD : 'rgba(255,255,255,0.06)', color: ticker === t.code ? BG : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 8, padding: '10px 14px', minHeight: 40, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t.nom}
                    </button>
                  ))}
                </div>
              </div>
              {histo ? <AreaChart data={histo} /> : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Chargement de la courbe…</div>}
            </Card>

            {/* BRVM — secteurs + donut */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginTop: 14 }}>
              <Card>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 14 }}>Performance par secteur (jour)</div>
                {secteurs.length ? <DivergingBars items={secteurs} /> : <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>—</span>}
              </Card>
              <Card>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 14 }}>Hausses / baisses du jour</div>
                <Donut segments={[
                  { label: 'En hausse', value: nbHausse, color: UP },
                  { label: 'En baisse', value: nbBaisse, color: DOWN },
                  { label: 'Stables', value: nbStable, color: 'rgba(255,255,255,0.3)' },
                ]} />
              </Card>
            </div>

            {/* Top movers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 14 }}>
              <Card>
                <div style={{ fontSize: 12, color: UP, fontWeight: 700, marginBottom: 10 }}>▲ Top hausses</div>
                {hausses.map(a => (
                  <div key={a.symbole} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{a.symbole}</span>
                    <span style={{ color: UP, fontWeight: 700 }}>{pct(a.variation_pct)}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontSize: 12, color: DOWN, fontWeight: 700, marginBottom: 10 }}>▼ Top baisses</div>
                {baisses.map(a => (
                  <div key={a.symbole} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{a.symbole}</span>
                    <span style={{ color: DOWN, fontWeight: 700 }}>{pct(a.variation_pct)}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <a href="/cockpit.html" style={{ color: GOLD, fontSize: 13, textDecoration: 'none' }}>→ Aller au Cockpit (agents IA)</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
