import { useState, useEffect, useRef } from 'react'

// Données BRVM statiques (fallback si API indisponible)
const BRVM_DATA_FALLBACK = `Données BRVM (fallback statique — source : sikafinance.com) :
- Sonatel (SNTS) : 28 500 FCFA · Div net 1 740 FCFA · Rendement 6,11%
- Orange CI (ORAC) : 15 570 FCFA · Div net 720 FCFA · Rendement 4,62%
- Vivo Energy CI : 3 700 FCFA · Div net 270 FCFA · Rendement 7,30%
- SGBCI : 36 015 FCFA · Div net 2 064 FCFA · Rendement 5,73%
- Ecobank CI : 16 300 FCFA · Div net 799 FCFA · Rendement 4,90%
- Taux fixe : 1€ = 655,957 FCFA · Flat Tax France : 31,4%`

function buildBrvmData(json) {
  if (!json) return BRVM_DATA_FALLBACK
  try {
    const date = new Date(json.genere_le).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    const lines = [`Données BRVM du ${date} (source : brvm.org + sikafinance.com) :`]
    const idx = json.indices || {}
    const composite = idx['BRVM - COMPOSITE']
    if (composite) lines.push(`- BRVM Composite : ${composite.fermeture} pts (${composite.variation_pct > 0 ? '+' : ''}${composite.variation_pct}%)`)
    const brvm30 = idx['BRVM-30']
    if (brvm30) lines.push(`- BRVM 30 : ${brvm30.fermeture} pts (${brvm30.variation_pct > 0 ? '+' : ''}${brvm30.variation_pct}%)`)
    const secteurs = Object.entries(idx)
      .filter(([k]) => k.startsWith('BRVM - ') && !['BRVM - COMPOSITE','BRVM – COMPOSITE TOTAL RETURN','BRVM - PRESTIGE','BRVM - PRINCIPAL'].includes(k))
      .sort((a, b) => Math.abs(b[1].variation_pct) - Math.abs(a[1].variation_pct))
      .slice(0, 3)
    if (secteurs.length) {
      lines.push('Secteurs marquants :')
      secteurs.forEach(([n, v]) => lines.push(`  ${n.replace('BRVM - ','')} : ${v.variation_pct > 0 ? '+' : ''}${v.variation_pct}%`))
    }
    const actions = (json.actions || []).filter(a => a.variation_pct != null)
    const top3 = [...actions].sort((a, b) => b.variation_pct - a.variation_pct).slice(0, 3)
    const bot3 = [...actions].sort((a, b) => a.variation_pct - b.variation_pct).slice(0, 3)
    lines.push('Top hausses :')
    top3.forEach(a => lines.push(`  ${a.symbole} (${a.nom}) : ${a.cours_cloture.toLocaleString('fr-FR')} FCFA (${a.variation_pct > 0 ? '+' : ''}${a.variation_pct}%)`))
    lines.push('Top baisses :')
    bot3.forEach(a => lines.push(`  ${a.symbole} (${a.nom}) : ${a.cours_cloture.toLocaleString('fr-FR')} FCFA (${a.variation_pct}%)`))
    const divs = json.dividendes_a_venir || []
    if (divs.length) {
      lines.push('Dividendes à venir (détachements confirmés) :')
      divs.forEach(d => lines.push(`  ${d.nom} : le ${d.date_detachement}, ${d.montant_fcfa} FCFA${d.rendement_pct ? ` (rdt ${d.rendement_pct}%)` : ''}`))
    }
    lines.push('Taux fixe : 1€ = 655,957 FCFA · Flat Tax France : 31,4%')
    return lines.join('\n')
  } catch {
    return BRVM_DATA_FALLBACK
  }
}

const LEGAL_RULES = `
COUVERTURE JURIDIQUE (OBLIGATOIRE dans tout contenu public — newsletter, TikTok, page de vente, analyse) :
1. Terminer chaque contenu par ce disclaimer (adapter le format au support, ne jamais l'omettre) :
"DiaspoInvest est un projet éducatif indépendant, non affilié à la BRVM ni au CREPMF. Ce contenu ne constitue pas un conseil en investissement personnalisé. Tout investissement en bourse comporte un risque de perte en capital. Les performances passées ne préjugent pas des performances futures."
2. Formulations toujours GÉNÉRALES et éducatives : jamais "tu devrais acheter X", jamais de recommandation personnalisée, jamais de rendement promis ou garanti.
3. Parler au passé ou au présent vérifiable ("Sonatel a versé", "le rendement actuel est de") — jamais au futur prédictif ("va rapporter", "tu gagneras").
4. Sur TikTok/format court : au minimum la mention "Contenu éducatif — pas un conseil en investissement" à l'écran ou en légende.`

const HISTORY_KEY = (id) => `di_history_${id}`
const CONTEXT_KEY = 'di_projet_context'
const NOTION_KEY_STORE = 'di_notion_key'
const NOTION_DB_STORE = 'di_notion_db'
const MAX_HISTORY = 20

/* ── SAVE TO NOTION ──────────────────────────────────────────── */
async function saveToNotion({ agentNom, agentId, sujet, result }) {
  const notionKey = localStorage.getItem(NOTION_KEY_STORE)
  const databaseId = localStorage.getItem(NOTION_DB_STORE)
  if (!notionKey || !databaseId) return null
  try {
    const res = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notionKey, databaseId, agentNom, agentId, sujet, result }),
    })
    const data = await res.json()
    return res.ok ? data.url : null
  } catch { return null }
}

