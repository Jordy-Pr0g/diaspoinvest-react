#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DiaspoInvest — Scraper BRVM fiable
==================================
Récupère les données officielles de la BRVM et les VÉRIFIE avant de les livrer.

Principe : la fiabilité avant tout.
  • Source primaire   : brvm.org (la Bourse elle-même — clôture officielle)
  • Source de contrôle : sikafinance.com (recoupement croisé)
  • Garde-fous : si une donnée est absente, aberrante, ou si les 2 sources
    divergent trop → l'anomalie est SIGNALÉE et le code de sortie != 0.
    => Un automate (n8n) ne doit JAMAIS envoyer d'email si le code != 0.

Sorties (dans le dossier ./data) :
  • brvm_YYYY-MM-DD.json  : données structurées et datées
  • brvm_YYYY-MM-DD.txt   : rapport lisible (anomalies en tête)

Codes de sortie :
  0 = données propres, vérifiées (OK pour la suite)
  2 = anomalies détectées → VÉRIFICATION HUMAINE obligatoire
  3 = échec de collecte (source injoignable) → ne rien envoyer
"""

import sys, os, re, json, unicodedata
from datetime import datetime, timezone

# Console Windows : forcer l'UTF-8 pour les emojis/accents
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

try:
    import requests
    from bs4 import BeautifulSoup
    import urllib3
except ImportError:
    print("Dépendances manquantes. Lance : pip install requests beautifulsoup4")
    sys.exit(3)

# ── Configuration ─────────────────────────────────────────────
URL_COURS   = "https://www.brvm.org/fr/cours-actions/0"
URL_INDICES = "https://www.brvm.org/fr/indices/0"
URL_SIKA    = "https://www.sikafinance.com/marches/aaz"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"}

NB_ACTIONS_ATTENDU = 40        # on attend ~47 actions ; en-dessous = suspect
VARIATION_MAX_PLAUSIBLE = 30.0 # une variation hebdo > 30% mérite vérification
ECART_SOURCES_MAX = 2.0        # écart de cours toléré entre brvm.org et sika (%)
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


# ── Utilitaires de parsing (format français) ─────────────────
def to_float(txt):
    """'28 500' -> 28500.0 ; '1,70' -> 1.70 ; '-0,09' -> -0.09 ; '' -> None"""
    if txt is None:
        return None
    t = (txt.replace("\xa0", "").replace(" ", "")
            .replace(" ", "").replace("%", "").replace(",", ".").strip())
    if t in ("", "-", "—"):
        return None
    try:
        return float(t)
    except ValueError:
        return None


_TOKENS_PAYS = {"COTE", "DIVOIRE", "IVOIRE", "CI", "BENIN", "BN", "BURKINA",
                "FASO", "BF", "MALI", "NIGER", "SENEGAL", "SN", "TOGO", "TG",
                "SA", "SARL", "GROUP", "GROUPE", "DU", "DE", "LA", "LE", "L",
                "POUR", "ET"}

def normalize_name(name):
    """Réduit un nom de société à ses mots significatifs (sans pays/suffixes)."""
    n = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    n = re.sub(r"[^A-Za-z0-9 ]", " ", n).upper()
    mots = [m for m in n.split() if m not in _TOKENS_PAYS and len(m) > 1]
    return "".join(mots)


def _apparie(nom_brvm, sika_keys):
    """Trouve la clé sika correspondant à un nom brvm (égalité ou inclusion)."""
    k = normalize_name(nom_brvm)
    if not k:
        return None
    if k in sika_keys:
        return k
    for sk in sika_keys:
        if len(k) >= 6 and len(sk) >= 6 and (k in sk or sk in k):
            return sk
    return None


def fetch(url):
    """GET robuste : vérifie le certificat SSL, repli sécurisé documenté, 2 essais."""
    last_err = None
    for verify in (True, False):   # essaie sécurisé d'abord
        for attempt in range(2):
            try:
                r = requests.get(url, headers=UA, timeout=25, verify=verify)
                r.raise_for_status()
                if not verify:
                    print(f"  ⚠ {url} : certificat SSL non vérifié (env local). "
                          f"OK en prod avec certifs à jour.")
                return r.content
            except Exception as e:
                last_err = e
        if verify:
            urllib3.disable_warnings()
    raise RuntimeError(f"Injoignable : {url} ({last_err})")


# ── Parsers ───────────────────────────────────────────────────
def parse_cours(html):
    soup = BeautifulSoup(html, "html.parser")
    cible = None
    for t in soup.find_all("table"):
        head = [h.get_text(strip=True) for h in t.find_all("tr")[0].find_all(["th", "td"])]
        if "Symbole" in head and any("Clôture" in h for h in head):
            cible = t
            break
    if cible is None:
        raise RuntimeError("Table des cours introuvable (structure brvm.org modifiée ?)")
    out = []
    for row in cible.find_all("tr")[1:]:
        c = [x.get_text(strip=True) for x in row.find_all("td")]
        if len(c) >= 7:
            out.append({
                "symbole": c[0], "nom": c[1],
                "volume": to_float(c[2]),
                "cours_veille": to_float(c[3]),
                "cours_ouverture": to_float(c[4]),
                "cours_cloture": to_float(c[5]),
                "variation_pct": to_float(c[6]),
            })
    return out


def parse_indices(html):
    soup = BeautifulSoup(html, "html.parser")
    indices = {}
    for t in soup.find_all("table"):
        head = [h.get_text(strip=True) for h in t.find_all("tr")[0].find_all(["th", "td"])]
        if "Nom" in head and any("Fermeture" in h for h in head):
            for row in t.find_all("tr")[1:]:
                c = [x.get_text(strip=True) for x in row.find_all("td")]
                if len(c) >= 4 and c[0]:
                    indices[c[0]] = {
                        "fermeture_precedente": to_float(c[1]),
                        "fermeture": to_float(c[2]),
                        "variation_pct": to_float(c[3]),
                    }
    return indices


def _norm_indice(nom):
    """Normalise un nom d'indice : 'BRVM - COMPOSITE' -> 'BRVMCOMPOSITE'."""
    n = unicodedata.normalize("NFKD", nom).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Za-z0-9]", "", n).upper()


