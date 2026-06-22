# -*- coding: utf-8 -*-
"""
Script GitHub Actions — Poster un PDF en premier commentaire LinkedIn
Usage : python post_linkedin_comment.py <post_id> <chemin_pdf>
Vars requises : LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
"""
import sys, os, time, requests

def upload_pdf(token, urn, pdf_path):
    # Etape 1 : enregistrer l'upload
    r = requests.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        json={
            "registerUploadRequest": {
                "owner": urn,
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-document"],
                "serviceRelationships": [
                    {
                        "identifier": "urn:li:userGeneratedContent",
                        "relationshipType": "OWNER",
                    }
                ],
                "supportedUploadMechanism": ["SYNCHRONOUS_UPLOAD"],
            }
        },
    )
    if r.status_code != 200:
        print(f"ERREUR registerUpload {r.status_code}: {r.text[:300]}")
        sys.exit(1)

    data = r.json()
    upload_url = data["value"]["uploadMechanism"][
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]["uploadUrl"]
    asset_urn = data["value"]["asset"]

    # Etape 2 : uploader le binaire
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    r2 = requests.put(
        upload_url,
        headers={"Authorization": f"Bearer {token}"},
        data=pdf_bytes,
    )
    if r2.status_code not in (200, 201):
        print(f"ERREUR upload PDF {r2.status_code}: {r2.text[:300]}")
        sys.exit(1)

    # Attendre que LinkedIn traite le document
    time.sleep(5)
    return asset_urn


def post_comment(token, urn, post_id, asset_urn, pdf_name):
    r = requests.post(
        "https://api.linkedin.com/v2/socialActions/{}/comments".format(post_id),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        json={
            "actor": urn,
            "message": {"text": ""},
            "content": [
                {
                    "type": "DOCUMENT",
                    "entity": {"digitalmediaAsset": asset_urn},
                    "title": pdf_name,
                }
            ],
        },
    )
    if r.status_code in (200, 201):
        print(f"Commentaire PDF poste !")
    else:
        print(f"ERREUR commentaire {r.status_code}: {r.text[:300]}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python post_linkedin_comment.py <post_id> <chemin_pdf>")
        sys.exit(1)

    post_id = sys.argv[1]
    pdf_path = sys.argv[2]
    pdf_name = os.path.basename(pdf_path).replace(".pdf", "")

    token = os.environ["LINKEDIN_ACCESS_TOKEN"]
    urn = os.environ["LINKEDIN_PERSON_URN"]

    print(f"Upload du PDF : {pdf_path}")
    asset_urn = upload_pdf(token, urn, pdf_path)
    print(f"Asset URN : {asset_urn}")
    post_comment(token, urn, post_id, asset_urn, pdf_name)
