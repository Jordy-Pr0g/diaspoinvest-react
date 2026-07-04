# DiaspoInvest — BRVM-Agent IA

Agent IA d'analyse du marché BRVM avec données temps réel et web search.

---

## Ce que fait l'agent

- Analyse globale du marché BRVM (indices, tendances, opportunités)
- Analyse d'un titre spécifique avec fondamentaux et signal
- Impact d'une actualité sur les cours (haussier/baissier/neutre)
- Analyse de portefeuille personnalisé
- Question libre en langage naturel

---

## Installation

```bash
# 1. Installer les dépendances
pip install anthropic requests beautifulsoup4

# 2. Configurer votre clé API Anthropic
export ANTHROPIC_API_KEY="votre_clé_ici"

# 3. Lancer l'agent
python brvm_agent.py
```

---

## Obtenir votre clé API Anthropic

1. Allez sur console.anthropic.com
2. Créez un compte
3. Section "API Keys" → "Create Key"
4. Copiez la clé et collez-la dans la commande export ci-dessus

---

## Exemples d'utilisation en code

```python
from brvm_agent import BRVMAgent

agent = BRVMAgent(api_key="votre_clé")

# Analyser le marché global
result = agent.analyse_marche()
print(result["analyse"])

# Analyser un titre
result = agent.analyse_ticker("SNTS")
print(result["analyse"])

# Impact d'une actualité
result = agent.impact_actualite(
    "La BCEAO relève son taux directeur de 25 points de base"
)
print(result["analyse"])
```

---

## Structure du projet

```
brvm_agent.py     — Agent principal (tout en un fichier)
README.md         — Ce fichier
```

---

## Coût estimé

Environ 0,02$ par analyse (Claude Sonnet + web search)
Soit ~13 FCFA par analyse

---

## Sources des données

- BRVM.org — cours officiels
- SikaFinance.com — actualités marché
- AgenceEcofin.com — actualités économiques africaines
- Données de référence intégrées (rapports IFRS 2024)

---

© DiaspoInvest 2026 — @DiaspoInvest TikTok & Instagram
