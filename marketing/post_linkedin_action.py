# -*- coding: utf-8 -*-
"""
Script GitHub Actions — Poster sur LinkedIn
Usage : python post_linkedin_action.py "texte du post"
Vars requises : LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
"""
import sys, os, requests

def post(texte):
    token = os.environ["LINKEDIN_ACCESS_TOKEN"]
    urn   = os.environ["LINKEDIN_PERSON_URN"]

    r = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        json={
            "author": urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": texte},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        },
    )
    if r.status_code in (200, 201):
        post_id = r.headers.get("x-restli-id", "")
        print(f"Post publie ! ID : {post_id}")
        # Ecrire l'ID dans un fichier pour les etapes suivantes
        with open("post_id.txt", "w") as f:
            f.write(post_id)
    else:
        print(f"ERREUR {r.status_code}: {r.text[:300]}")
        sys.exit(1)

if __name__ == "__main__":
    texte = sys.argv[1] if len(sys.argv) > 1 else ""
    if not texte.strip():
        print("Texte vide.")
        sys.exit(1)
    post(texte)
