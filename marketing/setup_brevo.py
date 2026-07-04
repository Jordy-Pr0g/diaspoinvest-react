# -*- coding: utf-8 -*-
"""
DiaspoInvest -- Configuration Brevo automatique
================================================
Ce script :
  1. Cree les templates J+2, J+4, J+7, J+10, J+14, J+16 dans Brevo
  2. Affiche les IDs a noter pour configurer l'automatisation

Usage : python setup_brevo.py
"""

import requests
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

BREVO_API_KEY = os.environ["BREVO_API_KEY"]
BREVO_URL = "https://api.brevo.com/v3"
MARKETING_DIR = os.path.dirname(os.path.abspath(__file__))

HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
    "api-key": BREVO_API_KEY,
}

TEMPLATES = [
    {
        "fichier": "brevo-template-j2.html",
        "sujet": "J'ai fait le calcul. Il ne m'a pas plu.",
        "nom": "DiaspoInvest - Sequence J+2",
        "expediteur_nom": "Jordan | DiaspoInvest",
        "expediteur_email": "contact@diaspoinvest.fr",
    },
    {
        "fichier": "brevo-template-j4.html",
        "sujet": "Mais comment on achete, concretement ?",
        "nom": "DiaspoInvest - Sequence J+4",
        "expediteur_nom": "Jordan | DiaspoInvest",
        "expediteur_email": "contact@diaspoinvest.fr",
    },
    {
        "fichier": "brevo-template-j7.html",
        "sujet": "Ce qui separe ceux qui investissent des autres.",
        "nom": "DiaspoInvest - Sequence J+7",
        "expediteur_nom": "Jordan | DiaspoInvest",
        "expediteur_email": "contact@diaspoinvest.fr",
    },
    {
        "fichier": "brevo-template-j10.html",
        "sujet": "T'as pas assez ? Voila ce que j'ai vu.",
        "nom": "DiaspoInvest - Sequence J+10",
        "expediteur_nom": "Jordan | DiaspoInvest",
        "expediteur_email": "contact@diaspoinvest.fr",
    },
    {
        "fichier": "brevo-template-j14.html",
        "sujet": "Le marche n'attend pas.",
        "nom": "DiaspoInvest - Sequence J+14",
        "expediteur_nom": "Jordan | DiaspoInvest",
        "expediteur_email": "contact@diaspoinvest.fr",
    },
    {
        "fichier": "brevo-template-j16.html",
        "sujet": "Une question rapide (1 clic suffit)",
        "nom": "DiaspoInvest - Sequence J+16",
        "expediteur_nom": "Jordan | DiaspoInvest",
        "expediteur_email": "contact@diaspoinvest.fr",
    },
]


def lire_html(fichier):
    chemin = os.path.join(MARKETING_DIR, fichier)
    with open(chemin, encoding="utf-8") as f:
        contenu = f.read()
    # Supprimer les commentaires HTML en tete
    lines = contenu.split("\n")
    lignes_propres = [l for l in lines if not l.strip().startswith("<!--")]
    return "\n".join(lignes_propres).strip()


def creer_template(t):
    html = lire_html(t["fichier"])
    payload = {
        "templateName": t["nom"],
        "subject": t["sujet"],
        "htmlContent": html,
        "sender": {
            "name": t["expediteur_nom"],
            "email": t["expediteur_email"],
        },
        "isActive": True,
    }
    r = requests.post(
        f"{BREVO_URL}/smtp/templates",
        headers=HEADERS,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    )
    if r.status_code in (200, 201):
        tid = r.json().get("id")
        print(f"  OK  Template #{tid} cree : {t['nom']}")
        return tid
    else:
        print(f"  ERR {r.status_code} pour {t['nom']} : {r.text[:200]}")
        return None


def verifier_connexion():
    r = requests.get(f"{BREVO_URL}/account", headers=HEADERS)
    if r.status_code == 200:
        compte = r.json()
        print(f"Connecte : {compte.get('email')} ({compte.get('firstName')} {compte.get('lastName')})")
        return True
    else:
        print(f"Erreur connexion Brevo : {r.status_code} {r.text[:100]}")
        return False


def main():
    print("=" * 60)
    print("DiaspoInvest -- Configuration Brevo")
    print("=" * 60)

    if not verifier_connexion():
        sys.exit(1)

    print("\nCreation des templates email...\n")
    ids = {}
    for t in TEMPLATES:
        jour = t["fichier"].replace("brevo-template-", "").replace(".html", "")
        tid = creer_template(t)
        ids[jour] = tid

    print("\n" + "=" * 60)
    print("RECAPITULATIF DES IDS TEMPLATES")
    print("(A noter pour configurer l'automatisation Brevo)")
    print("=" * 60)
    print(f"  Template J+0 (bienvenue) : #5  (existant)")
    for jour, tid in ids.items():
        print(f"  Template {jour.upper().replace('J', 'J+')} : #{tid}")

    print("\n" + "=" * 60)
    print("PROCHAINE ETAPE : Automatisation Brevo")
    print("=" * 60)
    print("""
L'automatisation (trigger + delais) doit etre configuree
manuellement dans Brevo car l'API Automation Brevo est
reservee aux plans Enterprise.

Voici la marche a suivre dans Brevo :
  1. Automations > Nouvelle automation
  2. Trigger : "Un contact rejoint une liste"
     Liste : #3 (Newsletter DiaspoInvest)
  3. Ajouter les etapes suivantes :

     IMMEDIATEMENT  -> Envoyer email : Template #5 (J+0)
     ATTENDRE 2 jours -> Envoyer email : Template J+2
     ATTENDRE 2 jours -> Envoyer email : Template J+4
     ATTENDRE 3 jours -> Envoyer email : Template J+7
     ATTENDRE 3 jours -> Envoyer email : Template J+10
     ATTENDRE 4 jours -> Envoyer email : Template J+14
     ATTENDRE 2 jours -> Envoyer email : Template J+16

  4. Activer l'automation
""")

    print("Templates crees avec succes. Bonne configuration !")


if __name__ == "__main__":
    main()
