import { useState, useEffect, useRef } from 'react'

const BRVM_DATA = `Données BRVM Juin 2026 (source : sikafinance.com) :
- Sonatel (SNTS) : 28 500 FCFA · Div net 1 740 FCFA · Rendement 6,11%
- Orange CI (ORAC) : 15 570 FCFA · Div net 720 FCFA · Rendement 4,62%
- Vivo Energy CI : 3 700 FCFA · Div net 270 FCFA · Rendement 7,30%
- SGBCI : 36 015 FCFA · Div net 2 064 FCFA · Rendement 5,73%
- Ecobank CI : 16 300 FCFA · Div net 799 FCFA · Rendement 4,90%
- Taux fixe : 1€ = 655,957 FCFA · Flat Tax France : 31,4%`

const AGENTS = [
  {
    id: 'tiktok',
    nom: 'Imani',
    genre: 'F',
    titre: 'Créatrice de Contenu',
    tag: 'TikTok · Réseaux',
    avatar: '/avatars/beanie-notebook.png',
    color: '#00C896',
    colorDark: '#007A5A',
    gradient: 'linear-gradient(135deg, #003D2E 0%, #00C89622 100%)',
    glow: 'rgba(0,200,150,0.4)',
    emoji: '🎬',
    tagline: '"Je transforme chaque chiffre BRVM en contenu viral."',
    description: 'Imani crée des scripts TikTok percutants avec les vraies données BRVM. Hook en 3 secondes, script 60s, légende, hashtags — tout prêt à filmer.',
    capacites: [
      { icon: '✦', txt: '3 scripts TikTok 60s complets' },
      { icon: '✦', txt: 'Hook percutant en ≤ 8 mots' },
      { icon: '✦', txt: 'Chiffres BRVM réels intégrés' },
      { icon: '✦', txt: '2 variantes de hook par script' },
      { icon: '✦', txt: 'Hashtags + CTA optimisés' },
    ],
    placeholder: 'Ex : comparaison Livret A vs Vivo Energy 7,30%, DCA Sonatel, ouvrir un compte BRVM...',
    systemPrompt: (s) => `Tu es Imani, Créatrice de Contenu TikTok de DiaspoInvest — éducation financière BRVM pour la diaspora africaine en France.
Produis 3 scripts TikTok complets sur : "${s}"
${BRVM_DATA}
Règles : chiffres réels · hook ≤ 8 mots · jamais "conseil en investissement" · 2 variantes hook · framework AIDA/PAS/BAB.
Format pour chaque script :
---
SCRIPT [N] — [Framework]
HOOK A : ...  |  HOOK B : ...
SCRIPT 60s : [texte à dire caméra]
TEXTE ÉCRAN : [3–5 lignes]
LÉGENDE : [2–3 phrases]
HASHTAGS : #...  |  CTA : ...
---`,
  },
  {
    id: 'newsletter',
    nom: 'Malik',
    genre: 'F',
    titre: 'Rédactrice Newsletter',
    tag: 'Brevo · Email',
    avatar: '/avatars/glasses-pen.png',
    color: '#B06FFF',
    colorDark: '#6A2FA0',
    gradient: 'linear-gradient(135deg, #1A0030 0%, #B06FFF22 100%)',
    glow: 'rgba(176,111,255,0.4)',
    emoji: '✉️',
    tagline: '"Je rédige les mots qui font ouvrir et lire."',
    description: 'Malik rédige des newsletters hebdo qui fidélisent ta communauté diaspora. Objet accrocheur, chiffre BRVM du moment, conseil actionnable, CTA naturel.',
    capacites: [
      { icon: '✦', txt: 'Newsletter complète clé en main' },
      { icon: '✦', txt: 'Objet optimisé taux d\'ouverture' },
      { icon: '✦', txt: 'Chiffre BRVM du moment intégré' },
      { icon: '✦', txt: 'Conseil actionnable diaspora' },
      { icon: '✦', txt: 'CTA Gumroad naturel' },
    ],
    placeholder: 'Ex : résumé semaine BRVM, signal fort ce mois, actualité UEMOA...',
    systemPrompt: (s) => `Tu es Malik, Rédacteur Newsletter de DiaspoInvest.
Rédige une newsletter hebdomadaire sur : "${s}"
${BRVM_DATA}
Structure : OBJET (≤50 car.) · INTRO (chiffre BRVM) · CHIFFRE DE LA SEMAINE · CONSEIL ACTIONNABLE · CTA Gumroad.
Ton sobre, fraternel. Jamais "conseil en investissement". Toujours sourcer.`,
  },
  {
    id: 'vente',
    nom: 'Marcus',
    genre: 'M',
    titre: 'Expert Conversion',
    tag: 'Gumroad · Vente',
    avatar: '/avatars/clean-headset.png',
    color: '#FFB830',
    colorDark: '#9A6800',
    gradient: 'linear-gradient(135deg, #1A1000 0%, #FFB83022 100%)',
    glow: 'rgba(255,184,48,0.4)',
    emoji: '💼',
    tagline: '"Je convertis les visiteurs en acheteurs convaincus."',
    description: 'Marcus crée les pages de vente et séquences emails qui génèrent des conversions. Ton fraternel, upsell doux, jamais agressif.',
    capacites: [
      { icon: '✦', txt: 'Séquences post-achat J+0 à J+30' },
      { icon: '✦', txt: 'Pages de vente Gumroad' },
      { icon: '✦', txt: 'Réponses aux objections' },
      { icon: '✦', txt: 'Upsell Guide → Pack (doux)' },
      { icon: '✦', txt: 'Copy chaleureux et communautaire' },
    ],
    placeholder: 'Ex : email bienvenue après achat, upsell calculateur J+7, objection "trop cher"...',
    systemPrompt: (s) => `Tu es Marcus, Expert Conversion de DiaspoInvest.
Rédige : "${s}"
Produits : Guide PDF 9,99€ · Calculateur V13 17,99€ · Pack 24,99€
${BRVM_DATA}
Règles : jamais rendement garanti · "guide éducatif indépendant" · upsell doux · ton fraternel · non affilié BRVM/CREPMF.`,
  },
  {
    id: 'brvm',
    nom: 'Zara',
    genre: 'F',
    titre: 'Analyste BRVM',
    tag: 'BRVM · Marchés',
    avatar: '/avatars/glasses-tablet.png',
    color: '#4FC3F7',
    colorDark: '#0277BD',
    gradient: 'linear-gradient(135deg, #001A2E 0%, #4FC3F722 100%)',
    glow: 'rgba(79,195,247,0.4)',
    emoji: '📊',
    tagline: '"Je lis les marchés africains là où personne ne regarde."',
    description: 'Zara décrypte les marchés BRVM et identifie les signaux forts. Elle ne produit que des chiffres réels, jamais de données inventées.',
    capacites: [
      { icon: '✦', txt: 'Analyse actions BRVM détaillée' },
      { icon: '✦', txt: 'Top opportunités rendement' },
      { icon: '✦', txt: 'Signaux forts > 7% identifiés' },
      { icon: '✦', txt: 'Contexte marché UEMOA' },
      { icon: '✦', txt: 'Angles contenu à exploiter' },
    ],
    placeholder: 'Ex : analyse Sonatel ce mois, quelles actions surveiller, signal Vivo Energy...',
    systemPrompt: (s) => `Tu es Zara, Analyste BRVM de DiaspoInvest.
Analyse : "${s}"
${BRVM_DATA}
Structure : CONTEXTE MARCHÉ · ANALYSE DÉTAILLÉE · TOP OPPORTUNITÉS · SIGNAL ALERTE · RECOMMANDATION CONTENU.
Règles : JAMAIS inventer de chiffres · sourcer sikafinance.com · mentionner Flat Tax 31,4% et formulaire 3916 si pertinent.`,
  },
  {
    id: 'fiscal',
    nom: 'Naomi',
    genre: 'F',
    titre: 'Conseiller Fiscal',
    tag: 'France · Fiscalité',
    avatar: '/avatars/suit-headset.png',
    color: '#FF6B6B',
    colorDark: '#B71C1C',
    gradient: 'linear-gradient(135deg, #1A0000 0%, #FF6B6B22 100%)',
    glow: 'rgba(255,107,107,0.4)',
    emoji: '⚖️',
    tagline: '"Je protège tes acheteurs des erreurs fiscales coûteuses."',
    description: 'Naomi répond aux questions fiscales de tes acheteurs résidents France. Flat Tax, formulaire 3916, conventions bilatérales — avec exemples chiffrés.',
    capacites: [
      { icon: '✦', txt: 'Flat Tax 31,4% expliquée simplement' },
      { icon: '✦', txt: 'Formulaire 3916 (amende 1500€)' },
      { icon: '✦', txt: 'Formulaires 2047 et 2074' },
      { icon: '✦', txt: 'Convention fiscale CI / Sénégal' },
      { icon: '✦', txt: 'Exemples chiffrés concrets' },
    ],
    placeholder: 'Ex : déclarer dividendes BRVM en France, formulaire 3916, convention Côte d\'Ivoire...',
    systemPrompt: (s) => `Tu es Naomi, Conseillère Fiscale de DiaspoInvest.
Réponds : "${s}"
Références : Flat Tax 31,4% (12,8% IR + 18,6% PS) · F3916 compte étranger amende 1500€/an · F2047 revenus étrangers · F2074 plus-values · Convention CI/Sénégal retenue imputable · 1€=655,957 FCFA.
Structure : règle applicable + formulaires + exemple chiffré + disclaimer.
Terminer TOUJOURS par : "Ceci est une information éducative, pas un conseil fiscal. Consultez un expert-comptable pour votre situation personnelle."`,
  },
  {
    id: 'brief',
    nom: 'Jade',
    genre: 'F',
    titre: 'Stratège en Chef',
    tag: 'Stratégie · Lancement',
    avatar: '/avatars/glasses-pen.png',
    color: '#69F0AE',
    colorDark: '#1B5E20',
    gradient: 'linear-gradient(135deg, #001A00 0%, #69F0AE22 100%)',
    glow: 'rgba(105,240,174,0.4)',
    emoji: '👑',
    tagline: '"Je conçois les stratégies qui font vendre."',
    description: 'Jade orchestre les campagnes DiaspoInvest de A à Z. Brief, ICP diaspora, messages clés, calendrier, KPIs — rien n\'est laissé au hasard.',
    capacites: [
      { icon: '✦', txt: 'Brief campagne complet' },
      { icon: '✦', txt: 'ICP diaspora et persona détaillé' },
      { icon: '✦', txt: 'Messages clés par canal' },
      { icon: '✦', txt: 'Calendrier semaine par semaine' },
      { icon: '✦', txt: 'KPIs et métriques de succès' },
    ],
    placeholder: 'Ex : stratégie lancement calculateur Gumroad, campagne TikTok juin 2026...',
    systemPrompt: (s) => `Tu es Jade, Stratège de DiaspoInvest.
Produis un brief campagne complet pour : "${s}"
Produits : Guide 9,99€ · Calculateur 17,99€ · Pack 24,99€ · Canaux : TikTok · Newsletter · Gumroad.
${BRVM_DATA}
Structure : CONTEXTE MARCHÉ · ICP (persona + douleurs + gains) · POSITIONNEMENT · MESSAGES CLÉS par canal · CALENDRIER · KPIs.
Frameworks : StoryBrand · PAS · JTBD · Value Proposition Canvas.`,
  },
]

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
function AgentCard({ agent, index, onSelect }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(agent)}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 28,
        background: hovered ? agent.gradient : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${hovered ? agent.color + '55' : 'rgba(255,255,255,0.07)'}`,
        overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 60px ${agent.glow}` : '0 4px 20px rgba(0,0,0,0.3)',
        animation: `card-enter 0.5s ease ${index * 0.08}s both`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Halo couleur haut */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 180, height: 180,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${agent.color}30 0%, transparent 70%)`,
        transition: 'opacity 0.3s', opacity: hovered ? 1 : 0.3,
      }}/>

      {/* Barre top */}
      <div style={{ height: 3, background: hovered ? agent.color : 'transparent', transition: 'background 0.3s' }}/>

      {/* Avatar zone */}
      <div style={{
        height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: `radial-gradient(ellipse at 50% 100%, ${agent.color}15 0%, transparent 65%)`,
        position: 'relative', overflow: 'hidden',
        paddingBottom: 0,
      }}>
        <img
          src={agent.avatar}
          alt={agent.nom}
          onLoad={e => { e.target.style.opacity = 1 }}
          style={{
            height: 170, width: 'auto', objectFit: 'contain',
            filter: `drop-shadow(0 -10px 30px ${agent.color}88)`,
            animation: `float-avatar 3s ease-in-out ${index * 0.3}s infinite alternate`,
            transition: 'transform 0.3s, opacity 0.5s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            opacity: 0,
          }}
        />
      </div>

      {/* Infos */}
      <div style={{ padding: '16px 22px 22px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: agent.color, letterSpacing: 1.5, textTransform: 'uppercase' }}>{agent.titre}</span>
        </div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 26, color: 'white', letterSpacing: -0.5 }}>
          {agent.nom}
        </h3>
        <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6, fontStyle: 'italic' }}>
          {agent.tagline}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, boxShadow: `0 0 8px ${agent.color}`, animation: 'pulse-dot 2s ease infinite' }}/>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>En ligne</span>
          <div style={{ flex: 1 }}/>
          <span style={{
            background: `${agent.color}15`, border: `1px solid ${agent.color}40`,
            borderRadius: 20, padding: '3px 10px', fontSize: 10, color: agent.color, fontWeight: 700,
          }}>{agent.tag.split(' · ')[0]}</span>
        </div>
      </div>

      {/* CTA apparaît au hover */}
      <div style={{
        padding: '0 22px 18px',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.25s',
      }}>
        <div style={{
          background: agent.color, borderRadius: 12, padding: '10px 0', textAlign: 'center',
          fontSize: 13, fontWeight: 700, color: '#000',
          boxShadow: `0 4px 20px ${agent.glow}`,
        }}>
          Parler à {agent.nom} →
        </div>
      </div>
    </div>
  )
}

/* ── VUE AGENT ACTIF ─────────────────────────────────────────── */
function AgentWorkspace({ agent, onBack }) {
  const [sujet, setSujet] = useState('')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('di_api_key') || '')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const generate = async () => {
    if (!sujet.trim()) { setError('Saisis un sujet avant de générer.'); return }
    if (!apiKey.trim()) { setError('Clé API Claude manquante.'); return }
    setError(''); setResult(''); setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 4000, messages: [{ role: 'user', content: agent.systemPrompt(sujet) }] }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Erreur ${res.status}`) }
      setResult((await res.json()).content[0].text)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto',
      background: '#080C10',
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
    }}>
      {/* Fond animé couleur agent */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -100, left: -100, width: 600, height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${agent.glow} 0%, transparent 65%)`,
          animation: 'drift 8s ease-in-out infinite alternate',
        }}/>
        <div style={{
          position: 'absolute', bottom: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${agent.color}15 0%, transparent 70%)`,
          animation: 'drift 10s ease-in-out 2s infinite alternate-reverse',
        }}/>
        <Particles color={agent.color + '88'} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '8px 18px',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}>← Retour aux agents</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '6px 16px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, boxShadow: `0 0 8px ${agent.color}` }}/>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{agent.nom} — {agent.titre}</span>
          </div>
        </div>

        {/* Layout 2 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 40, alignItems: 'start' }}>

          {/* Colonne gauche — personnage + infos (sticky) */}
          <div style={{ position: 'sticky', top: 32 }}>
            {/* Carte avatar */}
            <div style={{
              background: agent.gradient, border: `1px solid ${agent.color}33`,
              borderRadius: 32, padding: '32px 24px', textAlign: 'center',
              boxShadow: `0 20px 60px ${agent.glow}`, marginBottom: 20,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${agent.color}25 0%, transparent 65%)`, pointerEvents: 'none' }}/>

              {/* Avatar grand */}
              <div style={{ position: 'relative', height: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 80, background: `radial-gradient(ellipse, ${agent.color}40 0%, transparent 70%)`, borderRadius: '50%' }}/>
                <img src={agent.avatar} alt={agent.nom}
                  onLoad={e => { e.target.style.opacity = 1 }}
                  style={{
                  height: 260, width: 'auto', objectFit: 'contain', position: 'relative',
                  filter: `drop-shadow(0 -15px 40px ${agent.color}99)`,
                  animation: 'float-avatar 3.5s ease-in-out infinite alternate',
                  opacity: 0, transition: 'opacity 0.5s ease',
                }}/>
              </div>

              {/* Badge statut */}
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

            {/* Description + capacités */}
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

          {/* Colonne droite — zone chat */}
          <div>
            {/* Input */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}25`, borderRadius: 24, padding: '28px', marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                Ton sujet ou ta question
              </label>
              <textarea
                value={sujet} onChange={e => setSujet(e.target.value)}
                placeholder={agent.placeholder} rows={4}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, resize: 'none',
                  fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                  outline: 'none', lineHeight: 1.7, transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = agent.color + '77'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Ctrl+Entrée pour générer</span>
                <button onClick={generate} disabled={loading} style={{
                  padding: '13px 36px', borderRadius: 14, border: 'none',
                  background: loading ? 'rgba(255,255,255,0.08)' : agent.color,
                  color: loading ? 'rgba(255,255,255,0.3)' : '#000',
                  fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 6px 24px ${agent.glow}`,
                  transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
                }}>{loading ? `${agent.nom} réfléchit...` : `Demander à ${agent.nom}`}</button>
              </div>

              {/* Clé API */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginBottom: 6, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>Clé API Claude</div>
                <div style={{ position: 'relative' }}>
                  <input type={showKey ? 'text' : 'password'} value={apiKey}
                    onChange={e => { setApiKey(e.target.value); localStorage.setItem('di_api_key', e.target.value) }}
                    placeholder="sk-ant-api03-..."
                    style={{ width: '100%', padding: '9px 55px 9px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }}
                  />
                  <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600 }}>{showKey ? 'Cacher' : 'Voir'}</button>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>Stockée dans ton navigateur uniquement</div>
              </div>
            </div>

            {/* Erreur */}
            {error && <div style={{ padding: '14px 18px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: 14, color: '#ff6b7a', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            {/* Loading */}
            {loading && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '60px 20px', textAlign: 'center' }}>
                <img src={agent.avatar} alt="" style={{ height: 100, objectFit: 'contain', marginBottom: 16, filter: `drop-shadow(0 0 24px ${agent.color})`, animation: 'breathe 1.5s ease-in-out infinite' }}/>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{agent.nom} réfléchit...</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Quelques secondes</div>
              </div>
            )}

            {/* Résultat */}
            {result && !loading && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}25`, borderRadius: 24, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={agent.avatar} alt="" style={{ height: 38, objectFit: 'contain' }}/>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Réponse de {agent.nom}</span>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={{ padding: '7px 20px', borderRadius: 10, border: `1.5px solid ${copied ? agent.color : 'rgba(255,255,255,0.12)'}`, background: copied ? agent.color : 'transparent', color: copied ? '#000' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {copied ? 'Copié !' : 'Tout copier'}
                  </button>
                </div>
                <pre style={{ padding: '24px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.85, color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif', maxHeight: 620, overflowY: 'auto' }}>
                  {result}
                </pre>
              </div>
            )}

            {/* Vide */}
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

/* ── PAGE PRINCIPALE ─────────────────────────────────────────── */
export default function Cockpit() {
  const [activeAgent, setActiveAgent] = useState(null)
  const [entered, setEntered] = useState(false)

  // Précharge tous les avatars dès le montage pour éviter le flash
  useEffect(() => {
    const allAvatars = [
      '/avatars/bearded-headset.png',
      '/avatars/beanie-notebook.png',
      '/avatars/glasses-pen.png',
      '/avatars/clean-headset.png',
      '/avatars/glasses-tablet.png',
      '/avatars/suit-headset.png',
    ]
    allAvatars.forEach(src => { const img = new Image(); img.src = src })
    setTimeout(() => setEntered(true), 100)
  }, [])

  if (activeAgent) return <AgentWorkspace agent={activeAgent} onBack={() => setActiveAgent(null)} />

  return (
    <div style={{ minHeight: '100vh', background: '#080C10', fontFamily: 'DM Sans, sans-serif', color: 'white', overflowX: 'hidden' }}>

      {/* Fond animé global */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,59,46,0.4) 0%, transparent 65%)', animation: 'drift 12s ease-in-out infinite alternate' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)', animation: 'drift 15s ease-in-out 3s infinite alternate-reverse' }}/>
        <Particles color="rgba(201,168,76,0.35)" />
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(20px)', background: 'rgba(8,12,16,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 22, background: 'linear-gradient(90deg, #C9A84C, #E8C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DiaspoInvest</span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 20 }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cockpit Agents IA</span>
        </div>
        {/* Mini avatars navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {AGENTS.map(a => (
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

        {/* ── HERO ORCHESTRATEUR ── */}
        <div style={{ padding: '64px 48px 48px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(13,59,46,0.6) 0%, rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.18)', borderRadius: 36,
            padding: '0 48px', display: 'flex', alignItems: 'center', gap: 40,
            position: 'relative', overflow: 'hidden', minHeight: 200,
            opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.34,1.2,0.64,1)',
          }}>
            <div style={{ position: 'absolute', top: -80, right: 80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)', pointerEvents: 'none' }}/>

            {/* Avatar Jordan */}
            <div style={{ flexShrink: 0, height: 260, display: 'flex', alignItems: 'flex-end', position: 'relative', marginLeft: -12 }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 220, height: 80, background: 'radial-gradient(ellipse, rgba(201,168,76,0.5) 0%, transparent 70%)', borderRadius: '50%' }}/>
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 180, height: 180, background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)', borderRadius: '50%' }}/>
              <img
                src="/avatars/bearded-headset.png"
                alt="Jordan"
                onLoad={e => { e.target.style.opacity = 1 }}
                style={{
                  height: 260,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 -16px 40px rgba(201,168,76,0.65))',
                  animation: 'float-avatar 4s ease-in-out infinite alternate',
                  position: 'relative',
                  zIndex: 1,
                  opacity: 0,
                  transition: 'opacity 0.5s ease',
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 38, background: 'linear-gradient(90deg, #fff 30%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Jordan</h1>
                <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 20, padding: '4px 16px', fontSize: 11, color: '#C9A84C', fontWeight: 800, letterSpacing: 1.2 }}>ORCHESTRATEUR</span>
              </div>
              <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
                Dirige l'équipe de 6 agents IA spécialisés de DiaspoInvest. Sélectionne l'agent adapté à ton besoin et récupère du contenu prêt à publier.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AGENTS.map(a => (
                  <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color }}/>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{a.nom}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── GRILLE AGENTS ── */}
        <div style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 3, height: 22, background: 'linear-gradient(180deg, #C9A84C, transparent)', borderRadius: 2 }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2.5, textTransform: 'uppercase' }}>Ton équipe</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {AGENTS.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} onSelect={setActiveAgent} />
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

        @keyframes float-avatar {
          from { transform: translateY(0px); }
          to   { transform: translateY(-12px); }
        }
        @keyframes float-particle {
          from { transform: translateY(0) translateX(0); opacity: 0.3; }
          to   { transform: translateY(-20px) translateX(8px); opacity: 0.7; }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 4px currentColor; transform: scale(1); }
          50%      { box-shadow: 0 0 12px currentColor; transform: scale(1.3); }
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes breathe {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 12px currentColor); }
          50%      { transform: scale(1.07) translateY(-6px); filter: drop-shadow(0 0 28px currentColor); }
        }
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