/* ── APPEL CLAUDE ────────────────────────────────────────────── */
async function callClaude(prompt, _apiKey, maxTokens = 4000) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Erreur ${res.status}`) }
  return (await res.json()).content[0].text
}

/* ── PROMPT ROUTAGE JORDAN ───────────────────────────────────── */
const JORDAN_ROUTING_PROMPT = (demande, ctx) => `Tu es Jordan, Orchestrateur de DiaspoInvest. Tu diriges une équipe de 3 agents IA spécialisés.
${ctx ? `Contexte projet actuel : ${ctx}\n` : ''}
Analyse cette demande et décide à quel agent la confier :
"${demande}"

Agents disponibles :
- tiktok (Imani) : scripts TikTok, hooks, Reels, contenu vidéo, posts LinkedIn, idées de contenu, réseaux sociaux
- newsletter (Malik) : newsletters hebdo, emails marketing, séquences email, contenu Brevo, copywriting
- community (Sofia) : réponses DM Instagram/TikTok, emails communauté entrants, FAQ, messages de bienvenue, objections acheteurs

Réponds UNIQUEMENT en JSON valide sans markdown ni backticks :
{"agentId":"...","reason":"...","refinedPrompt":"..."}

- agentId : l'id exact de l'agent le plus adapté
- reason : 1 phrase courte expliquant ton choix (ex: "Demande de script vidéo → Imani")
- refinedPrompt : la demande reformulée et enrichie pour que l'agent produise le meilleur résultat possible`

