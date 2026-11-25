// Vercel serverless function — agrège les indicateurs du projet pour le Tableau de bord.
// Protégé par COCKPIT_SECRET (même clé que le Cockpit). Source : Brevo (abonnés par liste).
// Les données BRVM et la boucle de conversion sont lues côté front (api/brvm-data + Plausible).

import crypto from 'node:crypto'

const LISTES = {
  3: 'Newsletter',
  7: 'Intéressés',
  6: 'Acheteurs',
}

// Slugs produit autorisés (synchronisés avec OFFER_CODE_TAGS de hotmart-webhook.js).
const PRODUITS_STATS = ['guideEurope', 'guideUemoa', 'tracker', 'packEurope', 'packUemoa', 'autre']

// Sources de trafic autorisées (une seule liste pour tout le fichier).
const SOURCES_STATS = ['direct', 'google', 'bing', 'tiktok', 'instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'whatsapp', 'autre']

// Événements qui portent une attribution par source (visite → achat).
const EVTS_ATTR = ['quiz_termine', 'clic_produit', 'achat']

function kvStore() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

// Exécute une liste de commandes Redis en un appel (PFCOUNT, ZREVRANGE, etc.)
async function kvPipeline(store, cmds) {
  if (!cmds.length) return []
  try {
    const r = await fetch(`${store.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${store.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
    })
    if (!r.ok) return []
    const d = await r.json()
    return Array.isArray(d) ? d.map(x => x.result) : []
  } catch { return [] }
}

async function kvMget(store, keys) {
  if (!keys.length) return []
  try {
    const r = await fetch(`${store.url}/mget/${keys.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${store.token}` },
    })
    if (!r.ok) return keys.map(() => null)
    const d = await r.json()
    return (d.result || []).map(v => (v == null ? 0 : Number(v)))
  } catch {
    return keys.map(() => 0)
  }
}

// Construit la mesure d'audience maison : 30 derniers jours + totaux + ratio
async function buildAnalytics() {
  const store = kvStore()
  if (!store) return { disponible: false }

  const jours = []
  const dates = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dates.push(d)
  }
  const [pvJour, achJour, revJour] = await Promise.all([
    kvMget(store, dates.map(d => `pv:${d}`)),
    kvMget(store, dates.map(d => `ev:achat:${d}`)),
    kvMget(store, dates.map(d => `rev:${d}`)),
  ])
  dates.forEach((d, i) => jours.push({ date: d, pv: pvJour[i] || 0, achat: achJour[i] || 0, revenu: (revJour[i] || 0) / 100 }))

  const [pvTotal, quiz, achat, clic, revTotal, rembN, rembMt] = await kvMget(store, [
    'pv:total', 'ev:quiz_termine:total', 'ev:achat:total', 'ev:clic_produit:total', 'rev:total',
    'remb:total', 'rembmt:total',
  ])
  const ratio = quiz > 0 ? (achat / quiz) * 100 : null

  // Ventes et CA par produit (alimentés par le webhook Hotmart)
  const [vpVals, rpVals] = await Promise.all([
    kvMget(store, PRODUITS_STATS.map(p => `vp:${p}:total`)),
    kvMget(store, PRODUITS_STATS.map(p => `rp:${p}:total`)),
  ])
  const produits = PRODUITS_STATS
    .map((p, i) => ({ produit: p, ventes: vpVals[i] || 0, revenu: (rpVals[i] || 0) / 100 }))
    .filter(x => x.ventes > 0 || x.revenu > 0)

  // Sources de trafic (whitelist)
  const SRC = SOURCES_STATS
  const srcVals = await kvMget(store, SRC.map(s => `src:${s}:total`))
  const sources = SRC.map((s, i) => ({ source: s, visites: srcVals[i] || 0 }))
    .filter(x => x.visites > 0)
    .sort((a, b) => b.visites - a.visites)

  // Attribution par réseau : pour chaque source, les événements clés
  // (quiz terminé, clic produit, achat) réalisés par les visiteurs venus d'elle.
  const attrVals = await Promise.all(EVTS_ATTR.map(ev => kvMget(store, SRC.map(s => `evs:${ev}:${s}:total`))))
  const attribution = SRC.map((s, i) => ({
    source: s,
    visites: srcVals[i] || 0,
    quiz: attrVals[0][i] || 0,
    clics: attrVals[1][i] || 0,
    achats: attrVals[2][i] || 0,
  })).filter(x => x.visites > 0 || x.quiz > 0 || x.clics > 0 || x.achats > 0)
    .sort((a, b) => b.visites - a.visites)

  // Inscriptions newsletter (compteurs posés par lib/inscriptions.js depuis le 25/11/2026)
  const FORMS = ['guide', 'article', 'quiz', 'calculateur', 'autre']
  const [insJour, insnJour, insTot, insSrc, insForm] = await Promise.all([
    kvMget(store, dates.map(d => `ins:${d}`)),
    kvMget(store, dates.map(d => `insn:${d}`)),
    kvMget(store, ['ins:total', 'insn:total']),
    kvMget(store, SRC.map(s => `ins:src:${s}:total`)),
    kvMget(store, FORMS.map(f => `ins:form:${f}:total`)),
  ])
  dates.forEach((d, i) => { jours[i].ins = insJour[i] || 0; jours[i].insn = insnJour[i] || 0 })
  attribution.forEach(a => { a.inscriptions = insSrc[SRC.indexOf(a.source)] || 0 })
  SRC.forEach((s, i) => {
    if ((insSrc[i] || 0) > 0 && !attribution.find(a => a.source === s)) attribution.push({ source: s, visites: 0, quiz: 0, clics: 0, achats: 0, inscriptions: insSrc[i] })
  })
  const inscriptions = {
    total: insTot[0] || 0,
    nouveaux: insTot[1] || 0,
    formulaires: FORMS.map((f, i) => ({ formulaire: f, n: insForm[i] || 0 })).filter(x => x.n > 0),
  }

  // Visiteurs uniques (HyperLogLog) + pages les plus vues (sorted set)
  const piped = await kvPipeline(store, [
    ['PFCOUNT', 'uv:total'],
    ...dates.map(d => ['PFCOUNT', `uv:${d}`]),
    ['ZREVRANGE', 'pages', '0', '9', 'WITHSCORES'],
    ['ZREVRANGE', 'ins:pages', '0', '9', 'WITHSCORES'],
  ])
  const uvTotal = Number(piped[0] || 0)
  dates.forEach((d, i) => { jours[i].uniques = Number(piped[1 + i] || 0) })
  const uniques7 = dates.slice(-7).reduce((s, d, i) => s + Number(piped[1 + (dates.length - 7) + i] || 0), 0)
  const pagesRaw = piped[1 + dates.length] || []
  const pages = []
  for (let i = 0; i < pagesRaw.length; i += 2) pages.push({ path: pagesRaw[i], vues: Number(pagesRaw[i + 1]) })
  const insPagesRaw = piped[2 + dates.length] || []
  inscriptions.pages = []
  for (let i = 0; i < insPagesRaw.length; i += 2) inscriptions.pages.push({ path: insPagesRaw[i], n: Number(insPagesRaw[i + 1]) })

  return {
    disponible: true,
    jours,
    totaux: { pv: pvTotal, uniques: uvTotal, quiz_termine: quiz, achat, clic_produit: clic, revenu: revTotal / 100 },
    uniques7,
    ratio,
    sources,
    pages,
    produits,
    attribution,
    inscriptions,
    remboursements: { nombre: rembN || 0, montant: (rembMt || 0) / 100 },
  }
}

// Audience email côté Brevo : croissance de la liste Newsletter et engagement des campagnes.
// Aucune adresse email n'est renvoyée au navigateur : seulement des dates et des compteurs.
async function audienceBrevo(headers) {
  const out = { croissance: null, campagnes: [] }
  try {
    let contacts = []
    for (let offset = 0; offset < 2000; offset += 500) {
      const r = await fetch(`https://api.brevo.com/v3/contacts/lists/3/contacts?limit=500&offset=${offset}&sort=asc`, { headers })
      if (!r.ok) break
      const d = await r.json()
      const c = d.contacts || []
      contacts = contacts.concat(c.map(x => ({ cree: String(x.createdAt || '').slice(0, 10), bloque: !!x.emailBlacklisted })))
      if (c.length < 500) break
    }
    if (contacts.length) {
      const jour = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
      const mois = new Date().toISOString().slice(0, 7)
      const dPrec = new Date(); dPrec.setUTCDate(1); dPrec.setUTCMonth(dPrec.getUTCMonth() - 1)
      const moisPrec = dPrec.toISOString().slice(0, 7)
      const courbe = []
      for (let i = 89; i >= 0; i--) {
        const d = jour(i)
        courbe.push({ date: d, total: contacts.filter(c => c.cree && c.cree <= d).length })
      }
      out.croissance = {
        total: contacts.length,
        actifs: contacts.filter(c => !c.bloque).length,
        desinscrits: contacts.filter(c => c.bloque).length,
        nouveaux7: contacts.filter(c => c.cree > jour(7)).length,
        nouveaux30: contacts.filter(c => c.cree > jour(30)).length,
        nouveauxMois: contacts.filter(c => c.cree.startsWith(mois)).length,
        nouveauxMoisPrec: contacts.filter(c => c.cree.startsWith(moisPrec)).length,
        premier: contacts.map(c => c.cree).filter(Boolean).sort()[0] || null,
        courbe,
      }
    }
  } catch { /* best-effort */ }
  try {
    const r = await fetch('https://api.brevo.com/v3/emailCampaigns?status=sent&limit=15&sort=desc&statistics=globalStats&excludeHtmlContent=true', { headers })
    if (r.ok) {
      const d = await r.json()
      out.campagnes = (d.campaigns || [])
        .filter(c => (c.recipients?.lists || []).includes(3))
        .slice(0, 10)
        .map(c => {
          const g = c.statistics?.globalStats || {}
          return {
            id: c.id,
            objet: c.subject || c.name,
            date: c.sentDate || c.scheduledAt || null,
            delivres: g.delivered || 0,
            ouvertures: g.uniqueViews || 0,
            ouverturesApple: g.appleMppOpens || 0,
            clics: g.uniqueClicks || 0,
            desinscriptions: g.unsubscriptions || 0,
            rebonds: (g.hardBounces || 0) + (g.softBounces || 0),
          }
        })
    }
  } catch { /* best-effort */ }
  return out
}

// POST = enregistre une vue de page (corps vide) ou un event (corps {e:"..."}).
// Public (pas de secret) car appelé par le tracker du site. Dégrade si KV absent.
async function track(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const store = kvStore()
  if (!store) return res.status(200).json({ ok: false, reason: 'kv-non-configure' })

  let body = req.body || {}
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }

  // Remboursement/chargeback (protégé par la clé, appelé serveur-à-serveur par
  // hotmart-webhook.js) : retire la vente du dashboard au lieu de la laisser
  // gonfler artificiellement le chiffre d'affaires affiché.
  // Lecture puis écriture (au lieu d'un simple incrby négatif) pour ne JAMAIS
  // laisser un compteur passer sous zéro (ex : un test Hotmart envoie un faux
  // remboursement sans vente réelle correspondante derrière).
  if (body && body.e === 'remboursement') {
    const secret = process.env.COCKPIT_SECRET
    if (secret && (req.headers['x-cockpit-secret'] || '') !== secret) return res.status(403).json({ ok: false })
    const montant = Math.max(0, Math.round(Number(body.montant) || 0))
    const day = new Date().toISOString().slice(0, 10)
    const decrementFloor0 = async (key, amount) => {
      try {
        const r = await fetch(`${store.url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${store.token}` } })
        const d = await r.json().catch(() => ({}))
        const actuel = Number(d.result) || 0
        const nouveau = Math.max(0, actuel - amount)
        await fetch(`${store.url}/set/${encodeURIComponent(key)}/${nouveau}`, { headers: { Authorization: `Bearer ${store.token}` } })
      } catch { /* silencieux */ }
    }
    try {
      await Promise.all([
        decrementFloor0('ev:achat:total', 1),
        ...(montant > 0 ? [decrementFloor0('rev:total', montant), decrementFloor0('rev:' + day, montant)] : []),
        // Compteurs cumulatifs dédiés : les remboursements restent visibles
        // à part dans le dashboard, pas seulement soustraits du CA.
        fetch(`${store.url}/incr/${encodeURIComponent('remb:total')}`, { headers: { Authorization: `Bearer ${store.token}` } }),
        ...(montant > 0 ? [fetch(`${store.url}/incrby/${encodeURIComponent('rembmt:total')}/${montant}`, { headers: { Authorization: `Bearer ${store.token}` } })] : []),
      ])
    } catch { /* silencieux */ }
    return res.status(200).json({ ok: true, remboursement: true })
  }

  // Correction ciblée du CA (protégé par la clé) : remet uniquement le
  // chiffre d'affaires à zéro, SANS toucher aux visites/sources/pages.
  // Utile après un compteur faussé par de faux remboursements de test.
  if (body && body.fixRevenuAZero === true) {
    const secret = process.env.COCKPIT_SECRET
    if (secret && (req.headers['x-cockpit-secret'] || '') !== secret) return res.status(403).json({ ok: false })
    // Remet à zéro tout ce qui touche aux VENTES (CA, compteurs produit,
    // remboursements, attribution des achats, y compris les clés JOURNALIÈRES
    // qui alimentent le « CA du mois ») sans toucher aux visites/sources/pages.
    const keys = ['rev:total', 'ev:achat:total', 'remb:total', 'rembmt:total']
    PRODUITS_STATS.forEach(p => keys.push(`vp:${p}:total`, `rp:${p}:total`))
    SOURCES_STATS.forEach(s => keys.push(`evs:achat:${s}:total`))
    for (let i = 0; i < 60; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      keys.push(`rev:${d}`, `ev:achat:${d}`)
    }
    try {
      await fetch(`${store.url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${store.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(keys.map(k => ['DEL', k])),
      })
    } catch { /* silencieux */ }
    return res.status(200).json({ ok: true, fixRevenuAZero: true })
  }

  // Reset admin (protégé par la clé) : remet à zéro totaux + 60 derniers jours.
  if (body && body.reset === true) {
    const secret = process.env.COCKPIT_SECRET
    if (secret && (req.headers['x-cockpit-secret'] || '') !== secret) return res.status(403).json({ ok: false })
    const SRC = SOURCES_STATS
    const keys = ['pv:total', 'ev:quiz_termine:total', 'ev:achat:total', 'ev:clic_produit:total', 'rev:total', 'uv:total', 'pages', 'remb:total', 'rembmt:total']
    SRC.forEach(s => keys.push(`src:${s}:total`))
    PRODUITS_STATS.forEach(p => keys.push(`vp:${p}:total`, `rp:${p}:total`))
    EVTS_ATTR.forEach(ev => SRC.forEach(s => keys.push(`evs:${ev}:${s}:total`)))
    keys.push('ins:total', 'insn:total', 'ins:pages')
    SRC.forEach(s => keys.push(`ins:src:${s}:total`))
    ;['guide', 'article', 'quiz', 'calculateur', 'autre'].forEach(f => keys.push(`ins:form:${f}:total`))
    for (let i = 0; i < 60; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      keys.push(`ins:${d}`, `insn:${d}`)
      keys.push(`pv:${d}`, `ev:quiz_termine:${d}`, `ev:achat:${d}`, `ev:clic_produit:${d}`, `rev:${d}`, `uv:${d}`)
      SRC.forEach(s => keys.push(`src:${s}:${d}`))
    }
    try {
      await fetch(`${store.url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${store.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(keys.map(k => ['DEL', k])),
      })
    } catch { /* silencieux */ }
    return res.status(200).json({ ok: true, reset: true })
  }

  const day = new Date().toISOString().slice(0, 10)

  // Source de trafic (whitelist pour éviter toute clé parasite)
  if (body && body.src) {
    const src = SOURCES_STATS.includes(String(body.src)) ? String(body.src) : null
    if (src) {
      try {
        await Promise.all([`src:${src}:total`, `src:${src}:${day}`].map(k =>
          fetch(`${store.url}/incr/${encodeURIComponent(k)}`, { headers: { Authorization: `Bearer ${store.token}` } })
        ))
      } catch { /* silencieux */ }
    }
    return res.status(200).json({ ok: true })
  }

  // Filtrage des robots (ne pollue pas les chiffres réels)
  const ua = req.headers['user-agent'] || ''
  if (/bot|crawl|spider|slurp|bingbot|preview|monitor|headless|lighthouse|pingdom|uptime|facebookexternalhit|embed/i.test(ua)) {
    return res.status(200).json({ ok: true, bot: true })
  }

  const e = (body.e || '').toString().slice(0, 40).replace(/[^a-z0-9_]/gi, '')
  const keys = e ? [`ev:${e}:${day}`, `ev:${e}:total`] : [`pv:${day}`, `pv:total`]
  const montant = Math.max(0, Math.round(Number(body.montant) || 0))

  // Ventilation par produit (uniquement pour les achats, slug whitelisté)
  const produit = e === 'achat' && PRODUITS_STATS.includes(String(body.produit)) ? String(body.produit) : null

  // Attribution par réseau : quiz/clic/achat portent la source de session
  const origine = EVTS_ATTR.includes(e) && SOURCES_STATS.includes(String(body.origine)) ? String(body.origine) : null

  // Identifiant visiteur anonyme (haché, jamais stocké en clair) : IP + UA
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const vid = crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 20)

  // Chemin de la page (seulement pour une vue de page)
  let pagePath = ''
  if (!e && body.p) {
    pagePath = String(body.p).toLowerCase().slice(0, 120).replace(/[^a-z0-9/_-]/g, '') || '/'
  }

  try {
    await Promise.all([
      ...keys.map(k =>
        fetch(`${store.url}/incr/${encodeURIComponent(k)}`, { headers: { Authorization: `Bearer ${store.token}` } })
      ),
      ...(montant > 0 ? [`rev:${day}`, 'rev:total'].map(k =>
        fetch(`${store.url}/incrby/${encodeURIComponent(k)}/${montant}`, { headers: { Authorization: `Bearer ${store.token}` } })
      ) : []),
      // Compteurs par produit : nombre de ventes + CA (centimes)
      ...(produit ? [
        fetch(`${store.url}/incr/${encodeURIComponent(`vp:${produit}:total`)}`, { headers: { Authorization: `Bearer ${store.token}` } }),
        ...(montant > 0 ? [fetch(`${store.url}/incrby/${encodeURIComponent(`rp:${produit}:total`)}/${montant}`, { headers: { Authorization: `Bearer ${store.token}` } })] : []),
      ] : []),
      // Attribution : l'événement est crédité au réseau d'origine du visiteur
      ...(origine ? [fetch(`${store.url}/incr/${encodeURIComponent(`evs:${e}:${origine}:total`)}`, { headers: { Authorization: `Bearer ${store.token}` } })] : []),
      // Visiteur unique (HyperLogLog : total + du jour)
      fetch(`${store.url}/pfadd/uv:total/${vid}`, { headers: { Authorization: `Bearer ${store.token}` } }),
      fetch(`${store.url}/pfadd/${encodeURIComponent('uv:' + day)}/${vid}`, { headers: { Authorization: `Bearer ${store.token}` } }),
      // Page vue (classement)
      ...(pagePath ? [fetch(`${store.url}/zincrby/pages/1/${encodeURIComponent(pagePath)}`, { headers: { Authorization: `Bearer ${store.token}` } })] : []),
    ])
  } catch { /* silencieux : ne jamais casser la navigation */ }
  return res.status(200).json({ ok: true })
}

