# -*- coding: utf-8 -*-
"""
DiaspoInvest — Webhook Lemon Squeezy → Brevo
============================================
Reçoit les notifications de paiement Lemon Squeezy et tague automatiquement
les acheteurs dans Brevo (liste + attribut produit + séquence post-achat).

DÉPLOIEMENT :
  1. Déployer sur Vercel (ou un serveur) à l'URL : https://diaspoinvest.fr/api/webhook-ls
  2. Dans Lemon Squeezy : Settings > Webhooks > Add Webhook
     URL : https://diaspoinvest.fr/api/webhook-ls
     Events : order_created
     Secret : (générer un secret et le mettre dans LEMONSQUEEZY_WEBHOOK_SECRET)
  3. Remplir les IDs de produits ci-dessous quand créés sur Lemon Squeezy

VARIABLES D'ENVIRONNEMENT REQUISES :
  BREVO_API_KEY            — clé API Brevo (déjà dans GitHub Secrets)
  LEMONSQUEEZY_WEBHOOK_SECRET — secret webhook Lemon Squeezy

QUAND JORDAN CRÉE LES PRODUITS LEMON SQUEEZY :
  Remplir les 3 constantes PRODUCT_ID_* ci-dessous.
"""

import hashlib
import hmac
import json
import os
import requests

# ─── À REMPLIR après création des produits Lemon Squeezy ──────────────────────
PRODUCT_ID_GUIDE   = "XXXXXXXX"   # 14,99€ — Guide PDF
PRODUCT_ID_TRACKER = "XXXXXXXX"   # 24,99€ — Tracker Dashboard
PRODUCT_ID_PACK    = "XXXXXXXX"   # 29,99€ — Pack Guide + Tracker

# ─── Brevo — IDs à vérifier ────────────────────────────────────────────────────
BREVO_LIST_ACHETEURS = 6          # Liste "Acheteurs DiaspoInvest" — créée le 15/06/2026
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")

BREVO_HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
    "api-key": BREVO_API_KEY,
}

# ─── Mapping produit → tag Brevo ───────────────────────────────────────────────
PRODUCT_TAGS = {
    PRODUCT_ID_GUIDE:   {"tag": "acheteur_guide",   "nom": "Guide PDF"},
    PRODUCT_ID_TRACKER: {"tag": "acheteur_tracker",  "nom": "Tracker Dashboard"},
    PRODUCT_ID_PACK:    {"tag": "acheteur_pack",     "nom": "Pack Guide + Tracker"},
}


def verify_signature(payload_bytes: bytes, signature: str, secret: str) -> bool:
    """Vérifie la signature HMAC-SHA256 du webhook Lemon Squeezy."""
    expected = hmac.new(
        secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def upsert_contact_brevo(email: str, prenom: str, nom: str, product_id: str) -> dict:
    """
    Crée ou met à jour un contact dans Brevo :
    - Ajoute à la liste Acheteurs
    - Pose l'attribut TAG_PRODUIT
    - Ne touche pas à la liste Newsletter (le contact y est peut-être déjà)
    """
    tag_info = PRODUCT_TAGS.get(product_id, {"tag": "acheteur_inconnu", "nom": "Inconnu"})
    tag      = tag_info["tag"]

    payload = {
        "email": email,
        "attributes": {
            "PRENOM": prenom,
            "NOM": nom,
            tag.upper(): True,           # ex: ACHETEUR_TRACKER = true
            "ACHETEUR": True,
        },
        "listIds": [BREVO_LIST_ACHETEURS],
        "updateEnabled": True,
    }

    r = requests.post(
        "https://api.brevo.com/v3/contacts",
        headers=BREVO_HEADERS,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    )

    if r.status_code in (200, 201):
        print(f"[Brevo] Contact {email} ajouté/mis à jour — tag: {tag}")
    else:
        print(f"[Brevo] ERREUR {r.status_code}: {r.text[:200]}")

    return {"status": r.status_code, "tag": tag}


def send_delivery_email(email: str, prenom: str, product_id: str, download_url: str) -> None:
    """
    Envoie l'email de livraison immédiate via Brevo transactionnel.
    Template #23 = email livraison (à créer dans Brevo avec le HTML de brevo-template-livraison.html)
    """
    tag_info   = PRODUCT_TAGS.get(product_id, {"nom": "produit"})
    produit    = tag_info["nom"]

    payload = {
        "to": [{"email": email, "name": prenom}],
        "templateId": 23,              # Template livraison — à créer dans Brevo
        "params": {
            "PRENOM":       prenom,
            "PRODUIT":      produit,
            "DOWNLOAD_URL": download_url,
        },
        "sender": {
            "name":  "Jordan | DiaspoInvest",
            "email": "contact@diaspoinvest.fr",
        },
    }

    r = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers=BREVO_HEADERS,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    )

    if r.status_code in (200, 201):
        print(f"[Brevo] Email livraison envoyé à {email}")
    else:
        print(f"[Brevo] ERREUR livraison {r.status_code}: {r.text[:200]}")


