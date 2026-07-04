"""
DiaspoInvest — BRVM Agent IA v2
Vrai agent avec memoire, decisions autonomes et alertes temps reel
"""

import anthropic
import os
import json
import smtplib
import schedule
import time
import threading
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ══════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════
ANTHROPIC_API_KEY  = os.environ.get("ANTHROPIC_API_KEY", "")
GMAIL_EXPEDITEUR   = "djiokapjordan@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
EMAIL_DESTINATAIRE = "djiokapjordan@gmail.com"

MEMOIRE_FILE       = "brvm_memoire.json"
HISTORIQUE_SEMAINES = 8
SEUIL_ALERTE_PCT   = 3.0

TITRES_SURVEILLES  = ["SNTS", "ETIT", "SVOC", "ORAC", "SGBC",
                      "ECOC", "BOAB", "CBIBF", "PALC", "SVOC"]

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ══════════════════════════════════════════════════════════════
# MEMOIRE — Lecture et ecriture
# ══════════════════════════════════════════════════════════════
def charger_memoire():
    """Charge l'historique des rapports precedents"""
    if os.path.exists(MEMOIRE_FILE):
        try:
            with open(MEMOIRE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {
        "rapports": [],
        "alertes": [],
        "cours_reference": {},
        "tendances": {},
        "derniere_mise_a_jour": None
    }

def sauvegarder_memoire(memoire):
    """Sauvegarde l'historique"""
    with open(MEMOIRE_FILE, 'w', encoding='utf-8') as f:
        json.dump(memoire, f, ensure_ascii=False, indent=2)

def ajouter_rapport(memoire, rapport, signal, date):
    """Ajoute un rapport a l'historique — garde 8 semaines max"""
    memoire["rapports"].append({
        "date": date,
        "signal": signal,
        "resume": rapport[:500],
        "rapport_complet": rapport
    })
    # Garder seulement les 8 derniers
    if len(memoire["rapports"]) > HISTORIQUE_SEMAINES:
        memoire["rapports"] = memoire["rapports"][-HISTORIQUE_SEMAINES:]
    sauvegarder_memoire(memoire)

def analyser_tendance(memoire):
    """Analyse la tendance sur les 4 derniers rapports"""
    rapports = memoire.get("rapports", [])
    if len(rapports) < 2:
        return "Historique insuffisant — premier rapport"

    signaux = [r.get("signal", "NEUTRE") for r in rapports[-4:]]
    nb_haussier = signaux.count("HAUSSIER")
    nb_baissier = signaux.count("BAISSIER")

    if nb_haussier >= 3:
        return f"TENDANCE HAUSSIERE sur {len(signaux)} semaines ({nb_haussier}/{len(signaux)} semaines positives)"
    elif nb_baissier >= 3:
        return f"TENDANCE BAISSIERE sur {len(signaux)} semaines ({nb_baissier}/{len(signaux)} semaines negatives)"
    else:
        return f"TENDANCE MIXTE — marche indecis ({nb_haussier} haussier, {nb_baissier} baissier)"

def construire_contexte_historique(memoire):
    """Construit le contexte des semaines precedentes pour Claude"""
    rapports = memoire.get("rapports", [])
    if not rapports:
        return "Aucun historique disponible — premier rapport."

    contexte = f"=== HISTORIQUE {len(rapports)} DERNIERES SEMAINES ===\n"
    for r in rapports[-4:]:  # 4 derniers max
        contexte += f"\n[{r['date']}] Signal: {r['signal']}\n"
        contexte += f"Resume: {r['resume'][:200]}\n"

    contexte += f"\nTENDANCE CALCULEE: {analyser_tendance(memoire)}\n"
    return contexte

# ══════════════════════════════════════════════════════════════
# DETECTION ALERTES — Variations importantes
# ══════════════════════════════════════════════════════════════
def detecter_variations(memoire, cours_actuels):
    """Detecte les variations superieures au seuil"""
    alertes = []
    cours_ref = memoire.get("cours_reference", {})

    for titre, cours in cours_actuels.items():
        if titre in cours_ref and cours_ref[titre] > 0:
            variation = ((cours - cours_ref[titre]) / cours_ref[titre]) * 100
            if abs(variation) >= SEUIL_ALERTE_PCT:
                direction = "HAUSSE" if variation > 0 else "BAISSE"
                alertes.append({
                    "titre": titre,
                    "cours_actuel": cours,
                    "cours_reference": cours_ref[titre],
                    "variation": round(variation, 2),
                    "direction": direction,
                    "date": datetime.now().strftime("%d/%m/%Y %H:%M")
                })

    return alertes

def mettre_a_jour_cours_reference(memoire, cours_actuels):
    """Met a jour les cours de reference"""
    memoire["cours_reference"].update(cours_actuels)
    memoire["derniere_mise_a_jour"] = datetime.now().strftime("%d/%m/%Y %H:%M")
    sauvegarder_memoire(memoire)

# ══════════════════════════════════════════════════════════════
# GENERATION RAPPORTS ET ALERTES
# ══════════════════════════════════════════════════════════════
def generer_rapport_avec_memoire(memoire):
    """Genere le rapport hebdomadaire en tenant compte de l'historique"""
    print(f"\n[{datetime.now().strftime('%d/%m/%Y %H:%M')}] Generation rapport avec memoire...")

    contexte_historique = construire_contexte_historique(memoire)
    tendance = analyser_tendance(memoire)
    date_str = datetime.now().strftime("%d/%m/%Y")

    question = f"""
Tu es Jordan, fondateur de DiaspoInvest — etudiant en finance a Paris, investisseur BRVM.
Tu ecris la newsletter hebdomadaire DiaspoInvest du {date_str}.

CONTEXTE HISTORIQUE :
{contexte_historique}

REGLES ABSOLUES DE TON ET STYLE :
1. Parle directement au lecteur — "toi", jamais "les investisseurs"
2. Commence chaque bloc par une phrase narrative humaine
3. Un seul chiffre technique par bloc — pas de liste de 10 indicateurs
4. Explique chaque terme technique en une phrase simple juste apres
5. UN TITRE NE PEUT PAS APPARAITRE DANS DEUX BLOCS DIFFERENTS
6. Si donnees contradictoires → ecrire "donnees non confirmees cette semaine"
7. Jamais de bloc vide — toujours une phrase de fallback
8. Chaque bloc fait la meme longueur — 3 a 5 lignes maximum

FORMAT STRICT — 5 blocs narratifs dans cet ordre exact :

— Signal Global —
Commence par une observation narrative sur le marche cette semaine.
Puis : Signal de la semaine : HAUSSIER / BAISSIER / NEUTRE (un seul mot)
Puis : Tendance des 4 dernieres semaines : {tendance}
Maximum 4 lignes.

— Marche en Chiffres —
Cherche sur internet les vrais indices BRVM de cette semaine.
3 puces uniquement : BRVM Composite | BRVM 30 | Performance depuis janvier
Une ligne de source avec la date.
Maximum 5 lignes.

— Mouvement de la Semaine —
Cherche sur internet LE titre qui a le plus bouge cette semaine sur la BRVM.
Cite son cours, sa variation en %, et explique POURQUOI en une phrase simple.
Dis si ce titre est ou non dans le portefeuille recommande DiaspoInvest.
Termine par ce que ca revele sur le marche en general.
REGLE : ce titre ne peut pas reapparaitre dans le bloc DCA.
Maximum 5 lignes.

— Opportunite DCA —
Commence par "Cette semaine comme chaque semaine :" ou "Cette semaine je regarde de pres :"
Cite 1 seul titre different du mouvement de la semaine.
Cours actuel | Dividende net | Rendement en %
Calcul exact : 50 000 FCFA = X actions + Y FCFA reportes
Pourquoi ce titre cette semaine en 1 phrase liee a l actualite.
Maximum 5 lignes.

— Pour la Diaspora —
Equivalent en euros : 50 000 FCFA = XX euros depuis Paris
1 risque concret a surveiller cette semaine en 1 phrase
Termine par UNE question engageante pour que le lecteur reponde
Puis : "A vendredi prochain."
Puis signature : "Jordan\nFondateur de DiaspoInvest"
Maximum 5 lignes.

IMPORTANT : Cherche les vraies donnees sur internet avant d ecrire.
Si une donnee est introuvable → utilise les donnees de reference mai 2026 et indique-le.
"""

    try:
        print("  Recherche donnees temps reel...")
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            system="""Tu es Jordan, fondateur de DiaspoInvest.
Tu ecris une newsletter finance pour la diaspora africaine en Europe.
Ta voix : etudiant qui apprend et partage, pas expert qui donne des lecons.
Ton style : phrases courtes, langage simple, chiffres concrets, humain.

Donnees reference Mai 2026 :
SNTS 28500 FCFA div 1740 FCFA rdt 6.11% | ORAC 15570 FCFA div 720 FCFA rdt 4.62%
SGBC 36015 FCFA div 2064 FCFA rdt 5.73% | ETIT 29 FCFA | SVOC 3700 FCFA rdt 7.3%
ECOC 16300 FCFA | BOAB 8950 FCFA rdt 5.88% | BRVM Composite 421.02 | BRVM30 197.61
Performance BRVM depuis janvier 2026 : +19.35% | Taux BCEAO 3%

REGLES ABSOLUES :
- 1 titre = 1 bloc. Jamais de doublon entre blocs.
- Jamais de section vide. Fallback obligatoire.
- Toujours indiquer si donnee = temps reel ou reference mai 2026.
- Chaque explication technique suivie d une phrase en langage simple.""",
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": question}]
        )

        rapport = ""
        for block in response.content:
            if hasattr(block, "text"):
                rapport += block.text

        # Extraire le signal pour la memoire
        signal = "NEUTRE"
        if "HAUSSIER" in rapport.upper(): signal = "HAUSSIER"
        elif "BAISSIER" in rapport.upper(): signal = "BAISSIER"

        # Sauvegarder dans la memoire
        ajouter_rapport(memoire, rapport, signal, date_str)
        print(f"  Rapport genere. Signal: {signal}. Memoire mise a jour.")
        return rapport, signal

    except Exception as e:
        print(f"  Erreur: {e}")
        return None, "NEUTRE"