const AGENTS = (brvmData) => [
  {
    id: 'tiktok',
    nom: 'Imani',
    genre: 'F',
    titre: 'Créatrice de Contenu',
    tag: 'TikTok · LinkedIn',
    avatar: '/avatars/beanie-notebook.png',
    color: '#00C896',
    colorDark: '#007A5A',
    gradient: 'linear-gradient(135deg, #003D2E 0%, #00C89622 100%)',
    glow: 'rgba(0,200,150,0.4)',
    emoji: '🎬',
    tagline: '"Je transforme chaque chiffre BRVM en contenu qui accroche."',
    description: 'Imani crée des scripts TikTok et posts LinkedIn avec les vraies données BRVM du jour. Hook en 3 secondes, script 60s, légende, hashtags — tout prêt à filmer ou publier.',
    capacites: [
      { icon: '✦', txt: '3 scripts TikTok 60s complets' },
      { icon: '✦', txt: 'Hook percutant en ≤ 8 mots' },
      { icon: '✦', txt: 'Données BRVM live du jour' },
      { icon: '✦', txt: '2 variantes de hook par script' },
      { icon: '✦', txt: 'Post LinkedIn adapté' },
    ],
    placeholder: 'Ex : script sur les dividendes Coris Bank, comparaison Livret A vs BRVM, comment ouvrir un compte...',
    systemPrompt: (s, ctx) => `Tu es Imani, Créatrice de Contenu de DiaspoInvest — TikTok, Reels et LinkedIn pour éduquer la diaspora africaine à investir sur la BRVM.
${ctx ? `Contexte projet : ${ctx}\n` : ''}Produis du contenu sur : "${s}"
${brvmData}${LEGAL_RULES}
AUDIENCE : diaspora africaine partout (Europe, Amérique du Nord, Golfe) ET résidents UEMOA/Afrique. Ne sur-centre jamais la France. Fil rouge : "investir au pays, faire fructifier en Afrique".
Règles : chiffres réels uniquement · hook ≤ 8 mots · jamais "conseil en investissement" · 2 variantes hook · jamais de tiret long (—) · virgule décimale française.
Format :
---
SCRIPT [N] — [Framework : AIDA / PAS / BAB]
HOOK A : ...  |  HOOK B : ...
SCRIPT 60s : [texte à dire caméra]
TEXTE ÉCRAN : [3-5 lignes]
LÉGENDE : [2-3 phrases]
HASHTAGS : #...  |  CTA : [lien en bio → diaspoinvest.fr]
---
POST LINKEDIN : [même sujet, ton plus pro, 3-5 paragraphes courts, question ouverte à la fin]`,
  },
  {
    id: 'newsletter',
    nom: 'Malik',
    genre: 'M',
    titre: 'Rédacteur Newsletter',
    tag: 'Email · Brevo',
    avatar: '/avatars/glasses-pen.png',
    color: '#B06FFF',
    colorDark: '#6A2FA0',
    gradient: 'linear-gradient(135deg, #1A0030 0%, #B06FFF22 100%)',
    glow: 'rgba(176,111,255,0.4)',
    emoji: '✉️',
    tagline: '"Je rédige les mots qui font ouvrir, lire et acheter."',
    description: 'Malik rédige newsletters, séquences email et copy avec les données BRVM live. Objet accrocheur, chiffre du moment, conseil actionnable, CTA naturel.',
    capacites: [
      { icon: '✦', txt: 'Newsletter complète clé en main' },
      { icon: '✦', txt: "Objet optimisé taux d'ouverture" },
      { icon: '✦', txt: 'Données BRVM live intégrées' },
      { icon: '✦', txt: 'Séquences email nurturing' },
      { icon: '✦', txt: 'Copy emails post-achat' },
    ],
    placeholder: 'Ex : newsletter lundi sur les dividendes, email bienvenue J+2, séquence post-achat Guide...',
    systemPrompt: (s, ctx) => `Tu es Malik, Rédacteur Newsletter de DiaspoInvest. Tu écris à la première personne comme Jordan (fondateur, M2 Finance) qui s'adresse à sa communauté en "tu".
${ctx ? `Contexte projet : ${ctx}\n` : ''}Rédige : "${s}"
${brvmData}${LEGAL_RULES}
AUDIENCE : diaspora africaine partout ET résidents UEMOA. Jamais sur-centré sur la France.
Produits : Guide PDF 14,99€ · DiaspoInvest Tracker Dashboard 24,99€ · Pack 29,99€ (Lemon Squeezy).
Règles : jamais de tiret long (—) · virgule décimale française · jamais "conseil en investissement" · toujours sourcer les chiffres · ton sobre, fraternel, direct.
Structure newsletter : OBJET (≤55 car.) · PREHEADER · INTRO chiffre BRVM · CE QUI A BOUGÉ · SIGNAL · CONSEIL · CTA Tracker Dashboard · QUESTION engagement A/B/C · SIGNATURE Jordan.`,
  },
  {
    id: 'community',
    nom: 'Sofia',
    genre: 'F',
    titre: 'Responsable Communauté',
    tag: 'DM · Réponses',
    avatar: '/avatars/suit-headset.png',
    color: '#FF9A3C',
    colorDark: '#C46200',
    gradient: 'linear-gradient(135deg, #1A0A00 0%, #FF9A3C22 100%)',
    glow: 'rgba(255,154,60,0.4)',
    emoji: '💬',
    tagline: '"Je transforme chaque message en opportunité de confiance."',
    description: 'Sofia rédige les réponses aux DM Instagram/TikTok, emails entrants et objections. Ton chaleureux, communautaire, jamais commercial. Jordan relit et envoie.',
    capacites: [
      { icon: '✦', txt: 'Réponses DM Instagram / TikTok' },
      { icon: '✦', txt: 'Emails entrants communauté' },
      { icon: '✦', txt: 'Réponses aux objections' },
      { icon: '✦', txt: 'Messages de bienvenue' },
      { icon: '✦', txt: 'FAQ DiaspoInvest complète' },
    ],
    placeholder: 'Ex : répondre à "c\'est trop cher", DM "comment investir depuis Paris", email "je suis au Sénégal c\'est pour moi ?"...',
    systemPrompt: (s, ctx) => `Tu es Sofia, Responsable Communauté de DiaspoInvest. Tu rédiges des réponses pour Jordan — il relit et envoie lui-même, il ne faut JAMAIS répondre automatiquement.
${ctx ? `Contexte projet : ${ctx}\n` : ''}Rédige une réponse à : "${s}"
${brvmData}${LEGAL_RULES}
Produits : Guide PDF 14,99€ · DiaspoInvest Tracker Dashboard 24,99€ · Pack 29,99€ · Site : diaspoinvest.fr.
AUDIENCE : diaspora africaine partout ET résidents zone UEMOA/Afrique.
Règles : ton chaleureux, fraternel, humain — jamais commercial ni agressif · jamais de promesse de gain · toujours inviter à poser d'autres questions · si question fiscale complexe → recommander un expert-comptable · jamais de tiret long (—).
Format : rédige la réponse directement, prête à copier-coller. Si plusieurs variantes utiles, propose 2 versions (courte / détaillée).`,
  },
]

/* ── UTILITAIRES HISTORIQUE ─────────────────────────────────── */
function loadHistory(agentId) {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY(agentId)) || '[]') } catch { return [] }
}
function saveHistory(agentId, history) {
  localStorage.setItem(HISTORY_KEY(agentId), JSON.stringify(history.slice(0, MAX_HISTORY)))
}
function exportHistory(agent, history) {
  const lines = [`# Historique — ${agent.nom} (${agent.titre})\n`]
  history.forEach((h, i) => {
    lines.push(`## [${h.date}] ${h.sujet}\n`)
    lines.push(h.result)
    lines.push('\n---\n')
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `diaspoinvest-${agent.id}-historique.md`
  a.click()
}

/* ── PARTICULES FOND ─────────────────────────────────────────── */
function Particles({ color }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          borderRadius: '50%',
          background: color || 'rgba(201,168,76,0.5)',
          left: `${(i * 17 + 5) % 95}%`,
          top: `${(i * 23 + 10) % 90}%`,
          animation: `float-particle ${4 + (i % 5)}s ease-in-out ${i * 0.4}s infinite alternate`,
          opacity: 0.4 + (i % 4) * 0.15,
        }}/>
      ))}
    </div>
  )
}