// Résumé hebdomadaire envoyé par email (déclenché par le cron Vercel le lundi).
async function sendDigest(res) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim()
  if (!apiKey) return res.status(500).json({ error: 'BREVO_API_KEY manquante' })
  const a = await buildAnalytics()
  if (!a.disponible) return res.status(200).json({ ok: true, skipped: 'kv-non-configure' })

  const j = a.jours || []
  const s7 = (key) => j.slice(-7).reduce((s, d) => s + (d[key] || 0), 0)
  const vues7 = s7('pv'), uniques7 = a.uniques7 || 0, ins7 = s7('ins')
  const topSource = (a.sources || [])[0]
  const topPage = (a.pages || [])[0]
  // Pilotage recentré sur l'audience (ventes en pause) : abonnés + dernière newsletter
  const headers = { 'api-key': apiKey, accept: 'application/json' }
  const aud = await audienceBrevo(headers).catch(() => ({}))
  const cr = aud.croissance || {}
  const derniere = (aud.campagnes || [])[0]
  const ligne = (k, v, fin) => `<tr><td style="padding:8px 0;${fin ? '' : 'border-bottom:1px solid #eee'}">${k}</td><td style="text-align:right;font-weight:700">${v}</td></tr>`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a2740">
      <h2 style="color:#0D1525">Ta semaine DiaspoInvest</h2>
      <p style="color:#555">Résumé des 7 derniers jours (${new Date().toLocaleDateString('fr-FR')}).</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        ${ligne('Abonnés newsletter', cr.actifs ?? '?')}
        ${ligne('Nouveaux abonnés (7 jours)', cr.nouveaux7 ?? '?')}
        ${ligne('Inscriptions via le site (7 jours)', ins7)}
        ${ligne('Visiteurs uniques', uniques7)}
        ${ligne('Vues de page', vues7)}
        ${ligne('Dernière newsletter : ouvertures', derniere ? `${derniere.ouvertures} sur ${derniere.delivres}` : '?')}
        ${ligne('Source n°1', topSource ? topSource.source : '?')}
        ${ligne('Page la plus vue', topPage ? topPage.path : '?', true)}
      </table>
      <p style="margin-top:24px"><a href="https://diaspoinvest.fr/dashboard.html" style="background:#C9A84C;color:#0D1525;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Ouvrir le tableau de bord</a></p>
    </div>`

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'DiaspoInvest Pilotage', email: 'contact@diaspoinvest.fr' },
        to: [{ email: 'djiokapjordan@gmail.com' }],
        subject: `Ta semaine DiaspoInvest : ${cr.actifs ?? '?'} abonnés, ${cr.nouveaux7 ?? 0} nouveau(x)`,
        htmlContent: html,
      }),
    })
  } catch (e) {
    return res.status(502).json({ error: 'Envoi échoué : ' + e.message })
  }
  return res.status(200).json({ ok: true, sent: true })
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Origin', '*'); return res.status(200).end() }
  if (req.method === 'POST') return track(req, res) // mesure d'audience (public)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Résumé hebdo (cron Vercel quotidien -> on n'envoie que le lundi).
  if (req.query.cron === 'digest') {
    const cs = process.env.CRON_SECRET
    if (cs && (req.headers['authorization'] || '') !== `Bearer ${cs}`) return res.status(401).json({ error: 'unauthorized' })
    if (new Date().getUTCDay() !== 1 && req.query.force !== '1') return res.status(200).json({ ok: true, skipped: 'pas lundi' })
    return sendDigest(res)
  }

  const secret = process.env.COCKPIT_SECRET
  const authHeader = req.headers['x-cockpit-secret'] || ''
  if (secret && authHeader !== secret) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  const apiKey = (process.env.BREVO_API_KEY || '').trim()
  if (!apiKey) return res.status(500).json({ error: 'BREVO_API_KEY non configurée.' })

  const headers = { 'api-key': apiKey, accept: 'application/json' }

  try {
    // Toutes les listes en un appel. Brevo a déprécié totalSubscribers (renvoie 0 depuis
    // novembre 2026) : le nombre d'abonnés est dans uniqueSubscribers.
    const r = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0', { headers })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return res.status(502).json({ error: err.message || `Brevo erreur ${r.status}` })
    }
    const data = await r.json()
    const byId = {}
    for (const l of data.lists || []) byId[l.id] = l.uniqueSubscribers ?? l.totalSubscribers ?? 0

    const listes = Object.entries(LISTES).map(([id, nom]) => ({
      id: Number(id),
      nom,
      abonnes: byId[id] || 0,
    }))

    // Total contacts (tous, dédupliqués) — appel léger limit=1 pour le compteur
    let totalContacts = null
    try {
      const rc = await fetch('https://api.brevo.com/v3/contacts?limit=1&offset=0', { headers })
      if (rc.ok) { const dc = await rc.json(); totalContacts = dc.count ?? null }
    } catch { /* best-effort */ }

    const [analytics, audience] = await Promise.all([buildAnalytics(), audienceBrevo(headers)])

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    return res.status(200).json({
      genere_le: new Date().toISOString(),
      brevo: { listes, totalContacts, ...audience },
      analytics,
    })
  } catch (e) {
    return res.status(502).json({ error: 'Brevo injoignable : ' + e.message })
  }
}