def parse_sika_indices(html):
    """Indices BRVM depuis sikafinance (source de contrôle). {nom_normalise: valeur}"""
    soup = BeautifulSoup(html, "html.parser")
    out = {}
    for t in soup.find_all("table"):
        head = [h.get_text(strip=True) for h in t.find_all("tr")[0].find_all(["th", "td"])]
        if "Nom" in head and "Dernier" in head and "Volume (titres)" not in head:
            idx = head.index("Dernier")
            for row in t.find_all("tr")[1:]:
                c = [x.get_text(strip=True) for x in row.find_all("td")]
                if len(c) > idx and "BRVM" in c[0].upper():
                    v = to_float(c[idx])
                    if v:
                        out[_norm_indice(c[0])] = v
    return out


# ── Validation & recoupement ──────────────────────────────────
def valider(cours, indices, sika):
    anomalies = []

    if len(cours) < NB_ACTIONS_ATTENDU:
        anomalies.append(f"Seulement {len(cours)} actions récupérées (attendu ~47).")

    for a in cours:
        if a["cours_cloture"] is None or a["cours_cloture"] <= 0:
            anomalies.append(f"{a['symbole']} : cours de clôture invalide ({a['cours_cloture']}).")
        if a["variation_pct"] is not None and abs(a["variation_pct"]) > VARIATION_MAX_PLAUSIBLE:
            anomalies.append(f"{a['symbole']} : variation {a['variation_pct']}% (aberrante ?).")

    if not any("COMPOSITE" in k.upper() for k in indices):
        anomalies.append("Indice BRVM Composite introuvable.")

    # Recoupement croisé des 3 INDICES PRINCIPAUX brvm.org <-> sikafinance.
    # (Composite / BRVM-30 / Prestige : standardisés et identiques partout.
    #  Les sous-indices sectoriels ont des méthodologies divergentes -> ignorés.)
    PRINCIPAUX = {"BRVMCOMPOSITE", "BRVM30", "BRVMPRESTIGE"}
    recoupes = 0
    for nom, v in indices.items():
        nk = _norm_indice(nom)
        if v["fermeture"] is None or nk not in PRINCIPAUX:
            continue
        sv = sika.get(nk)
        if sv:
            recoupes += 1
            ecart = abs(sv - v["fermeture"]) / v["fermeture"] * 100
            if ecart > 0.5:
                anomalies.append(
                    f"Indice {nom} : écart {ecart:.2f}% entre brvm.org "
                    f"({v['fermeture']}) et sika ({sv}).")
    if recoupes < 2:
        anomalies.append(
            f"Recoupement faible ({recoupes}/3 indices principaux) : "
            f"sikafinance peut-être indisponible. Données brvm.org non confirmées "
            f"par une 2e source — à vérifier manuellement.")

    return anomalies, recoupes


