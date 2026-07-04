# -*- coding: utf-8 -*-
"""
DiaspoInvest — Envoi MAJ mensuelle Tracker aux acheteurs
=========================================================
À lancer le 1er du mois, après avoir généré la nouvelle version du Tracker
avec scripts/maj_tracker_mensuel.py.

Usage :
    python scripts/send_monthly_update.py --mois "juillet 2026" --url "https://LIEN_TELECHARGEMENT"

Le script :
1. Récupère tous les contacts Brevo avec ACHETEUR_TRACKER=true ou ACHETEUR_PACK=true
2. Envoie l'email MAJ mensuelle (template #24) à chacun
3. Affiche un rapport

JAMAIS en automatique — Jordan valide et lance manuellement.
"""

import os
import argparse
import json
import sys
import time
import requests

sys.stdout.reconfigure(encoding='utf-8')

BREVO_API_KEY     = os.environ["BREVO_API_KEY"]
BREVO_HEADERS     = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'api-key': BREVO_API_KEY,
}
TEMPLATE_MAJ      = 24   # DiaspoInvest - MAJ mensuelle Tracker
LIST_ACHETEURS    = 6    # Liste Acheteurs DiaspoInvest


def get_acheteurs_tracker() -> list[dict]:
    """Récupère tous les contacts de la liste Acheteurs avec ACHETEUR_TRACKER ou ACHETEUR_PACK."""
    contacts = []
    offset = 0
    limit  = 50

    while True:
        r = requests.get(
            f'https://api.brevo.com/v3/contacts/lists/{LIST_ACHETEURS}/contacts',
            headers=BREVO_HEADERS,
            params={'limit': limit, 'offset': offset, 'modifiedSince': '2020-01-01T00:00:00Z'},
        )
        if r.status_code != 200:
            print(f'ERREUR liste contacts: {r.status_code} {r.text[:200]}')
            break

        data = r.json()
        batch = data.get('contacts', [])
        if not batch:
            break

        for c in batch:
            attrs = c.get('attributes', {})
            # Inclure si Tracker ou Pack
            if attrs.get('ACHETEUR_TRACKER') or attrs.get('ACHETEUR_PACK'):
                contacts.append({
                    'email':  c.get('email', ''),
                    'prenom': attrs.get('PRENOM', 'Client'),
                })

        offset += limit
        if len(batch) < limit:
            break

    return contacts


def send_maj_email(email: str, prenom: str, mois: str, download_url: str) -> bool:
    """Envoie l'email MAJ mensuelle à un contact."""
    payload = {
        'to': [{'email': email, 'name': prenom}],
        'templateId': TEMPLATE_MAJ,
        'params': {
            'PRENOM':       prenom,
            'MOIS':         mois,
            'DOWNLOAD_URL': download_url,
        },
        'sender': {
            'name':  'Jordan | DiaspoInvest',
            'email': 'contact@diaspoinvest.fr',
        },
    }

    r = requests.post(
        'https://api.brevo.com/v3/smtp/email',
        headers=BREVO_HEADERS,
        data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
    )
    return r.status_code in (200, 201)


def main():
    parser = argparse.ArgumentParser(description='Envoi MAJ mensuelle Tracker')
    parser.add_argument('--mois', required=True, help='Ex: "juillet 2026"')
    parser.add_argument('--url',  required=True, help='Lien de téléchargement du Tracker mis à jour')
    parser.add_argument('--test', action='store_true', help='Mode test : affiche les destinataires sans envoyer')
    args = parser.parse_args()

    print(f'\n=== DiaspoInvest — MAJ mensuelle Tracker {args.mois} ===\n')

    acheteurs = get_acheteurs_tracker()
    print(f'{len(acheteurs)} acheteur(s) Tracker/Pack trouvé(s)\n')

    if not acheteurs:
        print('Aucun acheteur trouvé. Vérifie la liste #6 dans Brevo.')
        return

    if args.test:
        print('MODE TEST — aucun email envoyé :')
        for c in acheteurs:
            print(f'  {c["email"]} ({c["prenom"]})')
        return

    ok = 0
    ko = 0
    for c in acheteurs:
        success = send_maj_email(c['email'], c['prenom'], args.mois, args.url)
        status  = 'OK' if success else 'ERREUR'
        print(f'  {status} → {c["email"]}')
        if success:
            ok += 1
        else:
            ko += 1
        time.sleep(0.2)  # éviter rate-limit Brevo

    print(f'\nRésultat : {ok} envoyés, {ko} erreurs')


if __name__ == '__main__':
    main()
