"""
DiaspoInvest — Agent IA BRVM
Analyse le marché, les actualités et leurs impacts sur les cours
"""

import anthropic
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", "YOUR_KEY_HERE"))

# ══════════════════════════════════════════════════════════════
# SYSTEM PROMPT — Le cerveau de l'agent
# ══════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """Tu es BRVM-Agent, un analyste financier senior spécialisé sur la 
Bourse Régionale des Valeurs Mobilières (BRVM) de l'UEMOA avec 15 ans d'expérience.

Tu as une connaissance approfondie de :
- Les 47 sociétés cotées sur la BRVM et leurs fondamentaux
- La macroéconomie de la zone UEMOA (8 pays)
- Les liens entre actualités politiques/économiques et cours boursiers
- Les ratios financiers appliqués au marché africain

=== DONNÉES DE RÉFÉRENCE OFFICIELLES (BRVM — Mai 2026) ===

INDICES :
- BRVM Composite : 421,02 pts
- BRVM 30 : 197,61 pts  
- BRVM Prestige : 164,10 pts
- Capitalisation totale : ~16 221 Mds FCFA

ACTIONS CLÉS :
- SNTS (Sonatel) : 28 500 FCFA | Div. net 1 740 FCFA | Rendement 6,11% | P/E 7,2x | ROE 30,9%
- ORAC (Orange CI) : 15 570 FCFA | Div. net 720 FCFA | Rendement 4,62% | Prestige
- SGBC (SGBCI) : 36 015 FCFA | Div. net 2 064 FCFA | Rendement 5,73% | Prestige
- ECOC (Ecobank CI) : 16 300 FCFA | Div. net 799 FCFA | Rendement 4,90% | BRVM30
- CBIBF (Coris Bank BF) : 20 700 FCFA | Div. net 810 FCFA | Rendement 3,91%
- SVOC (Vivo Energy CI) : 3 700 FCFA | Div. net 270 FCFA | Rendement 7,30%
- TTLC (Total CI) : 2 875 FCFA | Div. net 125 FCFA | Rendement 4,37%
- ONTBF (ONATEL BF) : 2 850 FCFA | Div. net 130 FCFA | Rendement 4,59%
- BOAB (BOA Bénin) : 8 950 FCFA | Div. net 526 FCFA | Rendement 5,88%
- PALC (PalmCI) : 7 690 FCFA | Div. net 397 FCFA | Rendement 5,17%

CONTEXTE MACRO UEMOA :
- Croissance PIB zone UEMOA : ~6% en 2025
- Inflation : ~3,2%
- FCFA arrimé EUR : 1 EUR = 655,957 FCFA (fixe)
- Taux directeur BCEAO : 3,5%

=== TON RÔLE ===

Pour chaque analyse tu dois :
1. Identifier l'impact DIRECT sur les cours (haussier/baissier/neutre)
2. Quantifier l'impact estimé en % et en FCFA sur les titres concernés
3. Donner un horizon temporel (court terme <1 mois, moyen 1-6 mois, long terme >6 mois)
4. Citer les titres à surveiller en priorité
5. Donner une recommandation claire pour un investisseur DCA diaspora

Tu réponds TOUJOURS avec des chiffres précis. Jamais de généralités.
Si tu manques de données en temps réel, tu utilises les dernières données connues 
avec leur date et tu le signales clairement.

Format de réponse structuré :
- Signal : HAUSSIER / BAISSIER / NEUTRE / MIXTE
- Titres impactés : liste avec % d'impact estimé
- Analyse : 3-5 paragraphes détaillés
- Action recommandée pour investisseur DCA
- Horizon : Court / Moyen / Long terme
"""

# ══════════════════════════════════════════════════════════════
# OUTILS DE COLLECTE DE DONNÉES
# ══════════════════════════════════════════════════════════════

def scrape_brvm_cours():
    """Récupère les cours actuels sur BRVM.org"""
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get("https://www.brvm.org/fr/cours-actions/0", 
                        headers=headers, timeout=15)
        soup = BeautifulSoup(r.content, "html.parser")
        
        actions = []
        table = soup.find("table")
        if table:
            for row in table.find_all("tr")[1:]:
                cols = row.find_all("td")
                if len(cols) >= 4:
                    try:
                        actions.append({
                            "code": cols[0].text.strip(),
                            "cours": cols[2].text.strip().replace("\xa0", ""),
                            "variation": cols[3].text.strip(),
                        })
                    except:
                        continue
        return actions[:20]  # Top 20
    except Exception as e:
        return []

def scrape_actualites_brvm():
    """Récupère les actualités financières africaines"""
    sources = [
        "https://www.sikafinance.com/marches/actualite",
        "https://www.agenceecofin.com/bourse",
    ]
    actualites = []
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for url in sources:
        try:
            r = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(r.content, "html.parser")
            
            # Chercher titres d'articles
            for tag in ["h2", "h3", "h1"]:
                titres = soup.find_all(tag)
                for t in titres[:5]:
                    text = t.text.strip()
                    if len(text) > 20:
                        actualites.append(text)
        except:
            continue
    
    return actualites[:10]

def get_marche_context():
    """Assemble le contexte marché complet"""
    print("   Collecte des cours BRVM...")
    cours = scrape_brvm_cours()
    
    print("   Collecte des actualités...")
    actu = scrape_actualites_brvm()
    
    context = f"""
