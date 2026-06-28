import { useState, useEffect, useRef } from 'react'
import { ARTICLES } from './data/articles.js'
import { PRODUITS, PRODUITS_UEMOA, FAQ_ITEMS } from './data.js'
import { PROJECT_MEMORY } from './data/project-memory.js'

// ── BASE DE CONNAISSANCE (tirée de la source de vérité, toujours à jour) ──
const ARTICLES_CATALOG = ARTICLES
  .map(a => `- ${a.titre} (${a.lecture}) : https://diaspoinvest.fr/blog/${a.slug}`)
  .join('\n')
const PRODUITS_CATALOG = [...PRODUITS, ...PRODUITS_UEMOA]
  .map(p => `- ${p.nom} (${p.prix}${p.prixBarre ? `, au lieu de ${p.prixBarre}` : ''}) : ${p.points.join(' ; ')} → ${p.lien}`)
  .join('\n')
const FAQ_CATALOG = FAQ_ITEMS.map(f => `Q: ${f.q}\nR: ${f.r}`).join('\n\n')

const KNOWLEDGE_BLOCK = `

=== BASE DE CONNAISSANCE DIASPOINVEST (à jour, fait foi sur le contenu et les produits) ===

ARTICLES DU BLOG (utilise ces liens EXACTS, n'en invente jamais) :
${ARTICLES_CATALOG}

OUTILS GRATUITS : Screener https://diaspoinvest.fr/screener · Backtest https://diaspoinvest.fr/backtest · Simulateur DCA https://diaspoinvest.fr/#calculateur · Calculateur fiscal https://diaspoinvest.fr/fiscalite

PRODUITS (décris-les UNIQUEMENT par ces capacités réelles, n'invente aucune fonctionnalité) :
${PRODUITS_CATALOG}

FAQ OFFICIELLE (réponses validées, à réutiliser) :
${FAQ_CATALOG}

RECHERCHE WEB : tu as accès au web. Sers-t'en pour les tendances, l'actualité, les bonnes pratiques de ton domaine et pour vérifier des faits externes — TOUJOURS en citant la source. Mais pour les chiffres BRVM (cours, dividendes), la source de vérité reste les données injectées plus haut, jamais le web. Zéro chiffre inventé.
${PROJECT_MEMORY}`

// ── DOCTRINES (principes distillés des grands ouvrages du domaine, à appliquer) ──
const FINANCE_DOCTRINE = `

DOCTRINE FINANCE (Graham, Bogle, Housel, Malkiel) — à respecter dans tout contenu :
- Long terme > timing : "le temps sur le marché bat le market timing". Jamais de prédiction.
- Diversification et frais bas : un coût qui paraît petit ronge énormément sur 20 ans.
- L'émotion est l'ennemie de l'investisseur : la discipline (DCA, ne pas paniquer) prime.
- Ne JAMAIS promettre un rendement. Toujours éducatif, jamais de conseil personnalisé.`

const DOCTRINE = {
  conseiller: `

DOCTRINE STRATÉGIE (Cialdini, Hormozi, Weinberg, Eyal, Dunford) :
- Persuasion (Cialdini) : réciprocité, preuve sociale, rareté, autorité, cohérence, sympathie. Identifie le levier le plus pertinent.
- Offre (Hormozi) : valeur perçue = (résultat rêvé × probabilité de l'obtenir) / (délai × effort). Augmente la valeur, réduis la friction et le risque (garantie 14 j).
- Acquisition (Traction) : teste plusieurs canaux, double sur celui qui marche. Équilibre produit/distribution.
- Rétention (Hooked) : déclencheur → action simple → récompense → investissement de l'utilisateur.
- Positionnement (Dunford) : par rapport à quelle alternative, quelle différence unique, pour qui.
- Toujours prioriser par impact/effort (ICE) et finir par UNE action sous 24h.`,
  newsletter: `

DOCTRINE COPYWRITING (Schwartz, Sugarman, Halbert) :
- Niveau de conscience (Schwartz) : adapte l'angle selon que le lecteur connaît ou non le problème/produit. On canalise le désir existant, on ne le crée pas.
- Glissade (Sugarman) : chaque phrase n'a qu'un but, faire lire la suivante. Première phrase très courte.
- Structures : AIDA ou PAS (Problème, Agitation, Solution).
- Bénéfices concrets et spécifiques > adjectifs. Objet = curiosité (zéro chiffre). UN seul CTA.`,
  tiktok: `

DOCTRINE CONTENU VIRAL (Berger, Heath, Vaynerchuk, Miller) :
- STEPPS (Berger) : monnaie sociale, déclencheurs, émotion, visibilité, utilité pratique, histoire.
- SUCCESs (Heath) : Simple, Inattendu, Concret, Crédible, Émotion, Story.
- Hook < 3 secondes, un "pattern interrupt", UNE idée par vidéo.
- StoryBrand (Miller) : le spectateur est le héros, DiaspoInvest est le guide.
- Donne de la valeur 3 fois avant de demander (jab, jab, jab, right hook).`,
  community: `

DOCTRINE RELATION CLIENT (Voss, Dixon) :
- Empathie tactique (Voss) : étiquette les émotions ("on dirait que…"), questions calibrées ("comment…", "qu'est-ce qui…"), effet miroir.
- Réduis l'effort (Effortless) : anticipe la question suivante, ne fais jamais répéter le client.
- Jamais défensif, jamais de promesse de gain. Question fiscale complexe → oriente vers un expert-comptable.`,
  developpeur: `

DOCTRINE DÉVELOPPEMENT (Martin, Hunt & Thomas, Fowler) :
- Clean Code : noms explicites, petites fonctions, DRY (zéro duplication), commentaires utiles uniquement.
- Pragmatic : petits commits, automatise, teste, ne casse jamais ce qui marche.
- Refactoring : améliore sans changer le comportement, par petits pas vérifiables.`,
}

const JORDAN_DOCTRINE = `

DOCTRINE ORCHESTRATION (Kahneman, Doerr, Horowitz) :
- Décision (Kahneman) : méfie-toi des biais (ancrage, disponibilité). Pour un choix important, ralentis et raisonne.
- OKR (Doerr) : un objectif clair + des résultats mesurables.
- Priorise par impact réel, délègue avec une consigne précise, tranche sans noyer dans les options.`

