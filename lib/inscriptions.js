// Compteur des inscriptions newsletter (ajouté le 25/11/2026, pilotage recentré sur l'audience).
// Appelé par api/newsletter.js et api/subscribe-segment.js APRÈS une inscription Brevo réussie.
// Rien de personnel n'est stocké : ni email, ni IP. Seulement des compteurs.
//   ins:<jour>, ins:total               toutes les inscriptions validées
//   insn:<jour>, insn:total             dont nouveaux contacts (Brevo 201)
//   ins:src:<réseau>:total              réseau qui a amené le visiteur (session)
//   ins:form:<formulaire>:total         formulaire utilisé
//   ins:pages (classement)              page où l'inscription a eu lieu
// Placé hors de api/ : ce fichier n'est pas une fonction Vercel (limite de 12 sur le plan Hobby).

const SOURCES = ['direct', 'google', 'bing', 'tiktok', 'instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'whatsapp', 'autre']
const FORMULAIRES = ['guide', 'article', 'quiz', 'calculateur', 'autre']

export async function compterInscription(req, { nouveau = false, formulaire = 'autre', origine } = {}) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return
  const jour = new Date().toISOString().slice(0, 10)
  const src = SOURCES.includes(String(origine)) ? String(origine) : 'direct'
  const form = FORMULAIRES.includes(String(formulaire)) ? String(formulaire) : 'autre'
  let page = ''
  try {
    page = new URL(req.headers.referer || '').pathname.toLowerCase().slice(0, 120).replace(/[^a-z0-9/_.-]/g, '') || '/'
  } catch { page = '' }
  const cmds = [
    ['INCR', `ins:${jour}`], ['INCR', 'ins:total'],
    ['INCR', `ins:src:${src}:total`],
    ['INCR', `ins:form:${form}:total`],
    ...(nouveau ? [['INCR', `insn:${jour}`], ['INCR', 'insn:total']] : []),
    ...(page ? [['ZINCRBY', 'ins:pages', '1', page]] : []),
  ]
  try {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
    })
  } catch { /* silencieux : ne jamais faire échouer une inscription pour une statistique */ }
}