=== DONNÉES COLLECTÉES EN TEMPS RÉEL — {datetime.now().strftime('%d/%m/%Y %H:%M')} ===

COURS ACTUELS BRVM :
"""
    if cours:
        for a in cours:
            context += f"- {a['code']} : {a['cours']} FCFA | Variation : {a['variation']}\n"
    else:
        context += "- Données cours non disponibles (utiliser données de référence)\n"
    
    context += "\nACTUALITÉS DU MARCHÉ :\n"
    if actu:
        for i, a in enumerate(actu, 1):
            context += f"{i}. {a}\n"
    else:
        context += "- Actualités non disponibles\n"
    
    return context

# ══════════════════════════════════════════════════════════════
# FONCTIONS D'ANALYSE
# ══════════════════════════════════════════════════════════════

def analyser(question: str, avec_donnees_temps_reel: bool = True) -> str:
    """
    Analyse principale — envoie la question à Claude avec tout le contexte
    """
    print(f"\n{'='*60}")
    print(f"BRVM-Agent — Analyse en cours...")
    print(f"{'='*60}")
    
    # Collecter les données temps réel si demandé
    context_marche = ""
    if avec_donnees_temps_reel:
        context_marche = get_marche_context()
    
    # Construire le message complet
    message_complet = f"""
{context_marche}

=== QUESTION / SUJET D'ANALYSE ===
{question}

Fournis une analyse complète, structurée et précise.
"""
    
    print("   Analyse IA en cours...")
    
    # Appel API Claude avec web search activé
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        system=SYSTEM_PROMPT,
        tools=[{
            "type": "web_search_20250305",
            "name": "web_search"
        }],
        messages=[{
            "role": "user",
            "content": message_complet
        }]
    )
    
    # Extraire le texte de la réponse
    result = ""
    for block in response.content:
        if hasattr(block, "text"):
            result += block.text
    
    return result

def analyse_rapide(ticker: str) -> str:
    """Analyse rapide d'un titre spécifique"""
    return analyser(f"""
Analyse complète du titre {ticker} sur la BRVM :
1. Situation actuelle du cours et tendance
2. Fondamentaux clés (P/E, rendement, ROE)
3. Actualités récentes qui impactent ce titre
4. Signal : acheter / attendre / éviter
5. Prix cible estimé à 6 mois
""")

def analyse_marche_global() -> str:
    """Analyse globale du marché BRVM"""
    return analyser("""
Analyse globale du marché BRVM aujourd'hui :
1. Performance des indices (Composite, BRVM 30, Prestige)
2. Secteurs en hausse vs en baisse
3. Actualités macro UEMOA impactant le marché
4. Top 3 opportunités du moment
5. Top 3 risques à surveiller
6. Recommandation pour un investisseur DCA diaspora cette semaine
""")

def analyse_actualite(actualite: str) -> str:
    """Analyse l'impact d'une actualité sur le marché"""
    return analyser(f"""
Actualité à analyser : "{actualite}"

Questions :
1. Quel est l'impact direct sur la BRVM ?
2. Quels titres sont concernés et comment ?
3. Impact estimé sur les cours (% et FCFA)
4. L'investisseur DCA doit-il agir ou attendre ?
5. Horizon temporel de cet impact
""")

def analyse_portefeuille(portefeuille: list) -> str:
    """Analyse un portefeuille personnalisé"""
    port_str = "\n".join([f"- {t['code']} : {t['nb']} actions @ {t['prix_achat']} FCFA" 
                          for t in portefeuille])
    return analyser(f"""
Analyse de mon portefeuille BRVM :
{port_str}

Questions :
1. Performance globale actuelle
2. Titres à renforcer vs alléger
3. Risque de concentration sectorielle
4. Dividendes attendus cette année
5. Recommandation DCA : où investir le prochain apport mensuel ?
""")

# ══════════════════════════════════════════════════════════════
# INTERFACE INTERACTIVE
# ══════════════════════════════════════════════════════════════

