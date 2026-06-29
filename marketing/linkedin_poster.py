# -*- coding: utf-8 -*-
"""
DiaspoInvest -- Poster sur LinkedIn via API
===========================================
Usage :
  1. Obtenir ton token LinkedIn (voir instructions ci-dessous)
  2. python linkedin_poster.py --texte "Ton post ici" [--image chemin/image.jpg]
  3. Ou : python linkedin_poster.py --brief contenu/brief_2026-06-14.md
          (extrait et poste le post LinkedIn du brief Imani)

Comment obtenir le token LinkedIn :
  1. Va sur https://www.linkedin.com/developers/apps
  2. Cree une app (nom : DiaspoInvest, page : ta page LinkedIn)
  3. Dans "Products", ajoute "Share on LinkedIn" et "Sign In with LinkedIn"
  4. Dans "Auth", note le Client ID et Client Secret
  5. Lance : python linkedin_poster.py --auth
     (ouvre le navigateur, tu autorises, le token est sauvegarde)

Le token dure 60 jours. Lance --auth pour en obtenir un nouveau.
"""

import sys
import os
import json
import argparse
import re
import webbrowser
from urllib.parse import urlencode, urlparse, parse_qs

sys.stdout.reconfigure(encoding="utf-8")

try:
    import requests
except ImportError:
    print("requests manquant : pip install requests")
    sys.exit(1)

# ── Configuration ──────────────────────────────────────────
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".linkedin_config.json")

LINKEDIN_API = "https://api.linkedin.com/v2"
SCOPES = "openid profile w_member_social"


def charger_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def sauver_config(cfg):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    print(f"Config sauvegardee : {CONFIG_FILE}")


def obtenir_token_auth(client_id, client_secret):
    """Flux OAuth2 interactif pour obtenir le token."""
    redirect_uri = "https://www.linkedin.com/developers/tools/oauth/redirect"
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": SCOPES,
        "state": "diaspoinvest2026",
    }
    auth_url = f"https://www.linkedin.com/oauth/v2/authorization?{urlencode(params)}"
    print(f"\nOuverture du navigateur pour autorisation LinkedIn...")
    print(f"Si ca ne s'ouvre pas, copie cette URL :\n{auth_url}\n")
    webbrowser.open(auth_url)

    print("Apres avoir autorise, colle ici l'URL complete de redirection :")
    redirect_url = input("> ").strip()

    parsed = urlparse(redirect_url)
    code = parse_qs(parsed.query).get("code", [None])[0]
    if not code:
        print("Code introuvable dans l'URL. Recommence.")
        sys.exit(1)

    r = requests.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret,
        },
    )
    if r.status_code != 200:
        print(f"Erreur token : {r.text}")
        sys.exit(1)

    data = r.json()
    token = data["access_token"]
    expires = data.get("expires_in", 5184000)
    print(f"Token obtenu ! Valide {expires // 86400} jours.")
    return token


def obtenir_person_urn(token):
    r = requests.get(
        f"{LINKEDIN_API}/userinfo",
        headers={"Authorization": f"Bearer {token}"},
    )
    if r.status_code != 200:
        print(f"Erreur profil : {r.text}")
        sys.exit(1)
    sub = r.json().get("sub")
    return f"urn:li:person:{sub}"


def publier_texte(token, person_urn, texte):
    """Publie un post texte sur LinkedIn."""
    payload = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": texte},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    r = requests.post(
        f"{LINKEDIN_API}/ugcPosts",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        json=payload,
    )
    if r.status_code in (200, 201):
        post_id = r.headers.get("x-restli-id", "inconnu")
        print(f"Post publie ! ID : {post_id}")
        return True
    else:
        print(f"Erreur publication : {r.status_code} {r.text[:300]}")
        return False


def extraire_post_linkedin(chemin_brief):
    """Extrait la section ## Post LinkedIn du brief Imani."""
    with open(chemin_brief, encoding="utf-8") as f:
        contenu = f.read()
    match = re.search(r"## Post LinkedIn\s*\n(.*?)(\n## |\Z)", contenu, re.DOTALL)
    if not match:
        print("Section '## Post LinkedIn' introuvable dans le brief.")
        sys.exit(1)
    texte = match.group(1).strip()
    # Nettoyer le markdown basique
    texte = re.sub(r"\*\*(.+?)\*\*", r"\1", texte)
    texte = re.sub(r"\*(.+?)\*", r"\1", texte)
    return texte


def cmd_auth(args):
    cfg = charger_config()
    client_id = args.client_id or cfg.get("client_id") or input("Client ID LinkedIn : ").strip()
    client_secret = args.client_secret or cfg.get("client_secret") or input("Client Secret LinkedIn : ").strip()
    token = obtenir_token_auth(client_id, client_secret)
    person_urn = obtenir_person_urn(token)
    cfg.update({"client_id": client_id, "client_secret": client_secret,
                "token": token, "person_urn": person_urn})
    sauver_config(cfg)
    print(f"Profil : {person_urn}")
    print("Pret a publier. Lance : python linkedin_poster.py --texte 'Ton post'")


def cmd_post(args):
    cfg = charger_config()
    token = cfg.get("token")
    person_urn = cfg.get("person_urn")
    if not token or not person_urn:
        print("Token manquant. Lance d'abord : python linkedin_poster.py --auth")
        sys.exit(1)

    if args.brief:
        texte = extraire_post_linkedin(args.brief)
        print(f"\nPost extrait du brief ({len(texte)} caracteres) :")
        print("-" * 40)
        print(texte[:300] + ("..." if len(texte) > 300 else ""))
        print("-" * 40)
        confirmation = input("\nPublier ce post ? (oui/non) : ").strip().lower()
        if confirmation not in ("oui", "o", "yes", "y"):
            print("Annule.")
            sys.exit(0)
    elif args.texte:
        texte = args.texte
    else:
        print("Donne --texte 'ton post' ou --brief chemin/brief.md")
        sys.exit(1)

    publier_texte(token, person_urn, texte)


def main():
    parser = argparse.ArgumentParser(description="DiaspoInvest -- Poster sur LinkedIn")
    sub = parser.add_subparsers(dest="cmd")

    auth_p = sub.add_parser("--auth", help="Authentification LinkedIn (a faire une fois)")
    auth_p.add_argument("--client-id", default=None)
    auth_p.add_argument("--client-secret", default=None)

    post_p = sub.add_parser("--post", help="Publier un post")
    post_p.add_argument("--texte", default=None, help="Texte du post")
    post_p.add_argument("--brief", default=None, help="Chemin vers un brief Imani .md")

    # Compatibilite usage direct : python linkedin_poster.py --texte / --auth
    parser.add_argument("--auth", action="store_true")
    parser.add_argument("--client-id", default=None)
    parser.add_argument("--client-secret", default=None)
    parser.add_argument("--texte", default=None)
    parser.add_argument("--brief", default=None)

    args = parser.parse_args()

    if args.auth:
        cmd_auth(args)
    elif args.texte or args.brief:
        cmd_post(args)
    else:
        print(__doc__)
        parser.print_help()


if __name__ == "__main__":
    main()