def handle_order_created(payload: dict) -> dict:
    """Traite un événement order_created de Lemon Squeezy."""
    try:
        data       = payload["data"]
        attributes = data["attributes"]
        customer   = attributes.get("first_order_item", {})

        email      = attributes.get("user_email", "")
        prenom     = attributes.get("user_name", "").split()[0] if attributes.get("user_name") else "Cher client"
        nom        = " ".join(attributes.get("user_name", "").split()[1:]) if attributes.get("user_name") else ""
        product_id = str(customer.get("product_id", ""))

        # URL de téléchargement fournie par Lemon Squeezy
        urls        = attributes.get("urls", {})
        receipt_url = urls.get("receipt", "https://diaspoinvest.fr")

        if not email:
            return {"error": "email manquant"}

        # 1. Tagger dans Brevo
        result = upsert_contact_brevo(email, prenom, nom, product_id)

        # 2. Email de livraison immédiate
        send_delivery_email(email, prenom, product_id, receipt_url)

        return {"ok": True, "email": email, "tag": result.get("tag")}

    except (KeyError, IndexError) as e:
        print(f"[Webhook] Erreur parsing payload: {e}")
        return {"error": str(e)}


# ─── Handler Vercel (serverless function) ──────────────────────────────────────
# Nommer ce fichier api/webhook-ls.py dans le dépôt DiaspoInvest/ pour Vercel

def handler(request, response):
    """Point d'entrée Vercel serverless."""
    if request.method != "POST":
        return response.status(405).json({"error": "Method not allowed"})

    # Vérification signature
    secret    = os.environ.get("LEMONSQUEEZY_WEBHOOK_SECRET", "")
    signature = request.headers.get("X-Signature", "")
    body      = request.body

    if secret and not verify_signature(body, signature, secret):
        print("[Webhook] Signature invalide")
        return response.status(401).json({"error": "Invalid signature"})

    # Parse event
    try:
        payload    = json.loads(body)
        event_name = payload.get("meta", {}).get("event_name", "")
    except json.JSONDecodeError:
        return response.status(400).json({"error": "Invalid JSON"})

    if event_name == "order_created":
        result = handle_order_created(payload)
        return response.status(200).json(result)

    # Autres events ignorés silencieusement
    return response.status(200).json({"ignored": event_name})


# ─── Test local ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Simuler un paiement Tracker pour tester sans vrai webhook
    test_payload = {
        "meta": {"event_name": "order_created"},
        "data": {
            "attributes": {
                "user_email": "test@example.com",
                "user_name":  "Aminata Test",
                "first_order_item": {
                    "product_id": PRODUCT_ID_TRACKER,
                },
                "urls": {
                    "receipt": "https://app.lemonsqueezy.com/my-orders/test",
                },
            }
        }
    }
    print("=== TEST LOCAL WEBHOOK ===")
    result = handle_order_created(test_payload)
    print("Résultat:", result)