/* ── CARTE AGENT (vue grille) ────────────────────────────────── */
function AgentCard({ agent, index, onSelect, highlighted }) {
  const [hovered, setHovered] = useState(false)
  const history = loadHistory(agent.id)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(agent)}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 28,
        background: highlighted ? agent.gradient : hovered ? agent.gradient : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${highlighted ? agent.color + 'aa' : hovered ? agent.color + '55' : 'rgba(255,255,255,0.07)'}`,
        overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: highlighted ? 'translateY(-10px) scale(1.03)' : hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0)',
        boxShadow: highlighted ? `0 0 0 3px ${agent.color}66, 0 24px 70px ${agent.glow}` : hovered ? `0 20px 60px ${agent.glow}` : '0 4px 20px rgba(0,0,0,0.3)',
        animation: highlighted ? `card-enter 0.5s ease ${index * 0.08}s both, agent-chosen 1.6s ease-in-out infinite` : `card-enter 0.5s ease ${index * 0.08}s both`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${agent.color}30 0%, transparent 70%)`, transition: 'opacity 0.3s', opacity: hovered ? 1 : 0.3 }}/>
      <div style={{ height: 3, background: hovered ? agent.color : 'transparent', transition: 'background 0.3s' }}/>

      <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 100%, ${agent.color}15 0%, transparent 65%)`, position: 'relative', overflow: 'hidden' }}>
        <img src={agent.avatar} alt={agent.nom} onLoad={e => { e.target.style.opacity = 1 }}
          style={{ height: 170, width: 'auto', objectFit: 'contain', filter: `drop-shadow(0 -10px 30px ${agent.color}88)`, animation: `float-avatar 3s ease-in-out ${index * 0.3}s infinite alternate`, transition: 'transform 0.3s, opacity 0.5s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)', opacity: 0 }}
        />
      </div>

      <div style={{ padding: '16px 22px 22px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: agent.color, letterSpacing: 1.5, textTransform: 'uppercase' }}>{agent.titre}</span>
        </div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 26, color: 'white', letterSpacing: -0.5 }}>{agent.nom}</h3>
        <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6, fontStyle: 'italic' }}>{agent.tagline}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, boxShadow: `0 0 8px ${agent.color}`, animation: 'pulse-dot 2s ease infinite' }}/>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>En ligne</span>
          <div style={{ flex: 1 }}/>
          {history.length > 0 && (
            <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 9px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              {history.length} souvenir{history.length > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}40`, borderRadius: 20, padding: '3px 10px', fontSize: 10, color: agent.color, fontWeight: 700 }}>{agent.tag.split(' · ')[0]}</span>
        </div>
      </div>

      <div style={{ padding: '0 22px 18px', opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.25s' }}>
        <div style={{ background: agent.color, borderRadius: 12, padding: '10px 0', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#000', boxShadow: `0 4px 20px ${agent.glow}` }}>
          Parler à {agent.nom} →
        </div>
      </div>
    </div>
  )
}

/* ── VUE AGENT ACTIF ─────────────────────────────────────────── */
function AgentWorkspace({ agent, context, onBack }) {
  const [sujet, setSujet] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)
  const [history, setHistory] = useState(() => loadHistory(agent.id))
  const [showHistory, setShowHistory] = useState(false)
  const [notionUrl, setNotionUrl] = useState('')

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const generate = async () => {
    if (!sujet.trim()) { setError('Saisis un sujet avant de générer.'); return }
    setError(''); setResult(''); setLoading(true)
    try {
      const text = await callClaude(agent.systemPrompt(sujet, context))
      setResult(text)

      // Sauvegarde dans l'historique
      const entry = {
        id: Date.now(),
        sujet: sujet.trim(),
        result: text,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      }
      const newHistory = [entry, ...history]
      setHistory(newHistory)
      saveHistory(agent.id, newHistory)

      // Auto-save Notion si configuré
      const url = await saveToNotion({ agentNom: agent.nom, agentId: agent.id, sujet: sujet.trim(), result: text })
      if (url) setNotionUrl(url)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const btnStyle = (active) => ({
    padding: '7px 16px', borderRadius: 10, border: `1.5px solid ${active ? agent.color : 'rgba(255,255,255,0.12)'}`,
    background: active ? agent.color : 'transparent', color: active ? '#000' : 'rgba(255,255,255,0.4)',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto', background: '#080C10', opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${agent.glow} 0%, transparent 65%)`, animation: 'drift 8s ease-in-out infinite alternate' }}/>
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${agent.color}15 0%, transparent 70%)`, animation: 'drift 10s ease-in-out 2s infinite alternate-reverse' }}/>
        <Particles color={agent.color + '88'} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '8px 18px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            ← Retour aux agents
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {history.length > 0 && (
              <button onClick={() => setShowHistory(!showHistory)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: showHistory ? `${agent.color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${showHistory ? agent.color + '44' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: '7px 16px', color: showHistory ? agent.color : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Mémoire ({history.length})
              </button>
            )}
            {history.length > 0 && (
              <button onClick={() => exportHistory(agent, history)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '7px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Exporter .md
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '6px 16px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, boxShadow: `0 0 8px ${agent.color}` }}/>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{agent.nom} — {agent.titre}</span>
            </div>
          </div>
        </div>

        {/* Panneau historique */}
        {showHistory && history.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${agent.color}22`, borderRadius: 20, padding: '20px 24px', marginBottom: 28, maxHeight: 320, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: agent.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Historique de {agent.nom}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((h) => (
                <div key={h.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', cursor: 'pointer' }}
                  onClick={() => { setSujet(h.sujet); setResult(h.result); setShowHistory(false) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.sujet}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{h.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Cliquer pour recharger</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout 2 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 40, alignItems: 'start' }}>

          {/* Colonne gauche */}
          <div style={{ position: 'sticky', top: 32 }}>
            <div style={{ background: agent.gradient, border: `1px solid ${agent.color}33`, borderRadius: 32, padding: '32px 24px', textAlign: 'center', boxShadow: `0 20px 60px ${agent.glow}`, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${agent.color}25 0%, transparent 65%)`, pointerEvents: 'none' }}/>
              <div style={{ position: 'relative', height: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 80, background: `radial-gradient(ellipse, ${agent.color}40 0%, transparent 70%)`, borderRadius: '50%' }}/>
                <img src={agent.avatar} alt={agent.nom} onLoad={e => { e.target.style.opacity = 1 }}
                  style={{ height: 260, width: 'auto', objectFit: 'contain', position: 'relative', filter: `drop-shadow(0 -15px 40px ${agent.color}99)`, animation: 'float-avatar 3.5s ease-in-out infinite alternate', opacity: 0, transition: 'opacity 0.5s ease' }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'pulse-dot 2s infinite' }}/>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>En ligne</span>
                </div>
                <div style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}44`, borderRadius: 20, padding: '5px 14px', fontSize: 11, color: agent.color, fontWeight: 700 }}>{agent.tag}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: agent.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{agent.titre}</div>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 42, color: 'white' }}>{agent.nom}</h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic' }}>{agent.tagline}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 24px' }}>
              <p style={{ margin: '0 0 18px', color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7 }}>{agent.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agent.capacites.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: agent.color, fontSize: 10 }}>✦</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{c.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}25`, borderRadius: 24, padding: '28px', marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                Ton sujet ou ta question
              </label>
              <textarea value={sujet} onChange={e => setSujet(e.target.value)} placeholder={agent.placeholder} rows={4}
                style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', lineHeight: 1.7, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = agent.color + '77'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Ctrl+Entrée pour générer</span>
                <button onClick={generate} disabled={loading} style={{ padding: '13px 36px', borderRadius: 14, border: 'none', background: loading ? 'rgba(255,255,255,0.08)' : agent.color, color: loading ? 'rgba(255,255,255,0.3)' : '#000', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `0 6px 24px ${agent.glow}`, transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif' }}>
                  {loading ? `${agent.nom} réfléchit...` : `Demander à ${agent.nom}`}
                </button>
              </div>

            </div>

            {error && <div style={{ padding: '14px 18px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: 14, color: '#ff6b7a', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            {loading && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '60px 20px', textAlign: 'center' }}>
                <img src={agent.avatar} alt="" style={{ height: 100, objectFit: 'contain', marginBottom: 16, filter: `drop-shadow(0 0 24px ${agent.color})`, animation: 'breathe 1.5s ease-in-out infinite' }}/>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{agent.nom} réfléchit...</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Quelques secondes</div>
              </div>
            )}

            {result && !loading && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}25`, borderRadius: 24, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={agent.avatar} alt="" style={{ height: 38, objectFit: 'contain' }}/>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Réponse de {agent.nom}</span>
                    {notionUrl && (
                      <a href={notionUrl} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textDecoration: 'none', animation: 'bubble-pop 0.3s ease both' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z" opacity=".15"/><path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/></svg>
                        Notion
                      </a>
                    )}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={btnStyle(copied)}>
                    {copied ? 'Copié !' : 'Tout copier'}
                  </button>
                </div>
                <pre style={{ padding: '24px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.85, color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif', maxHeight: 620, overflowY: 'auto' }}>
                  {result}
                </pre>
              </div>
            )}

            {!result && !loading && !error && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{agent.emoji}</div>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 600 }}>Saisis ton sujet à gauche et clique sur "Demander à {agent.nom}"</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PANNEAU SUPERVISEUR ─────────────────────────────────────── */
function SupervisorPanel({ context, onOpenAgent, onRouted, agents }) {
  const [demande, setDemande] = useState('')
  const [phase, setPhase] = useState('idle') // idle | routing | generating | done | error
  const [routing, setRouting] = useState(null) // { agentId, reason, refinedPrompt }
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [notionUrl, setNotionUrl] = useState('')
  const resultRef = useRef(null)

  const selectedAgent = routing ? agents.find(a => a.id === routing.agentId) : null

  const submit = async () => {
    if (!demande.trim()) return
    setError(''); setResult(''); setRouting(null); setPhase('routing')
    try {
      // Appel 1 — Jordan route
      const raw = await callClaude(JORDAN_ROUTING_PROMPT(demande, context), null, 300)
      let decision
      try {
        const clean = raw.replace(/```json|```/g, '').trim()
        const match = clean.match(/\{[\s\S]*\}/)
        decision = JSON.parse(match ? match[0] : clean)
      } catch { throw new Error("Jordan n'a pas pu analyser la demande. Reformule et réessaie.") }
      const agent = agents.find(a => a.id === decision.agentId)
      if (!agent) throw new Error(`Agent inconnu : ${decision.agentId}`)
      setRouting(decision)
      setPhase('generating')
      onRouted && onRouted(decision.agentId)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)

      // Appel 2 — agent génère
      const text = await callClaude(agent.systemPrompt(decision.refinedPrompt, context))
      setResult(text)

      // Sauvegarde historique
      const entry = { id: Date.now(), sujet: decision.refinedPrompt, result: text, date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
      saveHistory(agent.id, [entry, ...loadHistory(agent.id)])

      // Auto-save Notion si configuré
      const url = await saveToNotion({ agentNom: agent.nom, agentId: agent.id, sujet: decision.refinedPrompt, result: text })
      if (url) setNotionUrl(url)

      setPhase('done')
    } catch(e) { setError(e.message); setPhase('error') }
  }

  const reset = () => { setPhase('idle'); setDemande(''); setRouting(null); setResult(''); setError('') }

  return (
    <div style={{ padding: '0 48px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Zone de saisie Jordan */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(13,59,46,0.25) 100%)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 24, padding: '28px 32px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
          Parle à Jordan — il confie ta demande au bon agent
        </div>
        <textarea
          value={demande}
          onChange={e => setDemande(e.target.value)}
          disabled={phase === 'routing' || phase === 'generating'}
          placeholder="Ex : crée un script TikTok sur le rendement de Vivo Energy · analyse les signaux BRVM ce mois · rédige un email post-achat pour le Guide..."
          rows={3}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.18)', color: 'white', fontSize: 14, resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', lineHeight: 1.7 }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(phase === 'done' || phase === 'error') && (
              <button onClick={reset} style={{ padding: '11px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Nouvelle demande
              </button>
            )}
            <button onClick={submit} disabled={phase === 'routing' || phase === 'generating' || !demande.trim()}
              style={{ padding: '11px 28px', borderRadius: 14, border: 'none', background: (phase === 'routing' || phase === 'generating') ? 'rgba(201,168,76,0.2)' : '#C9A84C', color: (phase === 'routing' || phase === 'generating') ? 'rgba(255,255,255,0.3)' : '#0D3B2E', fontWeight: 800, fontSize: 14, cursor: (phase === 'routing' || phase === 'generating') ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: (phase === 'routing' || phase === 'generating') ? 'none' : '0 6px 24px rgba(201,168,76,0.4)', transition: 'all 0.2s' }}>
              {phase === 'routing' ? 'Jordan analyse...' : phase === 'generating' ? `${selectedAgent?.nom || 'Agent'} génère...` : 'Soumettre à Jordan'}
            </button>
          </div>
        </div>
        {error && <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: 10, color: '#ff6b7a', fontSize: 13 }}>{error}</div>}
      </div>

      {/* Décision de routage */}
      {routing && selectedAgent && (
        <div ref={resultRef} style={{ marginTop: 16, animation: 'decision-slide 0.5s cubic-bezier(0.34,1.4,0.64,1) both' }}>
          {/* Speech bubble Jordan */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 12 }}>
            <img src="/avatars/bearded-headset.png" alt="Jordan"
              style={{ height: 64, objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(201,168,76,0.6))', flexShrink: 0 }}/>
            <div style={{ position: 'relative', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '18px 18px 18px 4px', padding: '12px 18px', maxWidth: 480, animation: 'bubble-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.15s both' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600 }}>Jordan —</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
                {routing.reason} C'est le domaine de{' '}
                <span style={{ color: selectedAgent.color, fontWeight: 800, fontFamily: 'Playfair Display, serif', fontSize: 15 }}>{selectedAgent.nom}</span>.
              </div>
            </div>
          </div>

          {/* Bandeau agent sélectionné */}
          <div style={{ background: `linear-gradient(135deg, rgba(13,59,46,0.4) 0%, ${selectedAgent.color}12 100%)`, border: `1px solid ${selectedAgent.color}30`, borderRadius: 20, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, animation: 'decision-slide 0.4s cubic-bezier(0.34,1.3,0.64,1) 0.25s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${selectedAgent.color}12`, border: `1px solid ${selectedAgent.color}35`, borderRadius: 14, padding: '10px 16px', boxShadow: `0 0 24px ${selectedAgent.glow}` }}>
              <img src={selectedAgent.avatar} alt={selectedAgent.nom} style={{ height: 44, objectFit: 'contain', filter: `drop-shadow(0 0 10px ${selectedAgent.color})` }}/>
              <div>
                <div style={{ fontSize: 10, color: selectedAgent.color, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>{selectedAgent.titre}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'Playfair Display, serif' }}>{selectedAgent.nom}</div>
              </div>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', lineHeight: 1.5 }}>
              Prompt optimisé et transmis — {selectedAgent.nom} génère ta réponse...
            </div>
            <button onClick={() => onOpenAgent(selectedAgent)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              Workspace →
            </button>
          </div>
        </div>
      )}

      {/* Loading agent */}
      {phase === 'generating' && selectedAgent && (
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '40px 20px', textAlign: 'center' }}>
          <img src={selectedAgent.avatar} alt="" style={{ height: 80, objectFit: 'contain', marginBottom: 12, filter: `drop-shadow(0 0 20px ${selectedAgent.color})`, animation: 'breathe 1.5s ease-in-out infinite' }}/>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedAgent.nom} prépare ta réponse...</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Prompt optimisé par Jordan</div>
        </div>
      )}

      {/* Résultat */}
      {phase === 'done' && result && selectedAgent && (
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${selectedAgent.color}25`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={selectedAgent.avatar} alt="" style={{ height: 34, objectFit: 'contain' }}/>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Réponse de {selectedAgent.nom}</span>
              {notionUrl && (
                <a href={notionUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textDecoration: 'none', animation: 'bubble-pop 0.3s ease both' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z" opacity=".15"/><path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/></svg>
                  Notion
                </a>
              )}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              style={{ padding: '6px 18px', borderRadius: 10, border: `1.5px solid ${copied ? selectedAgent.color : 'rgba(255,255,255,0.12)'}`, background: copied ? selectedAgent.color : 'transparent', color: copied ? '#000' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {copied ? 'Copié !' : 'Tout copier'}
            </button>
          </div>
          <pre style={{ padding: '24px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.85, color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif', maxHeight: 600, overflowY: 'auto' }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

/* ── PAGE PRINCIPALE ─────────────────────────────────────────── */
export default function Cockpit() {
  const [activeAgent, setActiveAgent] = useState(null)
  const [entered, setEntered] = useState(false)
  const [projetContext, setProjetContext] = useState(() => localStorage.getItem(CONTEXT_KEY) || '')
  const [editingContext, setEditingContext] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)
  const [showNotionSettings, setShowNotionSettings] = useState(false)
  const [notionKey, setNotionKey] = useState(() => localStorage.getItem(NOTION_KEY_STORE) || '')
  const [notionDb, setNotionDb] = useState(() => localStorage.getItem(NOTION_DB_STORE) || '')
  const [brvmJson, setBrvmJson] = useState(null)
  const [brvmStatus, setBrvmStatus] = useState('loading') // loading | ok | fallback
  const notionConfigured = notionKey && notionDb

  // Données BRVM live — chargées depuis l'API Vercel au démarrage
  useEffect(() => {
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setBrvmJson(data); setBrvmStatus('ok') })
      .catch(() => setBrvmStatus('fallback'))
  }, [])

  const brvmData = buildBrvmData(brvmJson)
  const agents = AGENTS(brvmData)

  const handleRouted = (agentId) => {
    setHighlightedId(agentId)
    setTimeout(() => setHighlightedId(null), 5000)
  }

  useEffect(() => {
    const allAvatars = ['/avatars/bearded-headset.png', '/avatars/beanie-notebook.png', '/avatars/glasses-pen.png', '/avatars/suit-headset.png']
    allAvatars.forEach(src => { const img = new Image(); img.src = src })
    setTimeout(() => setEntered(true), 100)
  }, [])

  const saveContext = (val) => {
    setProjetContext(val)
    localStorage.setItem(CONTEXT_KEY, val)
  }

  if (activeAgent) return <AgentWorkspace agent={activeAgent} context={projetContext} onBack={() => setActiveAgent(null)} brvmStatus={brvmStatus} />

  return (
    <div style={{ minHeight: '100vh', background: '#080C10', fontFamily: 'DM Sans, sans-serif', color: 'white', overflowX: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,59,46,0.4) 0%, transparent 65%)', animation: 'drift 12s ease-in-out infinite alternate' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)', animation: 'drift 15s ease-in-out 3s infinite alternate-reverse' }}/>
        <Particles color="rgba(201,168,76,0.35)" />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,12,16,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 22, background: 'linear-gradient(90deg, #C9A84C, #E8C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DiaspoInvest</span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 20 }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cockpit Agents IA</span>
          {brvmStatus === 'ok' && brvmJson && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#00C896', fontWeight: 700 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C896', boxShadow: '0 0 6px #00C896' }}/>
              BRVM live · {new Date(brvmJson.genere_le).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            </span>
          )}
          {brvmStatus === 'fallback' && (
            <span style={{ fontSize: 11, color: 'rgba(255,200,0,0.5)', fontWeight: 600 }}>BRVM · données statiques</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Bouton Notion settings */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotionSettings(!showNotionSettings)}
              title="Configurer Notion"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: notionConfigured ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${notionConfigured ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={notionConfigured ? 'white' : 'rgba(255,255,255,0.3)'}>
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
                <path d="M4 4h16v16H4z" opacity=".1"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: notionConfigured ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>
                {notionConfigured ? 'Notion actif' : 'Notion'}
              </span>
              {notionConfigured && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 6px #4CAF50' }}/>}
            </button>

            {showNotionSettings && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#0F1419', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px', width: 320, zIndex: 200, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'bubble-pop 0.2s ease both' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Configuration Notion</div>

                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 5, fontWeight: 600 }}>Clé API Notion</label>
                <input type="password" value={notionKey}
                  onChange={e => { setNotionKey(e.target.value); localStorage.setItem(NOTION_KEY_STORE, e.target.value) }}
                  placeholder="secret_..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', marginBottom: 12 }}
                />

                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 5, fontWeight: 600 }}>ID de la base Notion</label>
                <input type="text" value={notionDb}
                  onChange={e => { setNotionDb(e.target.value); localStorage.setItem(NOTION_DB_STORE, e.target.value) }}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', marginBottom: 14 }}
                />

                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                  Notion → Settings → My integrations → New integration → copier la clé.<br/>
                  Partage ta base avec l'intégration, puis copie l'ID depuis l'URL.
                </div>

                <button onClick={() => setShowNotionSettings(false)}
                  style={{ marginTop: 14, width: '100%', padding: '9px', borderRadius: 10, border: 'none', background: notionConfigured ? '#4CAF50' : 'rgba(255,255,255,0.08)', color: notionConfigured ? '#000' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {notionConfigured ? 'Notion configuré' : 'Fermer'}
                </button>
              </div>
            )}
          </div>

          {agents.map(a => (
            <button key={a.id} onClick={() => setActiveAgent(a)} title={`${a.nom} — ${a.titre}`}
              style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${a.color}44`, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', padding: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = `0 4px 14px ${a.glow}` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = a.color + '44'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <img src={a.avatar} alt={a.nom} style={{ height: 32, width: 'auto', objectFit: 'contain' }}/>
            </button>
          ))}
        </div>
      </header>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero Jordan */}
        <div style={{ padding: '64px 48px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(13,59,46,0.6) 0%, rgba(201,168,76,0.06) 100%)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 36, padding: '0 48px', display: 'flex', alignItems: 'center', gap: 40, position: 'relative', overflow: 'hidden', minHeight: 200, opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.34,1.2,0.64,1)' }}>
            <div style={{ position: 'absolute', top: -80, right: 80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)', pointerEvents: 'none' }}/>
            <div style={{ flexShrink: 0, height: 260, display: 'flex', alignItems: 'flex-end', position: 'relative', marginLeft: -12 }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 220, height: 80, background: 'radial-gradient(ellipse, rgba(201,168,76,0.5) 0%, transparent 70%)', borderRadius: '50%' }}/>
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 180, height: 180, background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)', borderRadius: '50%' }}/>
              <img src="/avatars/bearded-headset.png" alt="Jordan" onLoad={e => { e.target.style.opacity = 1 }}
                style={{ height: 260, objectFit: 'contain', filter: 'drop-shadow(0 -16px 40px rgba(201,168,76,0.65))', animation: 'float-avatar 4s ease-in-out infinite alternate', position: 'relative', zIndex: 1, opacity: 0, transition: 'opacity 0.5s ease' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 38, background: 'linear-gradient(90deg, #fff 30%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Jordan</h1>
                <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 20, padding: '4px 16px', fontSize: 11, color: '#C9A84C', fontWeight: 800, letterSpacing: 1.2 }}>ORCHESTRATEUR</span>
              </div>
              <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
                Dirige l'équipe de 3 agents IA spécialisés. Sélectionne l'agent adapté et récupère du contenu prêt à publier.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {agents.map(a => (
                  <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color }}/>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{a.nom}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Superviseur */}
        <SupervisorPanel context={projetContext} onOpenAgent={setActiveAgent} onRouted={handleRouted} agents={agents} />

        {/* Contexte projet partagé */}
        <div style={{ padding: '0 48px 28px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '18px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingContext ? 12 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 16, background: '#C9A84C', borderRadius: 2 }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 2, textTransform: 'uppercase' }}>Contexte projet partagé</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>— injecté dans chaque agent</span>
              </div>
              <button onClick={() => setEditingContext(!editingContext)}
                style={{ background: 'none', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 10, padding: '5px 14px', color: '#C9A84C', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {editingContext ? 'Fermer' : projetContext ? 'Modifier' : '+ Ajouter'}
              </button>
            </div>
            {!editingContext && projetContext && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, fontStyle: 'italic' }}>{projetContext}</p>
            )}
            {editingContext && (
              <div>
                <textarea value={projetContext} onChange={e => saveContext(e.target.value)} rows={3}
                  placeholder="Ex : Lancement calculateur en cours · 47 abonnés newsletter · TikTok : 0 vidéos publiées · Objectif : 10 ventes en juin..."
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: 'white', fontSize: 13, resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6 }}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Sauvegardé automatiquement · Visible de tous les agents</div>
              </div>
            )}
          </div>
        </div>

        {/* Grille agents */}
        <div style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 3, height: 22, background: 'linear-gradient(180deg, #C9A84C, transparent)', borderRadius: 2 }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2.5, textTransform: 'uppercase' }}>Ton équipe</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} onSelect={setActiveAgent} highlighted={highlightedId === agent.id} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.18); }
        @keyframes float-avatar { from { transform: translateY(0px); } to { transform: translateY(-12px); } }
        @keyframes float-particle { from { transform: translateY(0) translateX(0); opacity: 0.3; } to { transform: translateY(-20px) translateX(8px); opacity: 0.7; } }
        @keyframes pulse-dot { 0%,100% { box-shadow: 0 0 4px currentColor; transform: scale(1); } 50% { box-shadow: 0 0 12px currentColor; transform: scale(1.3); } }
        @keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, -20px) scale(1.05); } }
        @keyframes breathe { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 12px currentColor); } 50% { transform: scale(1.07) translateY(-6px); filter: drop-shadow(0 0 28px currentColor); } }
        @keyframes card-enter { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes agent-chosen { 0%,100% { box-shadow: 0 0 0 3px var(--ac, rgba(255,255,255,0.3)), 0 24px 70px rgba(0,0,0,0.4); } 50% { box-shadow: 0 0 0 5px var(--ac, rgba(255,255,255,0.5)), 0 24px 70px rgba(0,0,0,0.6); } }
        @keyframes decision-slide { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bubble-pop { from { opacity: 0; transform: scale(0.88) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  )
}
