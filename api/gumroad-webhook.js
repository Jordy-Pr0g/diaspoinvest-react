// Vercel serverless function — reçoit chaque vente Gumroad (réglage "Ping").
// Ferme la boucle vente -> CRM -> tracking, SANS service tiers (pas de n8n/Zapier).
//
// À chaque achat, Gumroad POST (form-urlencoded) les infos de la vente ici.
// Cette fonction fait 2 choses :
//   1) ajoute l'acheteur à la liste Brevo #6 "Acheteurs" + attribut PRODUIT_ACHETE
//   2) envoie un event serveur "achat" à Plausible -> le ratio quiz_termine -> achat
//      se lit alors directement dans le dashboard Plausible.
//
// Variables d'environnement Vercel requises :
//   BREVO_API_KEY        — déjà utilisée par subscribe-segment.js
//   GUMROAD_PING_SECRET  — mot de passe à inventer ; on le met aussi dans l'URL du Ping
//                          (Gumroad ne signe pas ses requêtes -> on protège par ce token)
// Variable optionnelle :
//   PLAUSIBLE_DOMAIN     — défaut "diaspoinvest.fr"

const LISTE_ACHETEURS = 6 // "Acheteurs"

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  // Sécurité : Gumroad ne signe pas le Ping, on exige un token secret dans l'URL
  // (ex : https://diaspoinvest.fr/api/gumroad-webhook?token=XXXX)
  const secret = (process.env.GUMROAD_PING_SECRET || '').trim()
  if (!secret || (req.query.token || '') !== secret) {
    return res.status(403).json({ success: false, error: 'Forbidden' })
  }

  // Gumroad envoie du form-urlencoded ; Vercel le parse dans req.body.
  const body = req.body || {}
  const email = (body.email || '').trim()
  const productName = (body.product_name || '').trim()
  const productPermalink = (body.permalink || body.product_permalink || '').trim()
  const price = body.price // en centimes selon Gumroad
  const currency = (body.currency || 'eur').toUpperCase()

  // Un test/refund sans email ne doit pas casser : on répond 200 pour ne pas faire ré-essayer Gumroad.
  if (!isValidEmail(email)) {
    return res.status(200).json({ success: false, error: 'Email manquant ou invalide, ignoré.' })
  }

  const apiKey = (process.env.BREVO_API_KEY || '').trim()
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'BREVO_API_KEY non configurée' })
  }

  // 1) Inscription/MAJ de l'acheteur dans la liste Acheteurs + attribut produit.
  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [LISTE_ACHETEURS],
        updateEnabled: true, // déjà connu (ex : inscrit via le quiz) -> on met à jour, pas d'erreur
        attributes: {
          PRODUIT_ACHETE: productName || productPermalink || '',
        },
      }),
    })

    if (r.status !== 201 && r.status !== 204) {
      const data = await r.json().catch(() => ({}))
      // Le contact existe déjà : ce n'est pas une erreur, on continue vers Plausible.
      if (data.code !== 'duplicate_parameter') {
        // On log mais on ne bloque pas le tracking : la vente a bien eu lieu.
        console.error('Brevo acheteur:', data.message || r.status)
      }
    }
  } catch (e) {
    console.error('Brevo injoignable:', e.message)
    // On continue : mieux vaut au moins tracker l'achat dans Plausible.
  }

  // 2) Event serveur "achat" vers Plausible (même dashboard que quiz_termine).
  //    -> ratio quiz -> achat lisible directement, sans croiser Gumroad à la main.
  try {
    const domain = (process.env.PLAUSIBLE_DOMAIN || 'diaspoinvest.fr').trim()
    await fetch('https://plausible.io/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Plausible exige un User-Agent et une IP ; on relaie ceux de la requête.
        'User-Agent': req.headers['user-agent'] || 'DiaspoInvest-Gumroad-Webhook',
        'X-Forwarded-For': (req.headers['x-forwarded-for'] || '0.0.0.0').split(',')[0].trim(),
      },
      body: JSON.stringify({
        name: 'achat',
        domain,
        url: `https://${domain}/merci`, // URL logique de conversion
        props: {
          produit: productName || productPermalink || 'inconnu',
          montant: typeof price !== 'undefined' ? String(price) : '',
          devise: currency,
        },
      }),
    })
  } catch (e) {
    console.error('Plausible event échec:', e.message)
  }

  return res.status(200).json({ success: true })
}