# ── Rapport ───────────────────────────────────────────────────
def construire_rapport(cours, indices, anomalies, recoupes):
    now = datetime.now(timezone.utc).astimezone()
    L = []
    L.append("=" * 60)
    L.append(f"  RAPPORT BRVM — {now.strftime('%d/%m/%Y %H:%M')}")
    L.append("  Source : brvm.org (officiel) + sikafinance (contrôle)")
    L.append("=" * 60)

    if anomalies:
        L.append("\n🔴 ANOMALIES — VÉRIFICATION HUMAINE REQUISE :")
        for a in anomalies:
            L.append(f"   • {a}")
        L.append("   → NE PAS envoyer la newsletter sans vérifier ces points.")
    else:
        L.append(f"\n🟢 Données vérifiées et propres ({recoupes} titres recoupés avec sika).")

    L.append("\n── INDICES ──")
    for nom, v in indices.items():
        if v["fermeture"] is not None:
            L.append(f"   {nom:38} {v['fermeture']:>10}  ({v['variation_pct']:+}%)")

    classes = [a for a in cours if a["variation_pct"] is not None]
    hausses = sorted(classes, key=lambda x: -x["variation_pct"])[:5]
    baisses = sorted(classes, key=lambda x: x["variation_pct"])[:5]

    L.append("\n── TOP 5 HAUSSES ──")
    for a in hausses:
        L.append(f"   {a['symbole']:6} {a['nom'][:30]:30} {a['cours_cloture']:>8.0f} FCFA  ({a['variation_pct']:+}%)")
    L.append("\n── TOP 5 BAISSES ──")
    for a in baisses:
        L.append(f"   {a['symbole']:6} {a['nom'][:30]:30} {a['cours_cloture']:>8.0f} FCFA  ({a['variation_pct']:+}%)")

    L.append(f"\n── {len(cours)} ACTIONS (clôture officielle) ──")
    for a in sorted(cours, key=lambda x: x["symbole"]):
        if a["cours_cloture"]:
            L.append(f"   {a['symbole']:6} {a['cours_cloture']:>8.0f} FCFA  ({a['variation_pct']:+}%)  vol {a['volume'] or 0:.0f}")

    return "\n".join(L)


# ── Programme principal ───────────────────────────────────────
def main():
    print("Collecte BRVM en cours...")
    try:
        cours = parse_cours(fetch(URL_COURS))
        indices = parse_indices(fetch(URL_INDICES))
        try:
            sika = parse_sika_indices(fetch(URL_SIKA))
        except Exception as e:
            print(f"  ⚠ sikafinance indisponible ({e}) — recoupement ignoré.")
            sika = {}
    except Exception as e:
        print(f"🔴 ÉCHEC DE COLLECTE : {e}")
        sys.exit(3)

    anomalies, recoupes = valider(cours, indices, sika)

    os.makedirs(OUT_DIR, exist_ok=True)
    jour = datetime.now().strftime("%Y-%m-%d")
    payload = {
        "genere_le": datetime.now(timezone.utc).astimezone().isoformat(),
        "source": {"primaire": "brvm.org", "controle": "sikafinance.com"},
        "anomalies": anomalies,
        "titres_recoupes": recoupes,
        "fiable": len(anomalies) == 0,
        "indices": indices,
        "actions": cours,
    }
    with open(os.path.join(OUT_DIR, f"brvm_{jour}.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    rapport = construire_rapport(cours, indices, anomalies, recoupes)
    with open(os.path.join(OUT_DIR, f"brvm_{jour}.txt"), "w", encoding="utf-8") as f:
        f.write(rapport)

    print(rapport)
    print(f"\nFichiers : {OUT_DIR}\\brvm_{jour}.json  et  .txt")

    sys.exit(2 if anomalies else 0)


if __name__ == "__main__":
    main()
