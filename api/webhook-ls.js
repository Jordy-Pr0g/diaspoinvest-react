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

const PRODUCT_ID_GUIDE   = 'XXXXXXXX'  // 14,99€ Guide PDF
const PRODUCT_ID_TRACKER = 'XXXXXXXX'  // 24,99€ Tracker Dashboard
const PRODUCT_ID_PACK    = 'XXXXXXXX'  // 29,99€ Pack Guide + Tracker

const BREVO_LIST_ACHETEURS = 4         // Liste "Acheteurs" dans Brevo (à créer)

// Template Brevo livraison immédiate — à créer dans Brevo avec brevo-template-livraison.html
const BREVO_TEMPLATE_LIVRAISON = 23

const PRODUCT_TAGS = {
  [PRODUCT_ID_GUIDE]:   { tag: 'ACHETEUR_GUIDE',   nom: 'Guide PDF DiaspoInvest' },
  [PRODUCT_ID_TRACKER]: { tag: 'ACHETEUR_TRACKER',  nom: 'Tracker Dashboard DiaspoInvest' },
  [PRODUCT_ID_PACK]:    { tag: 'ACHETEUR_PACK',     nom: 'Pack Guide + Tracker DiaspoInvest' },
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
  const tagInfo = PRODUCT_TAGS[productId] || { nom: 'votre produit' }
  const apiKey  = process.env.BREVO_API_KEY

  const body = JSON.stringify({
    to: [{ email, name: prenom }],
    templateId: BREVO_TEMPLATE_LIVRAISON,
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
