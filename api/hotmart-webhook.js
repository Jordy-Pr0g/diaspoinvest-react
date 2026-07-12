/**
 * DiaspoInvest — Webhook Hotmart → Brevo + Dashboard
 * ===================================================
 * Reçoit chaque vente Hotmart (achat approuvé), tague l'acheteur dans Brevo
 * et reporte la vente réelle (montant) au tableau de bord (api/stats).
 *
 * Configuration côté Hotmart (espace producteur > Outils > Webhook) :
 *   URL       : https://diaspoinvest.fr/api/hotmart-webhook
 *   Événement : Compra aprovada (PURCHASE_APPROVED)
 *   Version   : 2.0.0
 *   Le jeton "Hottok" affiché à la création du webhook doit être copié dans
 *   la variable d'environnement Vercel HOTMART_HOTTOK ci-dessous.
 *
 * Variables d'environnement Vercel requises :
 *   BREVO_API_KEY   — déjà utilisée ailleurs (Brevo)
 *   HOTMART_HOTTOK  — jeton unique du compte Hotmart, envoyé dans le header
 *                     X-HOTMART-HOTTOK de chaque requête (doc officielle Hotmart).
 *
 * NB mapping produit : les codes ci-dessous sont ceux visibles dans les URLs de
 * paiement Hotmart (pay.hotmart.com/<code>), pas le product.id interne exact
 * envoyé par le webhook. On les utilise en 1er essai ; si Hotmart renvoie autre
 * chose, on retombe sur le NOM du produit (data.product.name). Dans tous les
 * cas la vente est comptée, même si le produit précis n'est pas identifié.
 */

const BREVO_LIST_ACHETEURS = 6 // "Acheteurs DiaspoInvest"

const OFFER_CODE_TAGS = {
  F106625297S: { tag: 'ACHETEUR_GUIDE', nom: 'Guide PDF Europe' },
  S106627946N: { tag: 'ACHETEUR_GUIDE', nom: 'Guide PDF UEMOA' },
  I106628667V: { tag: 'ACHETEUR_TRACKER', nom: 'Tracker Dashboard' },
  B106692769D: { tag: 'ACHETEUR_PACK', nom: 'Pack Complet Europe' },
  O106693011E: { tag: 'ACHETEUR_PACK', nom: 'Pack Complet UEMOA' },
}

function tagInfoFromPayload(data) {
  const offerCode = data?.purchase?.offer?.code
  if (offerCode && OFFER_CODE_TAGS[offerCode]) return OFFER_CODE_TAGS[offerCode]

  // Secours : devine à partir du nom du produit tel qu'enregistré sur Hotmart.
  const nom = (data?.product?.name || '').toLowerCase()
  if (nom.includes('pack')) return { tag: 'ACHETEUR_PACK', nom: data.product.name }
  if (nom.includes('tracker') || nom.includes('dashboard')) return { tag: 'ACHETEUR_TRACKER', nom: data.product.name }
  if (nom.includes('guide')) return { tag: 'ACHETEUR_GUIDE', nom: data.product.name }
  return { tag: 'ACHETEUR_INCONNU', nom: data?.product?.name || 'Produit inconnu' }
}

async function upsertContactBrevo(email, prenom, nom, tagInfo) {
  const apiKey = process.env.BREVO_API_KEY
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      email,
      attributes: { PRENOM: prenom, NOM: nom, [tagInfo.tag]: true, ACHETEUR: true },
      listIds: [BREVO_LIST_ACHETEURS],
      updateEnabled: true,
    }),
  })
  if (res.status !== 201 && res.status !== 204) {
    const d = await res.json().catch(() => ({}))
    if (d.code !== 'duplicate_parameter') console.error('[Brevo] hotmart upsert:', d.message || res.status)
  }
  return res.status
}

// stats.js stocke le revenu en centimes (cf. rev:${day} / 100 côté lecture).
async function reporterVente(montantEuros) {
  try {
    await fetch('https://diaspoinvest.fr/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ e: 'achat', montant: Math.round((Number(montantEuros) || 0) * 100) }),
    })
  } catch (e) {
    console.error('[stats] report vente échec:', e.message)
  }
}

// Remboursement/chargeback : retire la vente du dashboard (endpoint protégé
// côté stats.js par COCKPIT_SECRET, appel serveur-à-serveur uniquement).
async function reporterRemboursement(montantEuros) {
  const secret = process.env.COCKPIT_SECRET
  try {
    await fetch('https://diaspoinvest.fr/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(secret ? { 'x-cockpit-secret': secret } : {}) },
      body: JSON.stringify({ e: 'remboursement', montant: Math.round((Number(montantEuros) || 0) * 100) }),
    })
  } catch (e) {
    console.error('[stats] report remboursement échec:', e.message)
  }
}

async function marquerRembourseBrevo(email) {
  const apiKey = process.env.BREVO_API_KEY
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ email, attributes: { REMBOURSE: true }, updateEnabled: true }),
    })
  } catch (e) {
    console.error('[Brevo] marquer remboursé échec:', e.message)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const hottok = (process.env.HOTMART_HOTTOK || '').trim()
  const recu = req.headers['x-hotmart-hottok'] || ''
  if (!hottok) return res.status(500).json({ error: 'HOTMART_HOTTOK non configuré côté serveur' })
  if (recu !== hottok) return res.status(401).json({ error: 'hottok invalide' })

  const payload = req.body || {}
  const evenement = payload.event
  const REMBOURSEMENTS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK']

  if (evenement !== 'PURCHASE_APPROVED' && !REMBOURSEMENTS.includes(evenement)) {
    return res.status(200).json({ ignored: evenement || 'inconnu' })
  }

  const data = payload.data || {}
  const email = (data?.buyer?.email || '').trim()
  const montant = data?.purchase?.price?.value ?? data?.purchase?.full_price?.value ?? 0

  if (!email) return res.status(200).json({ ok: false, error: 'email manquant, ignoré' })

  if (REMBOURSEMENTS.includes(evenement)) {
    await reporterRemboursement(montant)
    await marquerRembourseBrevo(email)
    return res.status(200).json({ ok: true, email, remboursement: true, evenement })
  }

  const prenom = data?.buyer?.first_name || (data?.buyer?.name || '').split(' ')[0] || 'Client'
  const nom = data?.buyer?.last_name || ''
  const tagInfo = tagInfoFromPayload(data)
  const brevoStatus = await upsertContactBrevo(email, prenom, nom, tagInfo)
  await reporterVente(montant)

  return res.status(200).json({ ok: true, email, tag: tagInfo.tag, produit: tagInfo.nom, brevoStatus })
}