def menu():
    print("""
╔══════════════════════════════════════════════════════════╗
║          DiaspoInvest — BRVM-Agent IA                   ║
║     Analyse intelligente du marché africain             ║
╚══════════════════════════════════════════════════════════╝

Choisissez une analyse :

  1. Analyse globale du marché BRVM (avec données temps réel)
  2. Analyse d'un titre spécifique  (ex: SNTS, ORAC, SGBC)
  3. Impact d'une actualité sur le marché
  4. Analyse de mon portefeuille
  5. Question libre à l'agent

  0. Quitter
""")

def run():
    """Lance l'agent en mode interactif"""
    print("\n🌍 DiaspoInvest BRVM-Agent démarré...")
    print(f"📅 {datetime.now().strftime('%d/%m/%Y à %H:%M')}")
    
    while True:
        menu()
        choix = input("Votre choix : ").strip()
        
        if choix == "0":
            print("\nAu revoir ! DiaspoInvest BRVM-Agent arrêté.")
            break
        
        elif choix == "1":
            print("\n📊 Analyse globale du marché en cours...")
            result = analyse_marche_global()
            print(f"\n{'='*60}")
            print(result)
            print(f"{'='*60}")
            input("\nAppuyez sur Entrée pour continuer...")
        
        elif choix == "2":
            ticker = input("\nCode du titre (ex: SNTS) : ").strip().upper()
            if ticker:
                print(f"\n🔍 Analyse de {ticker} en cours...")
                result = analyse_rapide(ticker)
                print(f"\n{'='*60}")
                print(result)
                print(f"{'='*60}")
            input("\nAppuyez sur Entrée pour continuer...")
        
        elif choix == "3":
            actu = input("\nCollez l'actualité à analyser : ").strip()
            if actu:
                print("\n📰 Analyse de l'impact en cours...")
                result = analyse_actualite(actu)
                print(f"\n{'='*60}")
                print(result)
                print(f"{'='*60}")
            input("\nAppuyez sur Entrée pour continuer...")
        
        elif choix == "4":
            print("\nSaisissez votre portefeuille (tapez 'fin' pour terminer) :")
            portefeuille = []
            while True:
                ligne = input("Code titre (ou 'fin') : ").strip().upper()
                if ligne == "FIN" or ligne == "":
                    break
                nb = input(f"Nombre d'actions {ligne} : ").strip()
                prix = input(f"Prix d'achat moyen {ligne} (FCFA) : ").strip()
                try:
                    portefeuille.append({
                        "code": ligne,
                        "nb": int(nb),
                        "prix_achat": int(prix)
                    })
                except:
                    print("Saisie invalide, ignorée.")
            
            if portefeuille:
                print("\n💼 Analyse du portefeuille en cours...")
                result = analyse_portefeuille(portefeuille)
                print(f"\n{'='*60}")
                print(result)
                print(f"{'='*60}")
            input("\nAppuyez sur Entrée pour continuer...")
        
        elif choix == "5":
            question = input("\nVotre question pour l'agent : ").strip()
            if question:
                print("\n🤖 Traitement en cours...")
                result = analyser(question)
                print(f"\n{'='*60}")
                print(result)
                print(f"{'='*60}")
            input("\nAppuyez sur Entrée pour continuer...")
        
        else:
            print("\n❌ Choix invalide.")

# ══════════════════════════════════════════════════════════════
# USAGE EN API (pour intégration dans une app)
# ══════════════════════════════════════════════════════════════

class BRVMAgent:
    """
    Classe pour intégrer l'agent dans une application web ou mobile
    
    Usage :
        agent = BRVMAgent(api_key="votre_clé")
        result = agent.analyser("Quel est l'impact de la hausse des taux BCEAO sur les banques ?")
    """
    
    def __init__(self, api_key: str = None):
        self.client = anthropic.Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
        )
    
    def analyser(self, question: str) -> dict:
        """Retourne un dict avec l'analyse et les métadonnées"""
        try:
            result = analyser(question)
            return {
                "success": True,
                "analyse": result,
                "date": datetime.now().isoformat(),
                "source": "DiaspoInvest BRVM-Agent"
            }
        except Exception as e:
            return {
                "success": False,
                "erreur": str(e),
                "date": datetime.now().isoformat()
            }
    
    def analyse_ticker(self, ticker: str) -> dict:
        return self.analyser(f"Analyse complète du titre {ticker}")
    
    def analyse_marche(self) -> dict:
        return self.analyser("Analyse globale du marché BRVM aujourd'hui")
    
    def impact_actualite(self, actualite: str) -> dict:
        return self.analyser(f"Impact de cette actualité sur la BRVM : {actualite}")


if __name__ == "__main__":
    run()
