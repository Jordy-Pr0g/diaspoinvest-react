/**
 * DiaspoInvest — Webhook Lemon Squeezy → Brevo
 * =============================================
 * Reçoit les paiements Lemon Squeezy, tague l'acheteur dans Brevo,
 * et déclenche l'email de livraison immédiate.
 *
 * Variables d'environnement Vercel requises :
 *   BREVO_API_KEY               — clé API Brevo
 *   LEMONSQUEEZY_WEBHOOK_SECRET — secret webhook (généré dans LS > Settings > Webhooks)
 *
 * Lemon Squeezy : Settings > Webhooks > Add
 *   URL    : https://diaspoinvest.fr/api/webhook-ls
 *   Events : order_created
 *   Secret : (même valeur que LEMONSQUEEZY_WEBHOOK_SECRET)
 *
 * REMPLIR après création des produits Lemon Squeezy :
 */

const PRODUCT_ID_GUIDE_EUROPE = '1146479'   // 14,99€ Guide Diaspora Europe
const PRODUCT_ID_GUIDE_UEMOA  = '1146891'   // 14,99€ Guide UEMOA
const PRODUCT_ID_TRACKER      = '1146919'   // 24,99€ Tracker Dashboard
const PRODUCT_ID_PACK_EUROPE  = '1147207'   // 29,99€ Pack Europe (Guide Europe + Tracker)
const PRODUCT_ID_PACK_UEMOA   = '1147176'   // 29,99€ Pack UEMOA (Guide UEMOA + Tracker)

const BREVO_LIST_ACHETEURS = 6         // Liste "Acheteurs DiaspoInvest" — créée le 15/06/2026

// Templates Brevo livraison par produit (créés dans Brevo)
// #25 Guide Europe · #26 Guide UEMOA · #27 Tracker · #28 Pack Europe · #29 Pack UEMOA

const PRODUCT_TAGS = {
  [PRODUCT_ID_GUIDE_EUROPE]: { tag: 'ACHETEUR_GUIDE',   nom: 'Guide Diaspora Europe', template: 25 },
  [PRODUCT_ID_GUIDE_UEMOA]:  { tag: 'ACHETEUR_GUIDE',   nom: 'Guide UEMOA',           template: 26 },
  [PRODUCT_ID_TRACKER]:      { tag: 'ACHETEUR_TRACKER',  nom: 'Tracker Dashboard',     template: 27 },
  [PRODUCT_ID_PACK_EUROPE]:  { tag: 'ACHETEUR_PACK',     nom: 'Pack Europe',           template: 28 },
  [PRODUCT_ID_PACK_UEMOA]:   { tag: 'ACHETEUR_PACK',     nom: 'Pack UEMOA',            template: 29 },
}

// ─── Vérification signature HMAC-SHA256 ───────────────────────────────────────
async function verifySignature(body, signature, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === signature
}

// ─── Ajout / mise à jour contact Brevo ───────────────────────────────────────
async function upsertContactBrevo(email, prenom, nom, productId) {
  const tagInfo = PRODUCT_TAGS[productId] || { tag: 'ACHETEUR_INCONNU', nom: 'Inconnu' }
  const apiKey  = process.env.BREVO_API_KEY

  const body = JSON.stringify({
    email,
    attributes: {
      PRENOM: prenom,
      NOM: nom,
      [tagInfo.tag]: true,
      ACHETEUR: true,
    },
    listIds: [BREVO_LIST_ACHETEURS],
    updateEnabled: true,
  })

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body,
  })

  console.log(`[Brevo] upsert ${email} → ${res.status}`)
  return { status: res.status, tag: tagInfo.tag }
}

// ─── Email de livraison immédiate ─────────────────────────────────────────────
async function sendDeliveryEmail(email, prenom, productId, downloadUrl) {
  const tagInfo    = PRODUCT_TAGS[productId] || { nom: 'votre produit', template: 25 }
  const templateId = tagInfo.template
  const apiKey     = process.env.BREVO_API_KEY

  const body = JSON.stringify({
    to: [{ email, name: prenom }],
    templateId,
    params: {
      PRENOM: prenom,
      PRODUIT: tagInfo.nom,
      DOWNLOAD_URL: downloadUrl,
    },
    sender: { name: 'Jordan | DiaspoInvest', email: 'contact@diaspoinvest.fr' },
  })

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body,
  })

  console.log(`[Brevo] livraison ${email} → ${res.status}`)
}

// ─── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Lire le body brut pour vérification signature
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks).toString('utf-8')

  // Vérification signature
  const secret    = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  const signature = req.headers['x-signature'] || ''

  if (secret && signature) {
    const valid = await verifySignature(rawBody, signature, secret)
    if (!valid) {
      console.error('[Webhook] Signature invalide')
      return res.status(401).json({ error: 'Invalid signature' })
    }
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const eventName = payload?.meta?.event_name
  if (eventName !== 'order_created') {
    return res.status(200).json({ ignored: eventName })
  }

  // Extraire les infos client
  const attrs      = payload?.data?.attributes || {}
  const email      = attrs.user_email || ''
  const fullName   = attrs.user_name || ''
  const prenom     = fullName.split(' ')[0] || 'Client'
  const nom        = fullName.split(' ').slice(1).join(' ') || ''
  const productId  = String(attrs.first_order_item?.product_id || '')
  const downloadUrl = attrs.urls?.receipt || 'https://diaspoinvest.fr'

  if (!email) {
    return res.status(400).json({ error: 'email manquant' })
  }

  // 1. Tagger dans Brevo
  const brevoResult = await upsertContactBrevo(email, prenom, nom, productId)

  // 2. Email de livraison immédiate
  await sendDeliveryEmail(email, prenom, productId, downloadUrl)

  return res.status(200).json({
    ok: true,
    email,
    tag: brevoResult.tag,
  })
}
