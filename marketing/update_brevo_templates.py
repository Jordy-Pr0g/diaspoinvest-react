# -*- coding: utf-8 -*-
"""Met a jour les templates Brevo existants avec le nouveau contenu HTML."""
import os
import requests, json, os, sys
sys.stdout.reconfigure(encoding="utf-8")

BREVO_API_KEY = os.environ["BREVO_API_KEY"]
HEADERS = {"accept":"application/json","content-type":"application/json","api-key":BREVO_API_KEY}
DIR = os.path.dirname(os.path.abspath(__file__))

UPDATES = [
    # (template_id, fichier, sujet)
    (17, "brevo-template-j2.html",  "J'ai fait le calcul. Il ne m'a pas plu."),
    (18, "brevo-template-j4.html",  "Mais comment on achete, concretement ?"),
    (19, "brevo-template-j7.html",  "Ce qui separe ceux qui investissent des autres."),
    (20, "brevo-template-j10.html", "T'as pas assez ? Voila ce que j'ai calcule."),
    (21, "brevo-template-j14.html", "Le marche n'attend pas."),
    (22, "brevo-template-j16.html", "Une question rapide (1 clic suffit)"),
]

for tid, fichier, sujet in UPDATES:
    with open(os.path.join(DIR, fichier), encoding="utf-8") as f:
        html = "\n".join(l for l in f.read().split("\n") if not l.strip().startswith("<!--")).strip()
    payload = {
        "subject": sujet,
        "htmlContent": html,
        "sender": {"name": "Jordan | DiaspoInvest", "email": "contact@diaspoinvest.fr"},
        "isActive": True,
    }
    r = requests.put(
        f"https://api.brevo.com/v3/smtp/templates/{tid}",
        headers=HEADERS,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    )
    status = "OK" if r.status_code in (200, 201, 204) else f"ERR {r.status_code}: {r.text[:120]}"
    print(f"  Template #{tid} ({fichier}) -> {status}")
