import { useEffect, useRef, useState } from 'react'

const OR    = '#C9A84C'
const VERT3 = '#2ECC8B'

const PAYS_LIST = [
  "Algérie","Allemagne","Arabie Saoudite","Australie","Autriche",
  "Belgique","Bénin","Brésil","Burkina Faso",
  "Cameroun","Canada","Congo-Brazzaville","Côte d'Ivoire",
  "Danemark","Égypte","Émirats Arabes Unis","Espagne","États-Unis","Éthiopie",
  "France","Gabon","Ghana","Guinée-Bissau","Guinée Équatoriale",
  "Italie","Kenya","Luxembourg","Madagascar","Mali","Maroc",
  "Niger","Nigeria","Norvège","Pays-Bas","Portugal",
  "Qatar","RD Congo","Royaume-Uni","Rwanda",
  "Sénégal","Suède","Suisse","Togo","Tunisie",
]

const PRODUITS_OPTIONS = [
  'Guide PDF Europe',
  'Guide PDF UEMOA',
  'Tracker Dashboard',
  'Pack Complet Europe',
  'Pack Complet UEMOA',
]

function Etoiles({ n, onClick, interactive = false }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => interactive && onClick && onClick(i)}
          style={{
            fontSize: interactive ? 28 : 15,
            color: i <= n ? OR : 'rgba(255,255,255,0.15)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color 0.15s',
            lineHeight: 1,
          }}
        >★</span>
      ))}
    </span>
  )
}

function AvisCard({ avis }) {
  return (
    <div style={{
      background: '#0F1A12',
      border: '1px solid #1E2E21',
      borderRadius: 16,
      padding: '22px 20px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Guillemet décoratif */}
      <span style={{
        position: 'absolute', top: -10, left: 18,
        fontSize: 60, lineHeight: 1,
        color: 'rgba(201,168,76,0.12)',
        fontFamily: 'Georgia, serif',
        pointerEvents: 'none',
      }}>"</span>

      {/* En-tête : étoiles + produit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
        <Etoiles n={avis.etoiles} />
        {avis.produit && (
          <span style={{
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 6, padding: '2px 8px',
            fontSize: 10, fontWeight: 700, color: OR,
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>{avis.produit}</span>
        )}
      </div>

      {/* Texte */}
      <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', fontStyle: 'italic', margin: 0 }}>
        « {avis.texte} »
      </p>

      {/* Footer */}
      <div className="temo-footer" style={{ marginTop: 12 }}>
        {(avis.ville || avis.pays) && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>
            {avis.ville || avis.pays}
          </span>
        )}
      </div>

      {/* Réponse Jordan */}
      {avis.reponse && (
        <div style={{
          background: 'rgba(13,59,46,0.5)',
          border: '1px solid rgba(46,204,139,0.2)',
          borderRadius: 10, padding: '12px 14px', marginTop: 4,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: VERT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Réponse de Jordan
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>
            {avis.reponse}
          </p>
        </div>
      )}
    </div>
  )
}

function FormulaireAvis({ onSuccess }) {
  const [email,   setEmail]   = useState('')
  const [pays,    setPays]    = useState('')
  const [produit, setProduit] = useState('')
  const [texte,   setTexte]   = useState('')
  const [etoiles, setEtoiles] = useState(0)
  const [survol,  setSurvol]  = useState(0)
  const [statut,  setStatut]  = useState('idle') // idle | loading | succes | erreur

  async function soumettre(e) {
    e.preventDefault()
    if (etoiles === 0) { alert('Merci de choisir une note.'); return }
    if (texte.trim().length < 10) { alert('Écris au moins 10 caractères.'); return }
    setStatut('loading')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pays, produit, texte, etoiles }),
      })
      if (res.ok) { setStatut('succes'); onSuccess && onSuccess() }
      else { setStatut('erreur') }
    } catch { setStatut('erreur') }
  }

  if (statut === 'succes') return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Merci pour ton avis !</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
        Il est maintenant visible pour toute la communauté.
      </div>
    </div>
  )

  return (
    <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Note étoiles */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Ta note *
        </div>
        <div
          style={{ display: 'inline-flex', gap: 4 }}
          onMouseLeave={() => setSurvol(0)}
        >
          {[1,2,3,4,5].map(i => (
            <span
              key={i}
              onMouseEnter={() => setSurvol(i)}
              onClick={() => setEtoiles(i)}
              style={{
                fontSize: 32, color: i <= (survol || etoiles) ? OR : 'rgba(255,255,255,0.12)',
                cursor: 'pointer', transition: 'color 0.1s', lineHeight: 1,
              }}
            >★</span>
          ))}
        </div>
      </div>

      {/* Champs */}
      <div>
        <label style={lblStyle}>Pays</label>
        <select style={{...inputStyle, backgroundImage:'none'}} value={pays} onChange={e=>setPays(e.target.value)}>
          <option value="">Pays (optionnel)</option>
          {PAYS_LIST.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label style={lblStyle}>Email * <span style={{ color:'rgba(255,255,255,0.25)', fontWeight:400 }}>(non publié, pour vérification)</span></label>
        <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="ton@email.com" required />
      </div>

      <div>
        <label style={lblStyle}>Produit acheté</label>
        <select style={{...inputStyle, backgroundImage: 'none'}} value={produit} onChange={e => setProduit(e.target.value)}>
          <option value="">-- Sélectionne --</option>
          {PRODUITS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label style={lblStyle}>Ton avis * <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(10-800 caractères)</span></label>
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
          value={texte}
          onChange={e => setTexte(e.target.value)}
          placeholder="Partage ton expérience sincère…"
          required minLength={10} maxLength={800}
        />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: 3 }}>
          {texte.length}/800
        </div>
      </div>

      <button
        type="submit"
        disabled={statut === 'loading'}
        style={{
          background: OR, color: '#0D2B1E',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900, fontSize: 15, border: 'none',
          padding: '14px 0', borderRadius: 10, cursor: 'pointer',
          opacity: statut === 'loading' ? 0.7 : 1, width: '100%',
        }}
      >
        {statut === 'loading' ? 'Envoi…' : 'Publier mon avis'}
      </button>

      {statut === 'erreur' && (
        <p style={{ fontSize: 12, color: '#FF7676', textAlign: 'center' }}>
          Une erreur est survenue. Réessaie ou écris à contact@diaspoinvest.fr
        </p>
      )}
    </form>
  )
}

