# -*- coding: utf-8 -*-
"""Scan quotidien BRVM : detecte les signaux et envoie un email via Brevo si alerte.
   Tourne sur GitHub Actions (voir .github/workflows/alertes-brvm.yml).
   Regles alignees sur le plan v4 de Jordan et le dashboard local."""
import os, sys, csv, io, json, statistics, urllib.request
from datetime import date

RAW = "https://raw.githubusercontent.com/Fredysessie/brvm-data-public/main/data/{t}/{t}.monthly.csv"
TICKERS = ("SNTS ORAC PALC TTLC ONTBF SIBC CBIBF CIEC SDSC SPHC SOGC STBC ECOC "
           "BOAC BOAS BICC NSBC SLBC SMBC TTLS SHEC CFAC ETIT BICB SCRC SAFC FTSC "
           "UNLC UNXC BOAN").split()
PANIER = {"SNTS", "ORAC", "PALC", "TTLC", "ONTBF"}
ZONES = {"SIBC": 7500, "CBIBF": 17000, "CIEC": 3800, "SDSC": 2000, "STBC": 21000}
DETACHEMENTS = {"STBC": "2026-08-27"}  # rappel <10 jours avant

DEST = os.environ.get("ALERTE_EMAIL", "djiokapjordan@gmail.com")


def charge(t):
    req = urllib.request.Request(RAW.format(t=t), headers={"User-Agent": "brvm-alertes"})
    rows = list(csv.reader(io.StringIO(urllib.request.urlopen(req, timeout=30).read().decode())))
    if rows and not rows[0][1].replace(".", "").replace("-", "").isdigit():
        rows = rows[1:]
    out = []
    for r in rows:
        try:
            out.append({"date": r[0], "close": float(r[4]), "vol": int(float(r[5])) if r[5] else 0})
        except (ValueError, IndexError):
            continue
    return out


def scan():
    alertes = []
    for t in TICKERS:
        try:
            d = charge(t)
        except Exception as e:
            print(f"{t}: erreur de chargement ({e})", file=sys.stderr)
            continue
        if len(d) < 14:
            continue
        cur = d[-1]["close"]
        mm12 = statistics.mean(x["close"] for x in d[-12:])
        prev = d[-2]["close"]
        var_mois = (cur / prev - 1) * 100 if prev else 0
        vols = [x["vol"] for x in d[-13:-1] if x["vol"] > 0]
        vol_moy = statistics.mean(vols) if vols else 0
        vol_ratio = d[-1]["vol"] / vol_moy if vol_moy else 0
        vs_mm12 = (cur / mm12 - 1) * 100

        # a. entree en zone watchlist
        if t in ZONES and cur <= ZONES[t]:
            alertes.append(f"ZONE ATTEINTE  {t} : cours {cur:,.0f} F <= zone {ZONES[t]:,.0f} F "
                           f"(MM12 {mm12:,.0f}, {vs_mm12:+.1f}%). Verifier les fondamentaux avant tout ordre.")
        # b. feux du panier v4
        if t in PANIER:
            if var_mois >= 10:
                alertes.append(f"FEU ROUGE PANIER  {t} : {var_mois:+.1f}% dans le mois. "
                               f"Regle des +10% : suspendre l'ordre prevu ce mois-ci.")
            elif vs_mm12 <= -3:
                alertes.append(f"RENFORCEMENT POSSIBLE  {t} : cours {cur:,.0f} F sous sa MM12 "
                               f"({vs_mm12:+.1f}%). Bon point pour l'ordre du mois si fondamentaux inchanges.")
        # c. flambee suspecte
        if var_mois >= 15 and vol_ratio >= 2:
            alertes.append(f"FLAMBEE SUSPECTE  {t} : {var_mois:+.1f}% dans le mois, volume x{vol_ratio:.1f}. "
                           f"Signature de flux coordonne : ne pas toucher, observer.")
        # d. shakeout potentiel
        if var_mois <= -12 and vol_ratio >= 2:
            alertes.append(f"SHAKEOUT POTENTIEL  {t} : {var_mois:+.1f}% dans le mois, volume x{vol_ratio:.1f}, "
                           f"cours {cur:,.0f} F (MM12 {mm12:,.0f}). Verifier les derniers resultats sur "
                           f"sikafinance.com/marches/cotation_{t} : s'ils sont bons, opportunite value a etudier.")
    # e. detachements proches
    today = date.today()
    for t, ds in DETACHEMENTS.items():
        y, m, dd = map(int, ds.split("-"))
        delta = (date(y, m, dd) - today).days
        if 0 <= delta <= 10:
            alertes.append(f"DETACHEMENT PROCHE  {t} : detachement le {ds} (J-{delta}). "
                           f"Rappel : acheter APRES le detachement, jamais juste avant.")
    return alertes


def envoie_email(alertes):
    key = os.environ.get("BREVO_API_KEY")
    if not key:
        print("BREVO_API_KEY absente : impression seule.", file=sys.stderr)
        return False
    corps = "Signaux BRVM du jour :\n\n" + "\n\n".join("- " + a for a in alertes) + \
            "\n\nRappels : marche au sommet de son cycle, rien ne se vend avant 2031, " \
            "aucun achat en flambee. Dashboard local pour le detail.\n"
    payload = {
        "sender": {"name": "Alertes BRVM", "email": "contact@diaspoinvest.fr"},
        "to": [{"email": DEST}],
        "subject": f"Alerte BRVM {date.today():%d/%m} : {len(alertes)} signal(aux)",
        "textContent": corps,
    }
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode(),
        headers={"api-key": key, "Content-Type": "application/json"},
    )
    urllib.request.urlopen(req, timeout=30)
    return True


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    alertes = scan()
    if not alertes:
        print("RAS - aucun signal aujourd'hui")
        sys.exit(0)
    print(f"{len(alertes)} signal(aux) :")
    for a in alertes:
        print(" -", a)
    if dry:
        print("(dry-run : pas d'email)")
    else:
        ok = envoie_email(alertes)
        print("email envoye" if ok else "email non envoye (cle manquante)")
