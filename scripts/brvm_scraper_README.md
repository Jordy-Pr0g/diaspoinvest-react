# brvm_scraper.py — le moteur de données fiable de DiaspoInvest

## Ce qu'il fait
Récupère les données **officielles** de la BRVM, les **vérifie**, et ne les déclare
fiables que si tous les garde-fous passent.

- **Source primaire** : `brvm.org` (la Bourse — clôture officielle)
- **Source de contrôle** : `sikafinance.com` (recoupement indépendant)
- **Sorties** (dossier `scripts/data/`) :
  - `brvm_AAAA-MM-JJ.json` — données structurées, datées, avec champ `"fiable"`
  - `brvm_AAAA-MM-JJ.txt` — rapport lisible (anomalies en tête)

## Les garde-fous (la fiabilité)
1. ~47 actions attendues — moins = alerte
2. Chaque cours doit être positif et numérique
3. Variation hebdo aberrante (>30%) = alerte à vérifier
4. **Recoupement croisé** des 3 indices principaux (Composite / BRVM-30 / Prestige)
   entre brvm.org et sikafinance — écart >0,5% = alerte
5. Si une source est injoignable → échec propre, aucune donnée douteuse produite

## Codes de sortie (pour l'automatisation)
| Code | Sens | Action de l'automate |
|------|------|----------------------|
| **0** | Données propres et recoupées | OK pour générer la newsletter / MAJ le Sheet |
| **2** | Anomalies détectées | **NE RIEN ENVOYER** — vérification humaine |
| **3** | Source injoignable | **NE RIEN ENVOYER** — réessayer plus tard |

> Règle d'or : un automate (n8n, cron) ne génère/n'envoie JAMAIS si le code ≠ 0.

## Utilisation
```bash
pip install requests beautifulsoup4
python brvm_scraper.py
```
Le rythme idéal : **vendredi soir après clôture** (données figées du week-end).

## Architecture cible (à venir)
```
brvm_scraper.py (vendredi soir, sur serveur)
   │  exit 0 + brvm_*.json
   ├─→ NEWSLETTER : JSON → Claude (Zara/Malik) → brouillon Brevo → Jordan valide → envoi
   └─→ EXCEL PREMIUM : JSON → Google Sheet (cours live toujours à jour)
```

## Reste à faire pour l'automatisation complète
1. **Hébergement/planification** : faire tourner le script automatiquement
   (GitHub Actions cron = gratuit, ou n8n, ou petit VPS). Le PC perso ne convient
   pas (éteint la nuit). Sur serveur, le certificat SSL se vérifie normalement.
2. **Brouillon newsletter** : script qui prend le JSON → appelle l'API Claude
   (prompts Zara/Malik) → crée une campagne **brouillon** dans Brevo.
3. **Alerte** : si code ≠ 0, notifier Jordan (email) au lieu de générer du contenu.
4. **Google Sheet Premium** : Apps Script qui lit le JSON et met à jour le tableau.

## Notes de maintenance
- Si brvm.org change la structure de ses tables, `parse_cours`/`parse_indices`
  lèveront une erreur claire (pas de données silencieusement fausses).
- Les sous-indices sectoriels ne sont PAS recoupés (méthodologies différentes
  entre les deux sources) — seuls les 3 indices principaux le sont.
