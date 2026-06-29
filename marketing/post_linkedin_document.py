# -*- coding: utf-8 -*-
"""
Poster un PDF comme carrousel natif LinkedIn (document post).
Usage : python post_linkedin_document.py "Texte du post" chemin/fichier.pdf "Titre du doc"
Vars requises : LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
"""
import sys, os, requests

def upload_document(token, person_urn, pdf_path, titre):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    # Etape 1 : enregistrer l'upload
    reg = requests.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        headers=headers,
        json={
            "registerUploadRequest": {
                "owner": person_urn,
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-document"],
                "serviceRelationships": [{
                    "identifier": "urn:li:userGeneratedContent",
                    "relationshipType": "OWNER"
                }],
                "supportedUploadMechanism": ["SYNCHRONOUS_UPLOAD"]
            }
        }
    )
    if reg.status_code not in (200, 201):
        print(f"Erreur enregistrement upload : {reg.status_code} {reg.text[:300]}")
        sys.exit(1)

    data = reg.json()
    upload_url = data["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
    asset_urn  = data["value"]["asset"]
    print(f"Asset URN : {asset_urn}")

    # Etape 2 : envoyer le PDF
    with open(pdf_path, "rb") as f:
        pdf_data = f.read()

    upload_resp = requests.put(
        upload_url,
        headers={"Authorization": f"Bearer {token}"},
        data=pdf_data,
    )
    if upload_resp.status_code not in (200, 201):
        print(f"Erreur upload PDF : {upload_resp.status_code} {upload_resp.text[:300]}")
        sys.exit(1)
    print("PDF uploade avec succes.")
    return asset_urn


def post_document(token, person_urn, texte, asset_urn, titre):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    payload = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": texte},
                "shareMediaCategory": "DOCUMENT",
                "media": [{
                    "status": "READY",
                    "description": {"text": titre},
                    "media": asset_urn,
                    "title": {"text": titre},
                }]
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }

    r = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=headers,
        json=payload,
    )
    if r.status_code in (200, 201):
        post_id = r.headers.get("x-restli-id", "")
        print(f"Post publie ! ID : {post_id}")
        with open("post_id.txt", "w") as f:
            f.write(post_id)
    else:
        print(f"Erreur publication : {r.status_code} {r.text[:300]}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage : python post_linkedin_document.py 'texte' chemin.pdf 'Titre'")
        sys.exit(1)

    texte    = sys.argv[1]
    pdf_path = sys.argv[2]
    titre    = sys.argv[3] if len(sys.argv) > 3 else os.path.basename(pdf_path)

    token      = os.environ["LINKEDIN_ACCESS_TOKEN"]
    person_urn = os.environ["LINKEDIN_PERSON_URN"]

    asset_urn = upload_document(token, person_urn, pdf_path, titre)
    post_document(token, person_urn, texte, asset_urn, titre)
