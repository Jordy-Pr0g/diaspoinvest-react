import { useState, useEffect } from 'react'

// ── Tableau de bord de pilotage DiaspoInvest ──
// Un seul objectif : piloter le BUSINESS (ventes, trafic, conversion, audience).
// Structure (leviers en haut, résultats détaillés en dessous) :
//   1. CA du mois (étoile polaire) + objectif
//   2. Ventes par produit (Hotmart, ventilées)
//   3. Remboursements (à part, jamais fondus dans le CA)
//   4. Trafic & acquisition (courbe 30 j, sources, pages)
//   5. Entonnoir de conversion
//   6. Audience Brevo
// Les cours BRVM n'ont pas leur place ici (ce n'est pas une métrique de
// pilotage) : ils vivent sur le Screener public.
// Accès : même clé que le Cockpit (COCKPIT_SECRET / di_cockpit_secret).

// Palette DiaspoInvest — rampe verte + or (cf. src/index.css)
const GOLD = '#C9A84C'
const BG = '#0A1F17'
const BG2 = '#0E2A1F'
const CARD = 'rgba(255,255,255,0.045)'
const BORDER = 'rgba(255,255,255,0.09)'
const UP = '#2ECC8B'
const DOWN = '#E5484D'
const TXT = '#EAF1EC'
const TXT2 = 'rgba(234,241,236,0.55)'
const TXT3 = 'rgba(234,241,236,0.4)'

const OBJECTIF_CA_MOIS = 300 // € — objectif de chiffre d'affaires mensuel (ajustable)

const PRODUIT_LABELS = {
  guideEurope: 'Guide PDF Europe',
  guideUemoa: 'Guide PDF UEMOA',
  tracker: 'Tracker Dashboard',
  packEurope: 'Pack Complet Europe',
  packUemoa: 'Pack Complet UEMOA',
  autre: 'Autre / non identifié',
}

const SOURCE_LABEL = {
  direct: 'Accès direct', google: 'Google', bing: 'Bing', tiktok: 'TikTok',
  instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn',
  youtube: 'YouTube', twitter: 'X / Twitter', whatsapp: 'WhatsApp', autre: 'Autre',
}

const fmt = (n) => (n == null ? '—' : n.toLocaleString('fr-FR'))
const fmtC = (n) => (n == null ? '—' : Math.abs(n) >= 10000 ? n.toLocaleString('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }) : n.toLocaleString('fr-FR'))
const eur = (n) => (n == null ? '—' : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 === 0 ? 0 : 2 }))
const pct = (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} %`
const couleur = (v) => (v > 0 ? UP : v < 0 ? DOWN : TXT2)

function Card({ children, style }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, ...style }}>
      {children}
    </div>
  )
}

function Skeleton({ h = 90, style }) {
  return <div style={{ height: h, background: 'rgba(255,255,255,0.05)', borderRadius: 16, animation: 'diPulse 1.2s ease-in-out infinite', ...style }} />
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '38px 0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 4, height: 18, background: GOLD, borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(234,241,236,0.7)' }}>{children}</h2>
      </div>
      {right}
    </div>
  )
}

function Kpi({ label, value, sub, accent }) {
  return (
    <Card style={accent ? { borderColor: 'rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' } : {}}>
      <div style={{ fontSize: 12, color: accent ? GOLD : TXT3, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: TXT3, marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}

function GoalBar({ value, goal, label }) {
  const p = goal > 0 ? Math.min(100, Math.max(0, (value / goal) * 100)) : 0
  const atteint = value >= goal
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: TXT2 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: atteint ? UP : TXT }}>{eur(value)} / {eur(goal)} · {p.toFixed(0)} %</span>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(2, p)}%`, height: '100%', background: atteint ? UP : `linear-gradient(90deg, ${GOLD}, rgba(201,168,76,0.6))`, borderRadius: 6, transition: 'width .25s ease-out' }} />
      </div>
    </div>
  )
}

