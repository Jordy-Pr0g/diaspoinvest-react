# DiaspoInvest — Landing page

Landing page React + Vite pour **DiaspoInvest** : éduquer la diaspora africaine à investir sur la bourse africaine (BRVM, zone UEMOA).

> *« Ces chiffres ne vont pas changer parce que tu n’as pas encore ouvert ton compte. »*

## Démarrer

```bash
npm install
npm run dev      # serveur de dev (http://localhost:5173)
npm run build    # build de production -> dist/
npm run preview  # prévisualiser le build
```

## Structure

```
src/
├── main.jsx            Point d’entrée React
├── App.jsx             Assemble les sections + gère le modal
├── index.css           Design system (couleurs, typo, boutons)
├── App.css             Styles des composants
├── data.js             ⭐ Source unique : prix, liens Gumroad, données BRVM
└── components/
    ├── Navbar.jsx          Barre fixe + CTA (scroll)
    ├── Hero.jsx            Titre + 3 prix + social proof (bug mobile corrigé)
    ├── Stats.jsx           4 chiffres clés
    ├── Probleme.jsx        5 points douleur
    ├── Solution.jsx        5 cards méthode
    ├── Calculateur.jsx     Simulateur DCA interactif (apport + durée → dividende)
    ├── Avertissement.jsx   Disclaimer BRVM / CREPMF
    ├── Pricing.jsx         3 formules + compte à rebours
    ├── FAQ.jsx             Accordéon 5 questions
    ├── Footer.jsx          Mentions légales / confidentialité / contact
    ├── StickyCTA.jsx       Barre fixe (mobile uniquement)
    └── Modal.jsx           Mentions légales & confidentialité
```

## À compléter (TODO)

Les 2 liens Gumroad manquants sont centralisés dans **`src/data.js`** (objet `LIENS`) :

```js
calculateur: '#', // 🔄 À créer sur Gumroad (17,99€)
pack: '#',        // 🔄 À créer sur Gumroad (24,99€)
```

Tant qu’ils valent `'#'`, les boutons correspondants affichent automatiquement « Bientôt disponible ».

## Branding

| Rôle             | Couleur     |
|------------------|-------------|
| Vert principal   | `#0D3B2E`   |
| Vert clair       | `#1A5C45`   |
| Or               | `#C9A84C`   |
| Or clair         | `#E8C46A`   |
| Fond clair       | `#FFF8E7`   |

Polices : **Playfair Display** (titres) · **DM Sans** (corps).

## Déploiement (Vercel)

1. Pousser le dossier sur GitHub.
2. Importer le repo sur Vercel (framework détecté : **Vite**).
3. Build : `npm run build` · Output : `dist`.

---

**Avertissement :** Guide éducatif indépendant — non affilié à la BRVM ni au CREPMF. Ce contenu ne constitue pas un conseil en investissement. Investir comporte un risque de perte en capital.