def generer_alerte_email(alerte, memoire):
    """Genere un email d'alerte pour une variation importante"""
    titre    = alerte["titre"]
    var      = alerte["variation"]
    direction = alerte["direction"]
    cours    = alerte["cours_actuel"]
    tendance = analyser_tendance(memoire)

    question = f"""
ALERTE URGENTE DiaspoInvest :
Titre : {titre}
Variation : {var:+.1f}% aujourd'hui
Direction : {direction}
Cours actuel : {cours} FCFA
Tendance historique : {tendance}

En 5 phrases maximum :
1. Pourquoi cette variation aujourd'hui (cherche l'actualite)
2. Est-ce une opportunite ou un risque ?
3. Que doit faire un investisseur DCA avec 50 000 FCFA/mois ?
4. Horizon : court terme ou long terme ?
5. Lien avec la tendance des 4 dernieres semaines.
"""
    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system="Tu es BRVM-Agent DiaspoInvest. Analyse concise et actionnable. Maximum 5 phrases.",
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": question}]
        )
        analyse = ""
        for block in response.content:
            if hasattr(block, "text"):
                analyse += block.text
        return analyse
    except:
        return f"{titre} a varie de {var:+.1f}% aujourd'hui. Surveiller l'evolution."

# ══════════════════════════════════════════════════════════════
# FORMATEUR HTML
# ══════════════════════════════════════════════════════════════
def formater_html_rapport(contenu, titre_email, tendance=""):
    import re as _re
    date_str = datetime.now().strftime("%d/%m/%Y")

    lines = contenu.split("\n")
    html_parts = []
    table_header = []
    table_rows = []
    in_table = False
    list_items = []
    in_list = False

    def flush_table():
        if not table_rows and not table_header: return ""
        out = '<table>'
        if table_header:
            out += '<tr>' + ''.join(f'<th>{c}</th>' for c in table_header) + '</tr>'
        for row in table_rows:
            out += '<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>'
        out += '</table>'
        return out

    def flush_list():
        if not list_items: return ""
        return '<ul>' + ''.join(f'<li>{i}</li>' for i in list_items) + '</ul>'

    def fmt(text):
        text = _re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = text.replace('HAUSSIER', '<span style="color:#1A6B4A;font-weight:700">▲ HAUSSIER</span>')
        text = text.replace('BAISSIER', '<span style="color:#C00000;font-weight:700">▼ BAISSIER</span>')
        text = text.replace('NEUTRE',   '<span style="color:#C9A84C;font-weight:700">● NEUTRE</span>')
        return text

    for line in lines:
        s = line.strip()
        if s.startswith('|') and s.endswith('|'):
            cells = [c.strip() for c in s.split('|') if c.strip()]
            if all(set(c) <= set('-: ') for c in cells):
                in_table = True; continue
            if not in_table: table_header = cells; in_table = True
            else: table_rows.append(cells)
            continue
        else:
            if in_table:
                html_parts.append(flush_table())
                table_header = []; table_rows = []; in_table = False
        if s.startswith('- ') or s.startswith('* '):
            if not in_list: list_items = []
            list_items.append(fmt(s[2:])); in_list = True; continue
        else:
            if in_list:
                html_parts.append(flush_list())
                list_items = []; in_list = False
        if s.startswith('## '): html_parts.append(f'<h2>{fmt(s[3:])}</h2>')
        elif s.startswith('# '): html_parts.append(f'<h2>{fmt(s[2:])}</h2>')
        elif s in ('#','---'): html_parts.append('<hr>')
        elif s == '': html_parts.append('')
        else: html_parts.append(f'<p>{fmt(s)}</p>')

    if in_table: html_parts.append(flush_table())
    if in_list:  html_parts.append(flush_list())
    body = '\n'.join(html_parts)

    tendance_html = f'<div style="background:#f0f7f4;border-left:3px solid #1A6B4A;padding:10px 16px;margin-bottom:20px;font-size:13px;color:#1A6B4A;"><strong>Tendance 4 semaines :</strong> {tendance}</div>' if tendance else ''

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{{margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.7}}
.wrap{{max-width:640px;margin:0 auto;background:white}}
.hdr{{background:#0D3B2E;padding:32px 40px 24px;text-align:center}}
.hdr h1{{font-size:26px;font-weight:900;color:#C9A84C;letter-spacing:3px;margin:0}}
.hdr p{{color:rgba(255,255,255,0.55);font-size:13px;margin:6px 0 0}}
.badge{{display:inline-block;background:#C9A84C;color:#0D3B2E;font-size:12px;font-weight:700;padding:5px 18px;border-radius:100px;margin-top:12px}}
.body{{padding:32px 40px}}
h2{{font-size:15px;font-weight:700;color:#0D3B2E;border-left:3px solid #C9A84C;padding-left:10px;margin:28px 0 10px}}
p{{margin:6px 0;color:#333;font-size:14px}}
ul{{margin:8px 0;padding-left:18px}}
li{{margin-bottom:5px;color:#333;font-size:14px}}
hr{{border:none;border-top:1px solid #eee;margin:20px 0}}
table{{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}}
th{{background:#0D3B2E;color:#C9A84C;padding:9px 12px;text-align:left;font-weight:600}}
td{{padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#333}}
tr:nth-child(even) td{{background:#f9f9f9}}
.note{{background:#f9f5e7;border-left:3px solid #C9A84C;padding:12px 16px;margin:24px 0 0;font-size:12px;color:#7B5800;border-radius:0 4px 4px 0}}
.ftr{{background:#0D3B2E;padding:18px 40px;text-align:center}}
.ftr p{{color:rgba(255,255,255,0.35);font-size:11px;margin:2px 0}}
</style></head>
<body><div class="wrap">
<div class="hdr">
  <h1>DiaspoInvest</h1>
  <p>{titre_email}</p>
  <div class="badge">Semaine du {date_str}</div>
</div>
<div class="body">
  {tendance_html}
  {body}
  <div class="note">Rapport educatif uniquement. Sources : BRVM.org | SikaFinance.com | DiaspoInvest.</div>
</div>
<div class="ftr">
  <p>DiaspoInvest — BRVM-Agent IA v2</p>
  <p>Genere le {datetime.now().strftime("%d/%m/%Y a %H:%M")}</p>
</div>
</div></body></html>"""

# ══════════════════════════════════════════════════════════════
# ENVOI EMAILS
# ══════════════════════════════════════════════════════════════
def envoyer_email(sujet, contenu_texte, contenu_html):
    """Envoie un email avec version texte et HTML"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = sujet
        msg["From"]    = GMAIL_EXPEDITEUR
        msg["To"]      = EMAIL_DESTINATAIRE
        msg.attach(MIMEText(contenu_texte, "plain", "utf-8"))
        msg.attach(MIMEText(contenu_html,  "html",  "utf-8"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_EXPEDITEUR, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_EXPEDITEUR, EMAIL_DESTINATAIRE, msg.as_string())
        print(f"  Email envoye : {sujet}")
        return True
    except Exception as e:
        print(f"  ERREUR EMAIL : {e}")
        return False

# ══════════════════════════════════════════════════════════════
# TACHES PLANIFIEES
# ══════════════════════════════════════════════════════════════
def tache_rapport_hebdomadaire():
    """Rapport complet chaque vendredi 20h et lundi 9h"""
    print(f"\n{'='*60}")
    print(f"  RAPPORT HEBDOMADAIRE — {datetime.now().strftime('%A %d/%m/%Y %H:%M')}")
    print(f"{'='*60}")

    memoire  = charger_memoire()
    tendance = analyser_tendance(memoire)
    rapport, signal = generer_rapport_avec_memoire(memoire)

    if rapport:
        sujet = f"DiaspoInvest — Rapport BRVM {datetime.now().strftime('%d/%m/%Y')} | Signal: {signal}"
        html  = formater_html_rapport(rapport, "Rapport Hebdomadaire BRVM", tendance)
        envoyer_email(sujet, rapport, html)
        print(f"  Rapport envoye. Signal: {signal} | Tendance: {tendance}")
    else:
        print("  Erreur generation rapport.")

def tache_surveillance_marche():
    """Surveillance toutes les 2h en jours ouvres 9h-16h"""
    now = datetime.now()
    # Jours ouvres uniquement (lundi=0 a vendredi=4)
    if now.weekday() > 4:
        return
    # Heures de marche uniquement
    if now.hour < 9 or now.hour > 16:
        return

    print(f"\n[{now.strftime('%H:%M')}] Surveillance marche...")
    memoire = charger_memoire()

    # Chercher les cours actuels via Claude
    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system="Reponds uniquement en JSON valide. Pas de texte autour.",
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": f"""Cherche les cours actuels sur la BRVM pour ces titres : {', '.join(TITRES_SURVEILLES)}.
Reponds UNIQUEMENT en JSON : {{"SNTS": 28500, "ORAC": 15570, "SGBC": 36015, "ETIT": 29, "SVOC": 3700, "ECOC": 16300, "BOAB": 8950}}
Remplace les valeurs par les cours reels trouves. Si un cours est introuvable garde la valeur de reference."""}]
        )

        cours_text = ""
        for block in response.content:
            if hasattr(block, "text"):
                cours_text += block.text

        # Parser le JSON
        import re
        json_match = re.search(r'\{[^}]+\}', cours_text)
        if json_match:
            cours_actuels = json.loads(json_match.group())

            # Detecter les variations importantes
            alertes = detecter_variations(memoire, cours_actuels)
            mettre_a_jour_cours_reference(memoire, cours_actuels)

            if alertes:
                print(f"  {len(alertes)} alerte(s) detectee(s) !")
                for alerte in alertes:
                    print(f"  ALERTE : {alerte['titre']} {alerte['variation']:+.1f}%")
                    analyse = generer_alerte_email(alerte, memoire)
                    sujet = f"ALERTE DiaspoInvest — {alerte['titre']} {alerte['variation']:+.1f}% | {alerte['direction']}"
                    html  = formater_html_rapport(analyse, f"Alerte {alerte['titre']}")
                    envoyer_email(sujet, analyse, html)

                    # Sauvegarder l'alerte
                    memoire["alertes"].append({
                        "date": now.strftime("%d/%m/%Y %H:%M"),
                        "titre": alerte["titre"],
                        "variation": alerte["variation"]
                    })
                    sauvegarder_memoire(memoire)
            else:
                print(f"  Aucune variation > {SEUIL_ALERTE_PCT}%. Marche calme.")
        else:
            print("  Impossible de parser les cours.")

    except Exception as e:
        print(f"  Erreur surveillance: {e}")

# ══════════════════════════════════════════════════════════════
# INTERFACE INTERACTIVE
# ══════════════════════════════════════════════════════════════
def afficher_memoire():
    """Affiche l'historique et les statistiques"""
    memoire = charger_memoire()
    rapports = memoire.get("rapports", [])
    alertes  = memoire.get("alertes",  [])

    print(f"\n{'='*50}")
    print(f"  MEMOIRE DIASPOIVNEST — {len(rapports)} rapports")
    print(f"{'='*50}")

    if rapports:
        print(f"\nDerniers rapports :")
        for r in rapports[-4:]:
            print(f"  {r['date']} | Signal: {r['signal']}")

    print(f"\nTendance : {analyser_tendance(memoire)}")

    if alertes:
        print(f"\nDernieres alertes ({len(alertes)}) :")
        for a in alertes[-5:]:
            print(f"  {a['date']} | {a['titre']} {a['variation']:+.1f}%")

    ref = memoire.get("cours_reference", {})
    if ref:
        print(f"\nDerniers cours enregistres :")
        for titre, cours in list(ref.items())[:5]:
            print(f"  {titre} : {cours:,} FCFA")

def menu():
    print(f"""
╔══════════════════════════════════════════════════════════╗
║      DiaspoInvest — BRVM-Agent IA v2                    ║
║      Avec memoire, tendances et alertes temps reel      ║
╚══════════════════════════════════════════════════════════╝

  R — Rapport hebdomadaire maintenant
  S — Surveillance marche maintenant
  M — Voir la memoire et l'historique
  0 — Quitter
""")

# ══════════════════════════════════════════════════════════════
# LANCEMENT
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n" + "="*60)
    print("  DiaspoInvest — BRVM-Agent IA v2")
    print("  Memoire | Tendances | Alertes temps reel")
    print("="*60)
    print(f"\n  Email      : {EMAIL_DESTINATAIRE}")
    print(f"  Titres     : {', '.join(TITRES_SURVEILLES[:5])}...")
    print(f"  Seuil      : {SEUIL_ALERTE_PCT}% de variation")
    print(f"  Surveillance : toutes les 2h (jours ouvres 9h-16h)")
    print(f"  Rapport    : Vendredi 20h + Lundi 09h")

    # Charger la memoire existante
    memoire = charger_memoire()
    nb = len(memoire.get("rapports", []))
    print(f"\n  Memoire : {nb} rapport(s) en historique")
    if nb > 0:
        print(f"  Tendance actuelle : {analyser_tendance(memoire)}")

    # Planification
    schedule.every().friday.at("20:00").do(tache_rapport_hebdomadaire)
    schedule.every().monday.at("09:00").do(tache_rapport_hebdomadaire)
    schedule.every(2).hours.do(tache_surveillance_marche)

    print(f"\n  Agent actif. Commandes :")
    print(f"  R = Rapport | S = Surveillance | M = Memoire | 0 = Quitter\n")

    def check_input():
        while True:
            try:
                cmd = input().strip().upper()
                if cmd == "0":
                    print("Agent arrete.")
                    os._exit(0)
                elif cmd == "R":
                    print("\nRapport manuel lance...")
                    tache_rapport_hebdomadaire()
                elif cmd == "S":
                    print("\nSurveillance manuelle...")
                    tache_surveillance_marche()
                elif cmd == "M":
                    afficher_memoire()
                else:
                    print("Commande inconnue. R | S | M | 0")
            except: break

    t = threading.Thread(target=check_input, daemon=True)
    t.start()

    while True:
        schedule.run_pending()
        time.sleep(30)
