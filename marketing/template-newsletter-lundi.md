# Template Newsletter du Lundi — DiaspoInvest
> Process : chaque lundi matin (~20 min). Tu relèves les données (étape 1), tu donnes le prompt à Malik (étape 2), tu relis (étape 3), tu colles dans Brevo → Campagnes (étape 4).

---

## ÉTAPE 1 — Données à relever (5 min, sur sikafinance.com)

- [ ] BRVM Composite : ____ pts (variation semaine : ____%)
- [ ] Top 5 rendements dividende : action · cours · rendement (×5)
- [ ] 1-2 actualités : dividende annoncé, date de détachement, résultat publié, introduction
- [ ] (Optionnel) Taux EUR : 1 EUR = 655,957 FCFA (fixe — rappel pour les nouveaux)

## ÉTAPE 2 — Prompt à donner à Malik (Cockpit)

```
Newsletter du lundi [DATE]. Données réelles :
- BRVM Composite : [X] pts ([+/-X]% sur la semaine)
- Top 5 rendements : [Action 1 · cours · rendement%], [Action 2 ...], ...
- Actu de la semaine : [ex. Sonatel annonce un dividende de 1 500 FCFA, détachement le 22/06]
Respecte la structure du template : objet court, top 5 en tableau, signal de la semaine,
conseil actionnable, CTA doux vers le Tracker Dashboard (24,99 €).
```

## ÉTAPE 3 — Structure fixe de l'email (ce que Malik doit produire)

**Objet** (max 50 car. — curiosité > description ; un chiffre aide mais ne doit pas tout dire) :
> Ex. : « Cette action verse plus que ton Livret A depuis 15 ans »
> Ex. : « 8,2 % : le chiffre que ta banque ne te montrera jamais »
> À éviter : « Newsletter DiaspoInvest du 15/06 » (descriptif = pas ouvert)

**Pré-header** :
> Ex. : « + l'actu dividende Sonatel et le conseil de la semaine »

**Corps :**

1. **Le chiffre de la semaine** (1 phrase d'accroche)
   > « La BRVM Composite termine la semaine à 221 pts (+0,4 %). Pendant ce temps, le Livret A dort à 1,5 %. »

2. **📊 Le Top 5 par rendement dividende** (tableau)
   | Action | Cours (FCFA) | Rendement net |
   |---|---|---|
   | ... | ... | ... |

   *Terminer le tableau par une transition-hameçon (1 phrase) :*
   > Ex. : « Mais le chiffre le plus intéressant de la semaine n'est pas dans ce tableau. »

3. **📈 Le signal de la semaine** (3-4 phrases, sans jargon)
   > Une actu décryptée : ce qui s'est passé, pourquoi c'est important, ce que ça change pour un investisseur diaspora.

4. **💡 Le conseil actionnable** (2-3 phrases)
   > Un geste concret : « mets à jour ton onglet Cours Live avec ces 5 valeurs », « vérifie la date de détachement avant d'acheter », etc.

5. **CTA doux** (1 phrase + bouton)
   > « Tu veux savoir ce que 25 000 FCFA/mois deviennent en 10 ans ? Le Tracker Dashboard te le montre en 2 clics. → [Découvrir l'outil] »

6. **Signature** (fixe — humanise la marque) :
   > À lundi prochain,
   > **Jordan, fondateur DiaspoInvest** 🌍
   > *« Ce n'est pas l'argent qui manque. C'est la décision. »*

7. **Couverture juridique** (OBLIGATOIRE, tout en bas, jamais supprimée) :
   coller le **footer légal complet en petits caractères** (taille 10-11 px, gris) —
   texte intégral dans `footer-legal-newsletter.md`. Une fois mis dans le design Brevo,
   il se duplique automatiquement à chaque campagne ("Dupliquer la campagne précédente").

## ÉTAPE 4 — Envoi dans Brevo (5 min)

1. Brevo → Campagnes → "Créer une campagne email"
2. Destinataires : liste **Newsletter DiaspoInvest**
3. Expéditeur : DiaspoInvest · contact@diaspoinvest.fr
4. Coller objet + pré-header + corps (réutiliser le design de la campagne précédente : "Dupliquer")
5. **RELIRE LES CHIFFRES** (non négociable — une erreur de cours tue la crédibilité)
6. Envoyer (ou programmer lundi 7h00, heure de Paris)

---

## Règles de relecture (étape 3 bis)
- Chaque cours vérifié contre sikafinance
- Pas de promesse de gain ("pourrait", "historiquement", jamais "va rapporter")
- Toujours le disclaimer en pied
- Un seul CTA produit par email (pas de catalogue)