// Barres horizontales génériques (sources, produits, entonnoir…)
function HBars({ items, unit = '', color = GOLD }) {
  const max = Math.max(1, ...items.map(i => i.value))
  return (
    <div>
      {items.map(it => (
        <div key={it.label} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, color: 'rgba(234,241,236,0.72)' }}>
            <span>{it.label}</span>
            <span style={{ fontWeight: 700, color: TXT }}>{it.display ?? `${fmt(it.value)}${unit}`}</span>
          </div>
          <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 6, transition: 'width .25s ease-out' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Entonnoir avec taux de passage par rapport à la 1re étape
function Funnel({ steps }) {
  const max = Math.max(1, ...steps.map(s => s.value))
  return (
    <div>
      {steps.map((s, i) => (
        <div key={s.label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, color: 'rgba(234,241,236,0.72)' }}>
            <span>{s.label}</span>
            <span style={{ fontWeight: 700, color: TXT }}>{fmt(s.value)}{i > 0 && steps[0].value > 0 ? ` · ${((s.value / steps[0].value) * 100).toFixed(1)} %` : ''}</span>
          </div>
          <div style={{ height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 7, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(2, (s.value / max) * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, rgba(201,168,76,0.55))`, borderRadius: 7, transition: 'width .25s ease-out' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Courbe de trafic (aire + ligne) interactive sur 30 jours
function TrafficChart({ data }) {
  const [hover, setHover] = useState(null)
  if (!data || data.length < 2) return <div style={{ color: TXT3, fontSize: 13 }}>Pas encore assez de données.</div>
  const W = 640, H = 180, PT = 10, PB = 10
  const vals = data.map(d => d.pv || 0)
  const max = Math.max(1, ...vals)
  const x = (i) => (i / (data.length - 1)) * W
  const y = (v) => PT + (1 - v / max) * (H - PT - PB)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.pv || 0).toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setHover(Math.round(frac * (data.length - 1)))
  }
  const pt = hover != null ? data[hover] : null
  const fracHover = hover != null ? hover / (data.length - 1) : 0

  return (
    <div style={{ position: 'relative', cursor: 'crosshair' }}
      onMouseMove={onMove} onMouseLeave={() => setHover(null)}
      onTouchStart={onMove} onTouchMove={onMove}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.32" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#tgrad)" />
        <path d={line} fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
        {pt && <line x1={x(hover)} y1="0" x2={x(hover)} y2={H} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />}
        {pt && <circle cx={x(hover)} cy={y(pt.pv || 0)} r="4.5" fill="#fff" stroke={GOLD} strokeWidth="2" />}
      </svg>
      {pt && (
        <div style={{
          position: 'absolute', top: -4, left: `${fracHover * 100}%`,
          transform: `translateX(${fracHover > 0.8 ? '-100%' : fracHover < 0.2 ? '0' : '-50%'})`,
          background: BG2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 10px',
          fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
        }}>
          <div style={{ color: TXT2 }}>{pt.date}</div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{fmt(pt.pv || 0)} vues · {fmt(pt.uniques || 0)} visiteurs</div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [secret, setSecret] = useState(() => localStorage.getItem('di_cockpit_secret') || '')
  const [stats, setStats] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [admin, setAdmin] = useState(() => { try { return localStorage.getItem('di_admin') === '1' } catch { return false } })

  function toggleAdmin() {
    const v = !admin
    setAdmin(v)
    try { localStorage.setItem('di_admin', v ? '1' : '0') } catch { /* ignore */ }
  }

  async function charger() {
    setErreur(''); setChargement(true)
    try {
      const rs = await fetch('/api/stats', { headers: { 'x-cockpit-secret': secret } })
      if (rs.status === 403) { setErreur('Clé d\'accès incorrecte ou manquante.'); setChargement(false); return }
      if (!rs.ok) { const e = await rs.json().catch(() => ({})); setErreur(e.error || 'Erreur de chargement'); setChargement(false); return }
      setStats(await rs.json())
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

  // Remet uniquement les compteurs de VENTES à zéro (CA, produits,
  // remboursements) sans toucher aux visites. Utile après des tests Hotmart.
  async function corrigerVentes() {
    if (!window.confirm('Remettre les compteurs de ventes à zéro (CA, produits, remboursements) sans toucher aux visites ?')) return
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cockpit-secret': secret },
        body: JSON.stringify({ fixRevenuAZero: true }),
      })
      charger()
    } catch { /* ignore */ }
  }

  useEffect(() => { if (secret) charger() /* eslint-disable-next-line */ }, [])

  // ── Dérivés ──
  const listes = stats?.brevo?.listes || []
  const getAbo = (id) => listes.find(l => l.id === id)?.abonnes || 0

  const A = stats?.analytics
  const aDays = A?.jours || []
  const visites7 = aDays.slice(-7).reduce((s, d) => s + (d.pv || 0), 0)
  const visitesPrev7 = aDays.slice(-14, -7).reduce((s, d) => s + (d.pv || 0), 0)
  const delta7 = visitesPrev7 > 0 ? ((visites7 - visitesPrev7) / visitesPrev7) * 100 : (visites7 > 0 ? 100 : null)
  const clients = getAbo(6)
  const moisPrefix = new Date().toISOString().slice(0, 7)
  const caMois = aDays.filter(j => j.date.startsWith(moisPrefix)).reduce((s, j) => s + (j.revenu || 0), 0)
  const achatsMois = aDays.filter(j => j.date.startsWith(moisPrefix)).reduce((s, j) => s + (j.achat || 0), 0)
  const produits = A?.produits || []
  const remb = A?.remboursements || { nombre: 0, montant: 0 }
  const uniques = A?.totaux?.uniques || 0
  const rpv = uniques > 0 && A?.totaux?.revenu > 0 ? A.totaux.revenu / uniques : null

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TXT, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 90px' }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Tableau de bord <span style={{ color: GOLD }}>DiaspoInvest</span></h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: TXT3 }}>
              Pilotage business{stats?.genere_le ? ` · données à jour le ${new Date(stats.genere_le).toLocaleString('fr-FR')}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="password" value={secret}
              onChange={e => { setSecret(e.target.value); localStorage.setItem('di_cockpit_secret', e.target.value) }}
              placeholder="Clé d'accès"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '9px 12px', color: TXT, fontSize: 13, width: 150, fontFamily: 'inherit' }} />
            <button onClick={charger} disabled={chargement || !secret}
              style={{ background: GOLD, color: BG, border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: chargement || !secret ? 0.5 : 1 }}>
              {chargement ? '…' : 'Actualiser'}
            </button>
          </div>
        </div>

        {/* Exclusion de mes propres visites (cet appareil) */}
        <div style={{ marginTop: 12 }}>
          <button onClick={toggleAdmin}
            style={{ background: admin ? 'rgba(46,204,139,0.1)' : 'transparent', border: `1px solid ${admin ? 'rgba(46,204,139,0.4)' : BORDER}`, color: admin ? UP : TXT2, borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', minHeight: 40 }}>
            {admin ? '✓ Mes visites sur cet appareil sont exclues du comptage' : 'M\'exclure du comptage (cet appareil)'}
          </button>
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
            <Skeleton h={220} />
          </div>
        )}

        {!stats && !erreur && !chargement && (
          <Card style={{ marginTop: 24, textAlign: 'center', padding: 40 }}>
            <p style={{ margin: 0, color: TXT2 }}>Entre ta clé d'accès puis clique « Actualiser ».</p>
          </Card>
        )}

        {stats && (
          <>
            {/* ── 1. Étoile polaire : le CA du mois ── */}
            <Card style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.03))', borderColor: 'rgba(201,168,76,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>⭐ Étoile polaire · CA du mois</div>
                  <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, marginTop: 8, color: caMois < 0 ? DOWN : TXT }}>{A?.disponible ? eur(caMois) : '—'}</div>
                  <div style={{ fontSize: 13, color: TXT2, marginTop: 6 }}>
                    {A?.disponible ? `${fmt(achatsMois)} vente(s) ce mois · ${fmt(clients)} client(s) au total` : 'En attente des premières ventes'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: TXT3, fontWeight: 600 }}>CA total (net)</div>
                    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>{A?.disponible ? eur(A.totaux.revenu) : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: TXT3, fontWeight: 600 }}>Revenu / visiteur</div>
                    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>{rpv != null ? eur(rpv) : '—'}</div>
                  </div>
                </div>
              </div>
              {A?.disponible && (
                <div style={{ marginTop: 18 }}>
                  <GoalBar value={caMois} goal={OBJECTIF_CA_MOIS} label="Objectif du mois" />
                </div>
              )}
              {A?.disponible && caMois < 0 && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: DOWN }}>CA négatif détecté (probablement un test de remboursement Hotmart).</span>
                  <button onClick={corrigerVentes}
                    style={{ background: 'transparent', border: '1px solid rgba(229,72,77,0.5)', color: DOWN, borderRadius: 8, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Corriger les compteurs de ventes
                  </button>
                </div>
              )}
            </Card>

            {/* ── 2. Ventes par produit ── */}
            <SectionTitle
              right={A?.disponible && (produits.length > 0 || remb.nombre > 0) ? (
                <button onClick={corrigerVentes}
                  style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TXT3, borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Remettre les ventes à zéro
                </button>
              ) : null}>
              Ventes par produit
            </SectionTitle>
            <Card>
              {produits.length === 0 ? (
                <div style={{ fontSize: 14, color: TXT2, lineHeight: 1.7 }}>
                  Aucune vente enregistrée pour l'instant. Chaque achat Hotmart apparaîtra ici,
                  ventilé par produit (guides, tracker, packs), dès la première vente réelle.
                </div>
              ) : (
                <HBars items={produits
                  .slice()
                  .sort((a, b) => b.revenu - a.revenu)
                  .map(p => ({
                    label: PRODUIT_LABELS[p.produit] || p.produit,
                    value: p.revenu,
                    display: `${fmt(p.ventes)} vente(s) · ${eur(p.revenu)}`,
                  }))} />
              )}
            </Card>

            {/* ── 3. Remboursements (à part) ── */}
            <SectionTitle>Remboursements</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <Kpi label="Remboursements (nombre)" value={fmt(remb.nombre)} sub="cumul depuis le lancement" />
              <Kpi label="Montant remboursé" value={eur(remb.montant)} sub="déjà déduit du CA net" />
              <Kpi label="Taux de remboursement" value={A?.totaux?.achat + remb.nombre > 0 ? `${((remb.nombre / (A.totaux.achat + remb.nombre)) * 100).toFixed(1)} %` : '—'} sub="remboursés / ventes totales" />
            </div>

            {/* ── 4. Trafic & acquisition ── */}
            <SectionTitle>Trafic & acquisition · 30 jours</SectionTitle>
            {!A?.disponible ? (
              <Card style={{ borderStyle: 'dashed' }}>
                <div style={{ fontSize: 14, color: TXT2, lineHeight: 1.7 }}>
                  ⏳ Stockage non activé. Crée un store <b style={{ color: TXT }}>KV / Upstash</b> dans Vercel (onglet Storage), gratuit.
                </div>
              </Card>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 14 }}>
                  <Kpi label="Visites · 7 j" value={fmtC(visites7)} accent
                    sub={delta7 != null ? <span style={{ color: couleur(delta7) }}>{pct(delta7)} vs 7 j précédents</span> : 'première semaine'} />
                  <Kpi label="Visiteurs uniques · 7 j" value={fmtC(A.uniques7 || 0)} />
                  <Kpi label="Vues totales" value={fmtC(A.totaux.pv)} sub={`${fmtC(uniques)} visiteurs uniques`} />
                </div>
                <Card>
                  <TrafficChart data={aDays} />
                </Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 14 }}>
                  <Card>
                    <div style={{ fontSize: 12, color: TXT3, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Sources de trafic</div>
                    {(A.sources || []).length === 0 ? (
                      <div style={{ fontSize: 13, color: TXT3 }}>Pas encore de source identifiée.</div>
                    ) : (
                      <HBars items={A.sources.slice(0, 8).map(s => ({ label: SOURCE_LABEL[s.source] || s.source, value: s.visites }))} />
                    )}
                  </Card>
                  <Card>
                    <div style={{ fontSize: 12, color: TXT3, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Pages les plus vues</div>
                    {(A.pages || []).length === 0 ? (
                      <div style={{ fontSize: 13, color: TXT3 }}>Pas encore de données.</div>
                    ) : (
                      <div style={{ fontSize: 13 }}>
                        {A.pages.slice(0, 8).map((p, i) => (
                          <div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < Math.min(A.pages.length, 8) - 1 ? `1px solid ${BORDER}` : 'none' }}>
                            <span style={{ color: 'rgba(234,241,236,0.72)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12 }}>{p.path}</span>
                            <span style={{ fontWeight: 700 }}>{fmtC(p.vues)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}

            {/* ── 5. Entonnoir de conversion ── */}
            {A?.disponible && (
              <>
                <SectionTitle
                  right={(A.totaux.pv > 0) ? (
                    <button onClick={resetCompteurs}
                      style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TXT3, borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Tout remettre à zéro
                    </button>
                  ) : null}>
                  Entonnoir de conversion
                </SectionTitle>
                <Card>
                  <Funnel steps={[
                    { label: 'Visiteurs uniques', value: uniques },
                    { label: 'Quiz terminé', value: A.totaux.quiz_termine },
                    { label: 'Clic vers un produit', value: A.totaux.clic_produit },
                    { label: 'Achats', value: A.totaux.achat },
                  ]} />
                  <div style={{ fontSize: 12, color: TXT3, marginTop: 4 }}>
                    Chaque vente Hotmart ajoute l'acheteur à la liste Brevo « Acheteurs » et s'enregistre ici automatiquement.
                  </div>
                </Card>
              </>
            )}

            {/* ── 6. Audience Brevo ── */}
            <SectionTitle>Audience email · Brevo</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              <Kpi label="Newsletter" value={fmt(getAbo(3))} sub="liste #3 · séquence bienvenue active" />
              <Kpi label="Intéressés" value={fmt(getAbo(7))} sub="liste #7 · segmentés J+16" />
              <Kpi label="Acheteurs" value={fmt(getAbo(6))} sub="liste #6 · tagués par produit" accent />
              <Kpi label="Contacts au total" value={fmt(stats.brevo?.totalContacts)} sub="tous segments confondus" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
