import { useState, useEffect } from 'react'

// ── Tableau de bord de pilotage DiaspoInvest ──
// Vue unique : abonnés Brevo, marché BRVM, état de la boucle de conversion.
// Accès protégé par la même clé que le Cockpit (COCKPIT_SECRET / di_cockpit_secret).

const GOLD = '#C9A84C'
const BG = '#0D1525'
const CARD = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'

const fmt = (n) => (n == null ? '—' : n.toLocaleString('fr-FR'))
const pct = (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)} %`
const couleurVar = (v) => (v > 0 ? '#4CAF50' : v < 0 ? '#E5484D' : 'rgba(255,255,255,0.5)')

function Card({ children, style }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '36px 0 16px' }}>
      <div style={{ width: 4, height: 18, background: GOLD, borderRadius: 2 }} />
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{children}</h2>
    </div>
  )
}

export default function Dashboard() {
  const [secret, setSecret] = useState(() => localStorage.getItem('di_cockpit_secret') || '')
  const [stats, setStats] = useState(null)
  const [brvm, setBrvm] = useState(null)
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

  useEffect(() => { if (secret) charger() /* eslint-disable-next-line */ }, [])

  // ── Calculs dérivés BRVM ──
  const actions = brvm?.actions || []
  const hausses = [...actions].filter(a => a.variation_pct > 0).sort((a, b) => b.variation_pct - a.variation_pct).slice(0, 5)
  const baisses = [...actions].filter(a => a.variation_pct < 0).sort((a, b) => a.variation_pct - b.variation_pct).slice(0, 5)
  const indices = brvm?.indices || {}
  const composite = indices['BRVM - COMPOSITE'] || indices['BRVM-30']

  const listes = stats?.brevo?.listes || []
  const maxAbo = Math.max(1, ...listes.map(l => l.abonnes))

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Tableau de bord <span style={{ color: GOLD }}>DiaspoInvest</span></h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Pilotage en un coup d'œil {stats?.genere_le ? `· maj ${new Date(stats.genere_le).toLocaleString('fr-FR')}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="password" value={secret}
              onChange={e => { setSecret(e.target.value); localStorage.setItem('di_cockpit_secret', e.target.value) }}
              placeholder="Clé d'accès"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, width: 150, fontFamily: 'inherit' }}
            />
            <button onClick={charger} disabled={chargement || !secret}
              style={{ background: GOLD, color: BG, border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: chargement || !secret ? 0.5 : 1 }}>
              {chargement ? '…' : 'Actualiser'}
            </button>
          </div>
        </div>

        {erreur && (
          <Card style={{ marginTop: 20, borderColor: 'rgba(229,72,77,0.4)', background: 'rgba(229,72,77,0.08)' }}>
            <span style={{ color: '#E5484D', fontSize: 14 }}>{erreur}</span>
          </Card>
        )}

        {!stats && !erreur && (
          <Card style={{ marginTop: 24, textAlign: 'center', padding: 40 }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>
              Entre ta clé d'accès (la même que le Cockpit) puis clique « Actualiser ».
            </p>
          </Card>
        )}

        {stats && (
          <>
            {/* ── Audience Brevo ── */}
            <SectionTitle>Audience · abonnés email</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              {listes.map(l => (
                <Card key={l.id}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{l.nom}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{fmt(l.abonnes)}</div>
                </Card>
              ))}
              <Card style={{ borderColor: 'rgba(201,168,76,0.3)' }}>
                <div style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Total contacts</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{fmt(stats.brevo.totalContacts)}</div>
              </Card>
            </div>

            {/* Barres comparatives */}
            <Card style={{ marginTop: 14 }}>
              {listes.map(l => (
                <div key={l.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'rgba(255,255,255,0.6)' }}>
                    <span>{l.nom}</span><span>{fmt(l.abonnes)}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(l.abonnes / maxAbo) * 100}%`, height: '100%', background: GOLD, borderRadius: 4, transition: 'width .4s' }} />
                  </div>
                </div>
              ))}
            </Card>

            {/* ── Boucle de conversion ── */}
            <SectionTitle>Boucle de conversion</SectionTitle>
            <Card>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
                Chaque vente Gumroad ajoute l'acheteur à la liste <b style={{ color: '#fff' }}>Acheteurs</b> ({fmt(listes.find(l => l.id === 6)?.abonnes)}) et envoie un event « achat » à Plausible.
                <br />Le ratio <b style={{ color: GOLD }}>quiz terminé → achat</b> se lit dans Plausible (visites).
              </div>
            </Card>

            {/* ── Emplacement Plausible ── */}
            <SectionTitle>Visites & conversions (Plausible)</SectionTitle>
            <Card style={{ borderStyle: 'dashed' }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Emplacement réservé. Pour afficher ici les courbes de visites, quiz terminés et achats,
                active un <b style={{ color: '#fff' }}>lien de partage Plausible</b> (Plausible → Site Settings → Visibility → Shared Links)
                et donne-le-moi : je l'intègre directement dans cette zone.
              </div>
            </Card>

            {/* ── Marché BRVM ── */}
            <SectionTitle>Marché BRVM {brvm?.genere_le ? `· ${new Date(brvm.genere_le).toLocaleDateString('fr-FR')}` : ''}</SectionTitle>
            {composite && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
                {['BRVM - COMPOSITE', 'BRVM-30', 'BRVM - PRESTIGE'].filter(k => indices[k]).map(k => (
                  <Card key={k}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{indices[k].fermeture}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: couleurVar(indices[k].variation_pct) }}>{pct(indices[k].variation_pct)}</div>
                  </Card>
                ))}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <Card>
                <div style={{ fontSize: 12, color: '#4CAF50', fontWeight: 700, marginBottom: 10 }}>▲ Top hausses</div>
                {hausses.map(a => (
                  <div key={a.symbole} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{a.symbole}</span>
                    <span style={{ color: '#4CAF50', fontWeight: 700 }}>{pct(a.variation_pct)}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontSize: 12, color: '#E5484D', fontWeight: 700, marginBottom: 10 }}>▼ Top baisses</div>
                {baisses.map(a => (
                  <div key={a.symbole} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{a.symbole}</span>
                    <span style={{ color: '#E5484D', fontWeight: 700 }}>{pct(a.variation_pct)}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div style={{ marginTop: 36, textAlign: 'center' }}>
              <a href="/cockpit.html" style={{ color: GOLD, fontSize: 13, textDecoration: 'none' }}>→ Aller au Cockpit (agents IA)</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