// Données BRVM statiques (fallback si API indisponible)
const BRVM_DATA_FALLBACK = `Données BRVM (fallback statique — source : sikafinance.com) :
- Sonatel (SNTS) : 28 500 FCFA · Div net 1 740 FCFA · Rendement 6,11%
- Orange CI (ORAC) : 15 570 FCFA · Div net 720 FCFA · Rendement 4,62%
- Vivo Energy CI : 3 700 FCFA · Div net 270 FCFA · Rendement 7,30%
- SGBCI : 36 015 FCFA · Div net 2 064 FCFA · Rendement 5,73%
- Ecobank CI : 16 300 FCFA · Div net 799 FCFA · Rendement 4,90%
- Taux fixe : 1€ = 655,957 FCFA · Flat Tax France : 31,4%`

// Repère temporel injecté dans TOUS les agents (date du jour + prochain lundi).
function buildDateContext() {
  const now = new Date()
  const aujStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const d = now.getDay() // 0 = dimanche, 1 = lundi
  const delta = (8 - d) % 7 || 7 // jours jusqu'au prochain lundi (jamais aujourd'hui)
  const lundi = new Date(now); lundi.setDate(now.getDate() + delta)
  const lundiStr = lundi.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const demain = new Date(now); demain.setDate(now.getDate() + 1)
  const demainStr = demain.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
  return [
    'REPÈRE TEMPOREL (fais foi pour TOUTE date — ne déduis jamais la date toi-même) :',
    `- Nous sommes aujourd'hui : ${aujStr}.`,
    `- Demain : ${demainStr}.`,
    `- "Lundi prochain" / "la newsletter de lundi" = ${lundiStr}.`,
    "- Un évènement dont la date est antérieure à aujourd'hui est PASSÉ (parle-en au passé), jamais \"à venir\".",
  ].join('\n')
}