const inputStyle = {
  display: 'block', width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 14px',
  color: '#fff', fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 14, outline: 'none',
}
const lblStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
  letterSpacing: 0.5, marginBottom: 6,
}

export default function Temoignages() {
  const [avis,         setAvis]         = useState([])
  const [chargement,   setChargement]   = useState(true)
  const [showForm,     setShowForm]     = useState(false)

  function charger() {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAvis(Array.isArray(data) ? data : []); setChargement(false) })
      .catch(() => { setAvis([]); setChargement(false) })
  }

  useEffect(() => { charger() }, [])

  function onSuccess() {
    setShowForm(false)
    setTimeout(charger, 2000) // relire après 2s (GitHub API a besoin d'un instant)
  }

  const nb = avis.length
  const moy = nb > 0
    ? (avis.reduce((s, a) => s + a.etoiles, 0) / nb).toFixed(1)
    : null

  return (
    <section className="section temoignages" id="avis" style={{ padding: '60px 0' }}>
      <style>{`
        .avis-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) { .avis-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .avis-grid { grid-template-columns: 1fr; } }
        @keyframes avis-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--aw, 3000px))); }
        }
        .avis-band-track {
          display: inline-flex;
          animation: avis-scroll 30s linear infinite;
          align-items: center;
        }
        .avis-band-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <span className="eyebrow">Avis clients</span>
            <h2 style={{ marginTop: 6, marginBottom: 6 }}>Ce qu'ils en disent</h2>
            {nb > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <Etoiles n={Math.round(parseFloat(moy))} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 900, fontSize: 18, color: OR }}>{moy}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/ 5 · {nb} avis</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? 'rgba(201,168,76,0.08)' : OR,
              color: showForm ? OR : '#0D2B1E',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800, fontSize: 13,
              border: `1.5px solid ${OR}`,
              padding: '12px 22px', borderRadius: 10,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {showForm ? '✕ Annuler' : '✏ Laisser un avis'}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div style={{
            background: '#0F1A12',
            border: `1.5px solid rgba(201,168,76,0.3)`,
            borderRadius: 18, padding: '28px 24px',
            marginBottom: 32,
          }}>
            <h3 style={{ marginBottom: 20, fontSize: 18 }}>Partage ton expérience</h3>
            <FormulaireAvis onSuccess={onSuccess} />
          </div>
        )}

        {/* Liste des avis */}
        {chargement ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Chargement des avis…
          </div>
        ) : nb === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: '#0F1A12', border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sois le premier à laisser un avis</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
              Ta communauté compte sur toi pour les aider à franchir le pas.
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: OR, color: '#0D2B1E',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800, fontSize: 13,
                border: 'none', padding: '12px 24px',
                borderRadius: 10, cursor: 'pointer',
              }}
            >✏ Laisser mon avis</button>
          </div>
        ) : (
          <div className="avis-grid">
            {avis.map(a => <AvisCard key={a.id} avis={a} />)}
          </div>
        )}
      </div>

      {/* Bande défilante — s'affiche uniquement quand il y a des avis */}
      {nb > 0 && (
        <AvisBande avis={avis} />
      )}
    </section>
  )
}

function AvisBande({ avis }) {
  const bandRef = useRef(null)
  // Dupliquer pour boucle infinie
  const items = [...avis, ...avis]

  useEffect(() => {
    if (!bandRef.current) return
    bandRef.current.style.setProperty('--aw', `${bandRef.current.scrollWidth / 2}px`)
  }, [avis])

  return (
    <div style={{
      overflow: 'hidden',
      background: 'rgba(13,59,46,0.25)',
      borderTop: '1px solid #1E2E21',
      borderBottom: '1px solid #1E2E21',
      padding: '14px 0',
      marginTop: 40,
    }}>
      <div ref={bandRef} className="avis-band-track">
        {items.map((a, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '0 32px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <span style={{ color: '#C9A84C', fontSize: 13, letterSpacing: 1 }}>
              {'★'.repeat(a.etoiles)}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', maxWidth: 340, overflow:'hidden', textOverflow:'ellipsis' }}>
              « {a.texte.slice(0, 80)}{a.texte.length > 80 ? '…' : ''} »
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
              — {a.ville || a.pays || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