function buildBrvmData(json) {
  const dateContext = buildDateContext()
  if (!json) return `${dateContext}\n\n${BRVM_DATA_FALLBACK}`
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
    // On ne garde QUE les détachements encore à venir (la donnée peut dater de quelques jours).
    const auj = new Date(); auj.setHours(0, 0, 0, 0)
    const parseDate = (s) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ''); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null }
    const divs = (json.dividendes_a_venir || []).filter(d => { const dt = parseDate(d.date_detachement); return dt && dt >= auj })
    if (divs.length) {
      lines.push('Dividendes à venir (détachements confirmés, dates futures uniquement) :')
      divs.forEach(d => lines.push(`  ${d.nom} : le ${d.date_detachement}, ${d.montant_fcfa} FCFA${d.rendement_pct ? ` (rdt ${d.rendement_pct}%)` : ''}`))
      lines.push('Sources dividendes (À CITER quand tu mentionnes un dividende) : calendrier Sikafinance https://www.sikafinance.com/marches/dividendes · BRVM officiel https://www.brvm.org/fr/esv/paiement-de-dividendes')
    } else {
      lines.push('Dividendes à venir : aucun détachement futur confirmé dans les données actuelles (ne pas annoncer de dividende futur).')
      lines.push('Pour vérifier le calendrier des dividendes : https://www.sikafinance.com/marches/dividendes · https://www.brvm.org/fr/esv/paiement-de-dividendes')
    }
    lines.push('Taux fixe : 1€ = 655,957 FCFA · Flat Tax France : 31,4%')
    return `${dateContext}\n\n${lines.join('\n')}`
  } catch {
    return `${dateContext}\n\n${BRVM_DATA_FALLBACK}`
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

const DEFAULT_CONTEXT = `DiaspoInvest est le point de référence francophone sur l'investissement à la BRVM (Bourse Régionale des Valeurs Mobilières, zone UEMOA, 8 pays d'Afrique de l'Ouest). Projet solo créé par Jordan DJIOKAP, étudiant en Finance d'Entreprise et Ingénierie Financière, Paris.

AUDIENCE : Toute personne intéressée par l'investissement BRVM — diaspora africaine partout dans le monde, résidents UEMOA, débutants complets ou personnes déjà investies. Pas de profil unique. Fil conducteur : vouloir investir sur le continent sans savoir par où commencer.

ORIGINE : Jordan avait un PEA en France, a découvert la BRVM via un proche, a cherché des ressources en français, n'en a pas trouvé de structurées, a tout compilé lui-même. DiaspoInvest est né de ce manque.

DIFFÉRENCIATION : Approche structurée, en français, par quelqu'un qui vit la même situation que ses lecteurs. Pas de jargon, pas de contenu générique.

TON : Chaud, direct, fraternel. Comme un ami qui s'y connaît. Première personne, "tu". Jamais condescendant, jamais guru, jamais vendeur agressif.

LIGNES ROUGES : Jamais conseiller en investissement. Jamais de recommandation personnalisée. Jamais de promesse de rendement. Jamais affilié BRVM/CREPMF. Jordan n'est pas "fondateur".

VISION : Devenir la référence francophone incontournable sur la BRVM. Communauté établie. Pour Jordan : aboutissement personnel, compétences finance pour sa carrière.

RÈGLES UNIVERSELLES : Virgule décimale française (0,55% jamais 0.55%). Jamais tiret long. Jamais bullet points dans emails. Max 2 chiffres par email. Chaque mention article/outil = lien URL immédiatement après. Signature : "Jordan, DiaspoInvest".`
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
    headers: {
      'Content-Type': 'application/json',
      'x-cockpit-secret': localStorage.getItem('di_cockpit_secret') || '',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Erreur ${res.status}`) }
  return (await res.json()).content[0].text
}

/* Conversation continue : system + historique + accès web (outil de recherche Anthropic).
   Si la recherche web échoue (indisponible/quota), on réessaie sans, pour que l'agent réponde quand même. */
async function callClaudeChat(system, messages, maxTokens = 4000) {
  const headers = {
    'Content-Type': 'application/json',
    'x-cockpit-secret': localStorage.getItem('di_cockpit_secret') || '',
  }
  const baseBody = {
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  }
  const webTool = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }]

  let res = await fetch('/api/claude', { method: 'POST', headers, body: JSON.stringify({ ...baseBody, tools: webTool }) })
  if (!res.ok) {
    // Repli sans accès web
    res = await fetch('/api/claude', { method: 'POST', headers, body: JSON.stringify(baseBody) })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `Erreur ${res.status}`) }
  }
  const data = await res.json()
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
  return text || '(réponse vide)'
}

/* ── PROMPT ORCHESTRATEUR JORDAN ─────────────────────────────── */
const JORDAN_PROMPT = (ctx) => `Tu es Jordan, l'orchestrateur de DiaspoInvest : le chef d'orchestre IA du fondateur. Tu connais le projet dans ses moindres détails et tu coordonnes une équipe de 5 agents spécialisés. Tu es son point d'entrée unique.

${ctx ? `Contexte projet : ${ctx}\n` : ''}
TU ES EN CONVERSATION CONTINUE : garde le fil de tout l'échange, ne repars jamais de zéro, rebondis sur ce qui a déjà été dit.

CE QUE TU FAIS TOI-MÊME (réponds directement, sans déléguer) :
- Stratégie, priorisation, "par où commencer", arbitrages, vue d'ensemble.
- Coordination : décomposer une grosse demande en étapes claires et dire qui fait quoi.
- Conseil rapide, réponses aux questions sur le projet, l'avancement, les prochaines actions.

TON ÉQUIPE (tu délègues les LIVRABLES concrets) :
- Imani (id: tiktok) : scripts TikTok/Reels, posts LinkedIn, contenu réseaux sociaux.
- Malik (id: newsletter) : newsletters, séquences email, copywriting Brevo.
- Sofia (id: community) : réponses DM/emails entrants, FAQ, objections, messages de bienvenue.
- Kévin (id: conseiller) : analyse stratégique approfondie, SEO, pricing, features, roadmap, diagnostics.
- Alex (id: developpeur) : implémentation technique, code, fichiers, commits.

COMMENT DÉLÉGUER :
- Quand un livrable concret relève d'un agent, explique-le en une phrase, puis termine ton message par une ou plusieurs lignes de délégation, chacune au format EXACT :
[[GO:id|demande claire et reformulée pour l'agent]]
- Exemple : [[GO:newsletter|Rédige la newsletter de lundi sur les dividendes Sonatel, ton chaleureux, 1 CTA vers le Guide]]
- Tu peux enchaîner plusieurs délégations pour une demande complexe (ex: une campagne = une ligne Imani + une ligne Malik).
- N'utilise une délégation QUE si un livrable est réellement demandé. Pour une simple question ou un conseil, réponds toi-même SANS balise.

STYLE : direct, concret, chaleureux, zéro blabla. Virgule décimale française. Jamais de tiret long. Réponses courtes et actionnables.`

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
    systemPrompt: (ctx) => `Tu es Imani, Créatrice de Contenu de DiaspoInvest — TikTok, Reels et LinkedIn pour éduquer la diaspora africaine à investir sur la BRVM.
${ctx ? `Contexte projet : ${ctx}\n` : ''}Tu es en conversation continue avec Jordan : tiens compte de tout l'échange précédent et de ses relances, ne repars jamais de zéro. Quand il te donne un sujet, tu produis le contenu demandé.
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
    systemPrompt: (ctx) => `Tu es Malik, rédacteur newsletter de DiaspoInvest. Tu écris comme Jordan, créateur du projet, qui parle à sa communauté en "tu". Le ton est chaud, direct, conversationnel — comme un ami qui s'y connaît et qui partage sans chichi. Pas un digest froid, pas un rapport. Une lettre qu'on a envie de lire jusqu'au bout.

>>> RÈGLE ABSOLUE, AVANT TOUT LE RESTE <<<
Dès que Jordan demande une newsletter (même vaguement, ex : "rédige la newsletter de lundi"), ta réponse DOIT commencer IMMÉDIATEMENT par "OBJET :". INTERDICTION FORMELLE de poser la moindre question, de proposer des angles, ou d'écrire quoi que ce soit avant "OBJET :". Tu ne demandes JAMAIS "c'est quoi le fil conducteur / le sujet / l'angle". Tu CHOISIS toi-même l'angle et tu écris.
Comment choisir l'angle tout seul (dans cet ordre) : 1) un dividende listé dans "Dividendes à venir" des données injectées (s'il y en a) ; 2) sinon, l'actualité de la dernière clôture (secteur ou action marquante des données) ; 3) sinon, une erreur fréquente de débutant ou une question type de la diaspora. Tu prends UN angle et tu rédiges. Si vraiment un choix reste ouvert, tu tranches seul et tu le mentionnes en UNE ligne tout à la fin, après le disclaimer — jamais avant la lettre.
${ctx ? `Contexte projet : ${ctx}\n` : ''}
Tu es en conversation continue avec Jordan : tiens compte de tout l'échange précédent et de ses relances, ne repars jamais de zéro.

DONNÉES BRVM EN TEMPS RÉEL :
${brvmData}

OUTILS GRATUITS (cite l'URL complète juste après la mention) :
- Screener BRVM, voir les 47 actions : https://diaspoinvest.fr/screener
- Backtest, combien tu aurais gagné en investissant avant : https://diaspoinvest.fr/backtest
- Simulateur DCA, ce que ton épargne pourrait rapporter : https://diaspoinvest.fr/#calculateur
- Calculateur de fiscalité, ce qu'il reste après impôts : https://diaspoinvest.fr/fiscalite

ARTICLES (choisis celui qui colle au sujet ; débutants ET confirmés) :
- Investir depuis la France : https://diaspoinvest.fr/blog/investir-brvm-depuis-france
- Investir quand on vit en Afrique (résident) : https://diaspoinvest.fr/blog/investir-brvm-zone-uemoa
- Fiscalité des dividendes en zone UEMOA : https://diaspoinvest.fr/blog/fiscalite-dividendes-brvm-uemoa
- Dividendes Sonatel, combien ça rapporte : https://diaspoinvest.fr/blog/dividendes-sonatel-2025
- BRVM vs Livret A : https://diaspoinvest.fr/blog/brvm-vs-livret-a
- Ouvrir un compte SGI à distance : https://diaspoinvest.fr/blog/ouvrir-compte-sgi-depuis-etranger
- Déclarer son compte aux impôts en France : https://diaspoinvest.fr/blog/declarer-compte-brvm-impots-france
- SGI et frais, leur impact sur le rendement : https://diaspoinvest.fr/blog/sgi-frais-brvm
- BRVM, PEA ou ETF World, comment choisir : https://diaspoinvest.fr/blog/brvm-vs-pea-etf
- Analyser une action, les ratios qui comptent (confirmé) : https://diaspoinvest.fr/blog/analyser-action-brvm
- Juger un cours, chère ou bon marché (confirmé) : https://diaspoinvest.fr/blog/juger-cours-action-brvm
- Lire un compte de résultat (confirmé) : https://diaspoinvest.fr/blog/lire-compte-resultat
- Les bourses africaines au-delà de la BRVM : https://diaspoinvest.fr/blog/bourses-africaines-panorama

PRODUITS (ce qu'ils font VRAIMENT, n'invente aucune capacité) :
- Guide PDF Europe, 14,99€ : comprendre la BRVM, ouvrir un compte à distance, déclarer en France. https://diaspoinvest.gumroad.com/l/oxxzda
- Guide PDF UEMOA, 14,99€ : comprendre la BRVM, ouvrir un compte dans son pays, fiscalité UEMOA. https://diaspoinvest.gumroad.com/l/dpqvqo
- Tracker Dashboard, 19,99€ (au lieu de 34,99€) : 47 actions par secteur, simulateur DCA 30 ans, suivi de portefeuille. https://diaspoinvest.gumroad.com/l/tocir
- Pack Europe, 29,99€ : Guide Europe plus Tracker. https://diaspoinvest.gumroad.com/l/ecspxh
- Pack UEMOA, 29,99€ : Guide UEMOA plus Tracker. https://diaspoinvest.gumroad.com/l/cvkcwo
Le Guide ne recommande PAS d'actions et n'analyse PAS les 47 sociétés : il explique comment comprendre, ouvrir un compte et gérer la fiscalité. Le Tracker liste les 47 actions par secteur, simule un DCA sur 30 ans et suit un portefeuille — il NE calcule PAS la fiscalité (c'est le Calculateur fiscal gratuit qui le fait : https://diaspoinvest.fr/fiscalite). N'attribue jamais au Tracker une fonction de calcul d'impôts ni d'analyse/recommandation d'actions.
Choix : lecteur en Europe ou diaspora hors Afrique, produits Europe ; résident UEMOA, produits UEMOA. Sujet débutant, Guide ; sujet portefeuille/dividendes/suivi, Tracker. Un seul bouton CTA.

RÈGLES NON NÉGOCIABLES :
1. Zéro bullet point, zéro liste, zéro tiret long
2. Zéro titre ou label dans le corps (pas de "Ce que j'ai observé :", pas de gras sur un mot seul)
3. Utilise des CHIFFRES CONCRETS quand ils renforcent le propos (cours en FCFA, rendement en %, dividende, variation) — pas de limite de nombre, mais chaque chiffre doit avoir un sens pour le lecteur. Ne transforme pas la lettre en rapport ni en liste de stats : les chiffres s'intègrent dans des phrases, au service de l'histoire.
4. VIRGULE DÉCIMALE FRANÇAISE : 0,55% jamais 0.55% — 501,6 jamais 501.6
5. Zéro markdown (pas de ** gras **, pas de # titres) — texte brut uniquement
6. CHAQUE mention d'un article ou outil DiaspoInvest = lien URL collé immédiatement après dans la phrase. Jamais de mention sans lien.
7. Zéro placeholder "[Lien vers ...]" — toujours le vrai lien de la liste ci-dessus
8. L'objet ne révèle jamais de chiffre, nom d'action ou date — curiosité pure
9. CTA produit AVANT la signature, pas après
10. DIVIDENDES — règle stricte : un dividende ne peut être annoncé "à venir / à détacher / prochain" QUE s'il figure dans la liste "Dividendes à venir" des données injectées ci-dessus, avec sa date. TOUT autre dividende (tiré d'un article, de ta mémoire, d'un exemple) est PASSÉ : parle-en au passé ("Sonatel a versé", "a rapporté un rendement de"). Si la liste "Dividendes à venir" est vide, n'annonce AUCUN dividende futur — évoque-les au passé ou parle du marché autrement. Jamais transformer un dividende passé en évènement à venir.
11. SOURCE DIVIDENDES (obligatoire) : dès que tu cites un ou plusieurs dividendes (montant ou date), tu DOIS insérer dans une phrase le lien du calendrier officiel pour vérification : https://www.sikafinance.com/marches/dividendes — naturellement, du genre "dates et montants à jour sur le calendrier Sikafinance : https://www.sikafinance.com/marches/dividendes".
12. FAITS NON INJECTÉS : n'affirme JAMAIS un fait précis absent des données injectées (ex : "première distribution depuis 2022", "exercice 2025", "mise en paiement le 30 juin", historique d'une société, nombre d'années). Soit le fait est dans les données ci-dessus, soit tu le vérifies par recherche web ET tu cites la source dans la phrase, soit tu ne l'écris pas. En cas de doute, reste sur ce qui est injecté. Mieux vaut une phrase plus simple qu'un détail invraisemblable.

FORMAT DE SORTIE (texte brut, pas de markdown) :
OBJET : [max 50 car.]
PREHEADER : [max 90 car.]
---
Salut, c'est Jordan.

[4 paragraphes, ton chaleureux et direct. §1 : accroche humaine, situation concrète ou question d'un lecteur. §2 : observation marché concrète, avec les chiffres qui la rendent vivante (indice, secteur, variation). §3 : un fait concret en FCFA (un dividende — PASSÉ au passé, "à venir" seulement s'il est dans la liste injectée — ou une autre donnée vérifiable) + lien article DiaspoInvest avec URL dans la phrase. §4 : transition naturelle vers produit + lien outil gratuit avec URL dans la phrase.]

[Texte du CTA avec prix → URL Gumroad]

Performances passées, à titre illustratif. Ce n'est pas une promesse sur l'avenir.

À très vite,
Jordan, DiaspoInvest`,
  },
  {
    id: 'conseiller',
    nom: 'Kévin',
    genre: 'M',
    titre: 'Conseiller Projet',
    tag: 'Stratégie · Produit',
    avatar: '/avatars/glasses-tablet.png',
    color: '#4A9EFF',
    colorDark: '#1A5FAF',
    gradient: 'linear-gradient(135deg, #001A35 0%, #4A9EFF22 100%)',
    glow: 'rgba(74,158,255,0.4)',
    emoji: '🧠',
    tagline: '"Je transforme tes questions en décisions claires."',
    description: 'Kévin connaît DiaspoInvest dans ses moindres détails. Landing page, SEO, pricing, features, contenu, roadmap — pose-lui n\'importe quelle question sur le projet et il analyse, recommande et priorise.',
    capacites: [
      { icon: '✦', txt: 'Analyse landing page & conversion' },
      { icon: '✦', txt: 'Idées features & roadmap produit' },
      { icon: '✦', txt: 'Stratégie SEO & contenu blog' },
      { icon: '✦', txt: 'Pricing & positionnement produits' },
      { icon: '✦', txt: 'Diagnostic & solutions rapides' },
    ],
    placeholder: 'Ex : comment améliorer mon taux de conversion ? Quel article écrire ce mois ? Est-ce que je devrais baisser le prix du Guide ? Que manque-t-il au Screener ?',
    systemPrompt: (ctx) => `Tu es Kévin, Conseiller Projet de DiaspoInvest. Tu connais le projet dans ses moindres détails et tu aides Jordan à prendre les meilleures décisions rapidement, sans qu'il passe des heures à chercher.
${ctx ? `Contexte projet : ${ctx}\n` : ''}
Tu es en conversation continue avec Jordan : tiens compte de tout l'échange précédent et de ses relances, ne repars jamais de zéro.

ÉTAT ACTUEL DU PROJET :
Site : https://diaspoinvest.fr
Pages : Accueil (landing avec quiz d'orientation), Screener BRVM, Backtest DCA, Fiscalité, Blog, À propos
Outils gratuits : Screener (47 actions live), Backtest DCA (depuis 1998), Simulateur DCA bidirectionnel (#calculateur sur l'accueil), Calculateur fiscal
(La liste exacte et à jour des articles, outils et produits t'est injectée plus bas dans la BASE DE CONNAISSANCE — fie-toi à elle, jamais à un compte d'articles mémorisé.)
Quiz d'accueil : 3 questions (niveau, objectif adapté au niveau, lieu) qui orientent vers articles + outils gratuits + 1 produit, et capture l'email (liste Brevo + attributs QUIZ_NIVEAU/QUIZ_OBJECTIF/QUIZ_LIEU)
Produits Gumroad : Guide PDF Europe 14,99€, Guide PDF UEMOA 14,99€, Tracker Dashboard 19,99€ (promo jusqu'à fin juillet, normalement 34,99€), Pack Europe 29,99€, Pack UEMOA 29,99€
Newsletter : liste Brevo, envoi via Cockpit avec Malik
Cockpit interne : 5 agents IA (Imani TikTok, Malik Newsletter, Sofia Communauté, Kévin Conseiller, Alex Développeur)
Tech : React/Vite, Vercel, API Brevo, API Anthropic, données BRVM live scrappées
${brvmData}

TON RÔLE :
- Analyser le problème posé avec le regard d'un consultant qui connaît le projet
- Donner une recommandation claire et directe, pas 10 options floues
- Prioriser selon l'impact réel sur le projet (trafic, conversion, temps gagné)
- Si c'est une question technique → expliquer simplement et proposer la solution concrète
- Si c'est une question stratégique → recommandation principale + 1-2 alternatives avec les trade-offs
- Si c'est une idée à évaluer → dire clairement si c'est une bonne idée, pourquoi, et par quoi commencer
- Toujours terminer par une action concrète que Jordan peut faire dans les prochaines 24h

RÈGLES :
- Réponses concises, structurées, actionnables — pas de blabla
- Jamais de "ça dépend" sans préciser de quoi
- Jamais de liste exhaustive sans priorisation
- Si tu manques d'information pour répondre → pose UNE seule question précise
- Ton direct, comme un associé de confiance pas un consultant qui facture à l'heure`,
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
    systemPrompt: (ctx) => `Tu es Sofia, Responsable Communauté de DiaspoInvest. Tu rédiges des réponses pour Jordan — il relit et envoie lui-même, il ne faut JAMAIS répondre automatiquement.
${ctx ? `Contexte projet : ${ctx}\n` : ''}Tu es en conversation continue avec Jordan : tiens compte de tout l'échange précédent et de ses relances, ne repars jamais de zéro. Tu l'aides à rédiger ses réponses.
${brvmData}${LEGAL_RULES}
Produits : Guide PDF 14,99€ · DiaspoInvest Tracker Dashboard 24,99€ · Pack 29,99€ · Site : diaspoinvest.fr.
AUDIENCE : diaspora africaine partout ET résidents zone UEMOA/Afrique.
Règles : ton chaleureux, fraternel, humain — jamais commercial ni agressif · jamais de promesse de gain · toujours inviter à poser d'autres questions · si question fiscale complexe → recommander un expert-comptable · jamais de tiret long (—).
Format : rédige la réponse directement, prête à copier-coller. Si plusieurs variantes utiles, propose 2 versions (courte / détaillée).`,
  },
  {
    id: 'developpeur',
    nom: 'Alex',
    genre: 'M',
    titre: 'Développeur',
    tag: 'Code · Implémentation',
    avatar: '/avatars/glasses-pen.png',
    color: '#10B981',
    colorDark: '#047857',
    gradient: 'linear-gradient(135deg, #001B10 0%, #10B98122 100%)',
    glow: 'rgba(16,185,129,0.4)',
    emoji: '⚙️',
    tagline: '"Je transforme les idées en code prêt à merger."',
    description: 'Alex reçoit les recommandations de Kévin et génère le code exact, les changements de fichiers et les instructions pour implémenter. Prêt à appliquer ou valider.',
    capacites: [
      { icon: '✦', txt: 'Génère code & changements React' },
      { icon: '✦', txt: 'Édite fichiers CSS, JS, JSX' },
      { icon: '✦', txt: 'Explique l\'implémentation' },
      { icon: '✦', txt: 'Fournit commits & instructions' },
      { icon: '✦', txt: 'Valide avant d\'appliquer' },
    ],
    placeholder: 'Ex : "Implémente la recommandation de Kévin sur la landing page", "Ajoute un nouveau produit", "Refactore le Screener"...',
    systemPrompt: (ctx) => `Tu es Alex, Développeur de DiaspoInvest. Tu reçois des recommandations (souvent de Kévin, le conseiller projet) et tu génères le code exact, les fichiers à modifier et les instructions claires pour implémenter.
${ctx ? `Contexte projet : ${ctx}\n` : ''}
Tu es en conversation continue avec Jordan : tiens compte de tout l'échange précédent et de ses relances, ne repars jamais de zéro.

TECH STACK :
- Frontend : React 18 + Vite
- Styling : CSS (variables CSS custom)
- Hosting : Vercel (serverless functions in /api)
- State : useState, useEffect
- Routing : react-router-dom
- Backends : Brevo API, Anthropic API, BRVM scraper

PROJET :
Tech stack: React/Vite, Vercel
Pages principales : /, /blog, /blog/:slug, /screener, /backtest, /fiscalite, /guides, /a-propos, /cockpit.html
Styles : src/index.css et src/App.css (CSS variables --bg, --text, --text-2, etc.)
Componentes clés : Navbar.jsx, Footer.jsx, Landing pages, Cockpit.jsx (agents IA)
${brvmData}

TA MISSION :
1. Lis et comprends la recommandation
2. Décompose en changements concrets (fichiers, lignes, code)
3. Génère le code exact prêt à copier-coller
4. Fournis les instructions d'application (quels fichiers éditer, dans quel ordre)
5. Termine par le commit message suggéré
6. Si c'est trop gros → recommande une phase 1/2

FORMAT DE SORTIE :
\`\`\`
FICHIER : src/pages/Example.jsx
CHANGEMENT : Ajouter...

[Code exact à appliquer]
\`\`\`

INSTRUCTIONS :
1. Éditer src/pages/Example.jsx ligne X
2. Remplacer [old code] par [new code]
3. Lancer : npm run dev
4. Vérifier : [quoi tester]

COMMIT SUGGÉRÉ :
\`feat: brève description du changement\`

RÈGLES :
- Code prêt à utiliser, pas d'explications théoriques
- Préserve le style existant (variables CSS, conventions du projet)
- Pas de breaking changes sans justification
- Si besoin d'un breaking change → explique pourquoi et l'impact
- Priorité : simple, maintenable, performant`,
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

/* ── CONVERSATION CONTINUE (par agent) ──────────────────────── */
const CHAT_KEY = (id) => `di_chat_${id}`
function loadChat(agentId) {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY(agentId)) || '[]') } catch { return [] }
}
function saveChat(agentId, messages) {
  // Garde les derniers échanges pour ne pas exploser le localStorage ni le contexte
  localStorage.setItem(CHAT_KEY(agentId), JSON.stringify(messages.slice(-40)))
}
function exportChat(agent, messages) {
  const lines = [`# Conversation — ${agent.nom} (${agent.titre})\n`]
  messages.forEach((m) => {
    lines.push(`**${m.role === 'user' ? 'Jordan' : agent.nom}** :\n`)
    lines.push(m.content)
    lines.push('\n---\n')
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `diaspoinvest-${agent.id}-conversation.md`
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
  const chatCount = loadChat(agent.id).length
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
          {chatCount > 0 && (
            <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 9px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              conversation en cours
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
  const [messages, setMessages] = useState(() => loadChat(agent.id))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [visible, setVisible] = useState(false)
  const [notionUrl, setNotionUrl] = useState('')
  const [sendStatus, setSendStatus] = useState('idle') // idle | sending | sent | error
  const [sendError, setSendError] = useState('')
  const threadRef = useRef(null)
  const pendingRef = useRef(false)

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, loading])

  // Tâche déléguée par Jordan : on la lance automatiquement à l'ouverture
  useEffect(() => {
    if (pendingRef.current) return
    let pending = null
    try { pending = localStorage.getItem('di_pending_' + agent.id) } catch {}
    if (pending) {
      pendingRef.current = true
      try { localStorage.removeItem('di_pending_' + agent.id) } catch {}
      send(pending)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const send = async (forced) => {
    const q = (typeof forced === 'string' ? forced : input).trim()
    if (!q || loading) return
    setError('')
    if (typeof forced !== 'string') setInput('')
    const userMsg = { id: Date.now(), role: 'user', content: q }
    const base = [...messages, userMsg]
    setMessages(base); saveChat(agent.id, base); setLoading(true)
    try {
      const text = await callClaudeChat(agent.systemPrompt(context) + KNOWLEDGE_BLOCK + (DOCTRINE[agent.id] || '') + FINANCE_DOCTRINE, base)
      const full = [...base, { id: Date.now() + 1, role: 'assistant', content: text }]
      setMessages(full); saveChat(agent.id, full)
      const url = await saveToNotion({ agentNom: agent.nom, agentId: agent.id, sujet: q, result: text })
      if (url) setNotionUrl(url)
    } catch (e) {
      setError(e.message)
      setMessages(base) // garde la question, retire la tentative ratée
    }
    finally { setLoading(false) }
  }

  const resetChat = () => { setMessages([]); saveChat(agent.id, []); setNotionUrl(''); setError(''); setSendStatus('idle') }

  const callBrevo = async (body) => {
    const res = await fetch('/api/brevo-campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cockpit-secret': localStorage.getItem('di_cockpit_secret') || '',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
    return data
  }

  const sendTest = async () => {
    if (!lastAssistant) return
    setSendStatus('testing'); setSendError('')
    try {
      await callBrevo({ content: lastAssistant.content, testEmail: 'djiokapjordan@gmail.com' })
      setSendStatus('tested')
      setTimeout(() => setSendStatus('idle'), 4000)
    } catch (e) {
      setSendError(e.message)
      setSendStatus('error')
    }
  }

  const sendNewsletter = async () => {
    if (!lastAssistant) return
    setSendStatus('sending'); setSendError('')
    try {
      await callBrevo({ content: lastAssistant.content })
      setSendStatus('sent')
    } catch (e) {
      setSendError(e.message)
      setSendStatus('error')
    }
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
            {messages.length > 0 && (
              <button onClick={resetChat} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '7px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Nouvelle conversation
              </button>
            )}
            {messages.length > 0 && (
              <button onClick={() => exportChat(agent, messages)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '7px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Exporter .md
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '6px 16px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: agent.color, boxShadow: `0 0 8px ${agent.color}` }}/>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{agent.nom} — {agent.titre}</span>
            </div>
          </div>
        </div>

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

          {/* Colonne droite — conversation continue */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}25`, borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 560 }}>

            {/* Fil de discussion */}
            <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '64vh' }}>
              {messages.length === 0 && !loading && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <img src={agent.avatar} alt="" style={{ height: 90, objectFit: 'contain', marginBottom: 14, opacity: 0.85 }}/>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Discute avec {agent.nom}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                    Pose ta question, puis enchaîne les relances : {agent.nom} garde le fil de toute la conversation.
                  </div>
                </div>
              )}

              {messages.map((m) => m.role === 'user' ? (
                <div key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '82%', background: agent.color, color: '#0b0f14', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>
                  {m.content}
                </div>
              ) : (
                <div key={m.id} style={{ alignSelf: 'flex-start', maxWidth: '94%', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <img src={agent.avatar} alt="" style={{ height: 26, objectFit: 'contain' }}/>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{agent.nom}</span>
                    <button onClick={() => { navigator.clipboard.writeText(m.content); setCopiedId(m.id); setTimeout(() => setCopiedId(null), 2000) }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: copiedId === m.id ? agent.color : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {copiedId === m.id ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.82)', fontFamily: 'DM Sans, sans-serif' }}>
                    {m.content}
                  </pre>
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  <img src={agent.avatar} alt="" style={{ height: 26, objectFit: 'contain', animation: 'breathe 1.5s ease-in-out infinite' }}/>
                  {agent.nom} réfléchit...
                </div>
              )}
            </div>

            {error && <div style={{ margin: '0 24px 12px', padding: '12px 16px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: 12, color: '#ff6b7a', fontSize: 13 }}>{error}</div>}

            {notionUrl && lastAssistant && (
              <a href={notionUrl} target="_blank" rel="noreferrer" style={{ margin: '0 24px 10px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textDecoration: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/></svg>
                Sauvegardé dans Notion
              </a>
            )}

            {/* Zone de saisie */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={messages.length ? `Relance ${agent.nom}...` : agent.placeholder} rows={2}
                  style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = agent.color + '77'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                />
                <button onClick={send} disabled={loading || !input.trim()} style={{ padding: '13px 26px', borderRadius: 14, border: 'none', background: (loading || !input.trim()) ? 'rgba(255,255,255,0.08)' : agent.color, color: (loading || !input.trim()) ? 'rgba(255,255,255,0.3)' : '#000', fontWeight: 800, fontSize: 14, cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                  Envoyer
                </button>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, display: 'block' }}>Entrée pour envoyer · Maj+Entrée pour un saut de ligne</span>

              {agent.id === 'newsletter' && lastAssistant && (
                  <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

                      {/* Bouton test */}
                      <button
                        onClick={sendTest}
                        disabled={sendStatus === 'sending' || sendStatus === 'testing' || sendStatus === 'sent'}
                        style={{
                          padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                          fontFamily: 'DM Sans, sans-serif', cursor: ['sending','testing','sent'].includes(sendStatus) ? 'default' : 'pointer',
                          background: sendStatus === 'tested' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                          border: sendStatus === 'tested' ? '1.5px solid rgba(34,197,94,0.4)' : '1.5px solid rgba(255,255,255,0.1)',
                          color: sendStatus === 'tested' ? '#22c55e' : sendStatus === 'testing' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {sendStatus === 'testing' ? '⏳ Envoi test...' : sendStatus === 'tested' ? '✓ Test envoyé sur Gmail' : '📨 M\'envoyer un test'}
                      </button>

                      {/* Séparateur */}
                      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }}/>

                      {/* Bouton envoi définitif */}
                      <button
                        onClick={sendNewsletter}
                        disabled={['sending','testing','sent'].includes(sendStatus)}
                        style={{
                          padding: '10px 24px', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 13,
                          fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                          cursor: ['sending','testing','sent'].includes(sendStatus) ? 'default' : 'pointer',
                          background: sendStatus === 'sent' ? '#22c55e' : sendStatus === 'error' ? 'rgba(220,53,69,0.15)' : ['sending','testing'].includes(sendStatus) ? 'rgba(176,111,255,0.2)' : '#B06FFF',
                          color: sendStatus === 'sent' ? '#fff' : sendStatus === 'error' ? '#ff6b7a' : ['sending','testing'].includes(sendStatus) ? '#B06FFF' : '#fff',
                          outline: sendStatus === 'error' ? '1.5px solid rgba(220,53,69,0.3)' : 'none',
                        }}
                      >
                        {sendStatus === 'sending' ? '⏳ Envoi en cours...' : sendStatus === 'sent' ? '✓ Newsletter envoyée !' : sendStatus === 'error' ? '✕ Échec — réessayer' : '✉ Envoyer à tous les abonnés'}
                      </button>

                      {sendStatus === 'idle' && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Liste 3 · Brevo</span>
                      )}
                      {sendStatus === 'error' && sendError && (
                        <span style={{ fontSize: 12, color: '#ff6b7a' }}>{sendError}</span>
                      )}
                      {sendStatus === 'sent' && (
                        <button onClick={() => { setSendStatus('idle'); setSendError('') }} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          Réinitialiser
                        </button>
                      )}
                    </div>

                    {sendStatus === 'tested' && (
                      <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        Vérifie ta boite Gmail · Objet préfixé [TEST] · Clique "Envoyer à tous" quand c'est bon
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── ORCHESTRATEUR JORDAN (chat continu + délégation) ────────── */
const DELEG_RE = /\[\[GO:\s*(\w+)\s*\|\s*([^\]]+?)\s*\]\]/g
function parseDelegations(text) {
  const dels = []
  let clean = text.replace(DELEG_RE, (_, id, demande) => { dels.push({ id: id.trim(), demande: demande.trim() }); return '' })
  return { clean: clean.trim(), dels }
}

function SupervisorPanel({ context, onOpenAgent, onRouted, agents }) {
  const [messages, setMessages] = useState(() => loadChat('jordan'))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const threadRef = useRef(null)

  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight }, [messages, loading])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setError(''); setInput('')
    const userMsg = { id: Date.now(), role: 'user', content: q }
    const base = [...messages, userMsg]
    setMessages(base); saveChat('jordan', base); setLoading(true)
    try {
      const text = await callClaudeChat(JORDAN_PROMPT(context) + '\n\n' + buildDateContext() + KNOWLEDGE_BLOCK + JORDAN_DOCTRINE + FINANCE_DOCTRINE, base)
      const full = [...base, { id: Date.now() + 1, role: 'assistant', content: text }]
      setMessages(full); saveChat('jordan', full)
    } catch (e) { setError(e.message); setMessages(base) }
    finally { setLoading(false) }
  }

  const resetChat = () => { setMessages([]); saveChat('jordan', []); setError('') }

  // Confier une tâche à un agent : pré-remplit son chat puis ouvre son espace
  const handoff = (id, demande) => {
    const agent = agents.find(a => a.id === id)
    if (!agent) return
    try { localStorage.setItem('di_pending_' + id, demande) } catch {}
    onRouted && onRouted(id)
    onOpenAgent(agent)
  }

  return (
    <div style={{ padding: '0 48px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(13,59,46,0.18) 100%)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 480 }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/avatars/bearded-headset.png" alt="Jordan" style={{ height: 40, objectFit: 'contain' }}/>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'white', fontFamily: 'Playfair Display, serif' }}>Jordan</div>
              <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700 }}>Orchestrateur — il répond ou délègue à l'équipe</div>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={resetChat} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '7px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Nouvelle conversation
            </button>
          )}
        </div>

        {/* Fil */}
        <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '58vh' }}>
          {messages.length === 0 && !loading && (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '30px 20px', maxWidth: 460 }}>
              <img src="/avatars/bearded-headset.png" alt="" style={{ height: 90, objectFit: 'contain', marginBottom: 14 }}/>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Parle à Jordan</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
                Demande-lui un conseil, un plan, une priorité — il te répond. Et quand il faut produire un contenu, il le confie au bon agent en un clic. Il garde le fil de toute la conversation.
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.role === 'user') return (
              <div key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '82%', background: '#C9A84C', color: '#0b0f14', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>{m.content}</div>
            )
            const { clean, dels } = parseDelegations(m.content)
            return (
              <div key={m.id} style={{ alignSelf: 'flex-start', width: '100%', maxWidth: '94%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <img src="/avatars/bearded-headset.png" alt="" style={{ height: 26, objectFit: 'contain' }}/>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C' }}>Jordan</span>
                  <button onClick={() => { navigator.clipboard.writeText(clean); setCopiedId(m.id); setTimeout(() => setCopiedId(null), 2000) }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: copiedId === m.id ? '#C9A84C' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {copiedId === m.id ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <pre style={{ margin: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontFamily: 'DM Sans, sans-serif' }}>{clean}</pre>
                {dels.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                    {dels.map((d, i) => {
                      const ag = agents.find(a => a.id === d.id)
                      if (!ag) return null
                      return (
                        <button key={i} onClick={() => handoff(d.id, d.demande)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${ag.color}14`, border: `1px solid ${ag.color}44`, borderRadius: 14, padding: '10px 16px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', maxWidth: 380 }}>
                          <img src={ag.avatar} alt="" style={{ height: 32, objectFit: 'contain', flexShrink: 0 }}/>
                          <span style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: ag.color }}>Confier à {ag.nom} →</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.demande}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              <img src="/avatars/bearded-headset.png" alt="" style={{ height: 26, objectFit: 'contain', animation: 'breathe 1.5s ease-in-out infinite' }}/>
              Jordan réfléchit...
            </div>
          )}
        </div>

        {error && <div style={{ margin: '0 24px 12px', padding: '12px 16px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: 12, color: '#ff6b7a', fontSize: 13 }}>{error}</div>}

        {/* Saisie */}
        <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={messages.length ? 'Relance Jordan...' : 'Ex : par quoi je commence cette semaine ? · prépare une campagne sur les dividendes · rédige la newsletter de lundi'} rows={2}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(201,168,76,0.18)', color: 'white', fontSize: 14, resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6 }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{ padding: '13px 26px', borderRadius: 14, border: 'none', background: (loading || !input.trim()) ? 'rgba(201,168,76,0.2)' : '#C9A84C', color: (loading || !input.trim()) ? 'rgba(255,255,255,0.3)' : '#0D3B2E', fontWeight: 800, fontSize: 14, cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              Envoyer
            </button>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, display: 'block' }}>Entrée pour envoyer · Maj+Entrée pour un saut de ligne</span>
        </div>
      </div>
    </div>
  )
}

/* ── PAGE PRINCIPALE ─────────────────────────────────────────── */
export default function Cockpit() {
  const [activeAgent, setActiveAgent] = useState(null)
  const [entered, setEntered] = useState(false)
  const [projetContext, setProjetContext] = useState(() => localStorage.getItem(CONTEXT_KEY) || DEFAULT_CONTEXT)
  const [editingContext, setEditingContext] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)
  const [showNotionSettings, setShowNotionSettings] = useState(false)
  const [notionKey, setNotionKey] = useState(() => localStorage.getItem(NOTION_KEY_STORE) || '')
  const [notionDb, setNotionDb] = useState(() => localStorage.getItem(NOTION_DB_STORE) || '')
  const [showSecretSettings, setShowSecretSettings] = useState(false)
  const [cockpitSecret, setCockpitSecret] = useState(() => localStorage.getItem('di_cockpit_secret') || '')
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

          {/* Bouton Secret Cockpit */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSecretSettings(!showSecretSettings)}
              title="Clé d'accès Cockpit"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: cockpitSecret ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${cockpitSecret ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 12 }}>🔑</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cockpitSecret ? '#C9A84C' : 'rgba(255,255,255,0.25)' }}>
                {cockpitSecret ? 'Clé active' : 'Clé'}
              </span>
              {cockpitSecret && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 6px #4CAF50' }}/>}
            </button>

            {showSecretSettings && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#0F1419', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px', width: 300, zIndex: 200, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'bubble-pop 0.2s ease both' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Clé d'accès Cockpit</div>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 5, fontWeight: 600 }}>COCKPIT_SECRET (Vercel)</label>
                <input type="password" value={cockpitSecret}
                  onChange={e => { setCockpitSecret(e.target.value); localStorage.setItem('di_cockpit_secret', e.target.value) }}
                  placeholder="di-cockpit-2026"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', marginBottom: 12 }}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6, marginBottom: 12 }}>
                  Doit correspondre à la variable <code style={{ color: 'rgba(201,168,76,0.7)' }}>COCKPIT_SECRET</code> dans Vercel → Settings → Environment Variables.
                </div>
                <button onClick={() => setShowSecretSettings(false)}
                  style={{ width: '100%', padding: '9px', borderRadius: 10, border: 'none', background: cockpitSecret ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.08)', color: cockpitSecret ? '#C9A84C' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {cockpitSecret ? 'Clé enregistrée' : 'Fermer'}
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
