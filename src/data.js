// Données centralisées DiaspoInvest — source unique de vérité.
// Données BRVM factuelles (Juin 2026). Référence éducative uniquement.
// Non affilié à la BRVM ni au CREPMF.

// Liens Gumroad — TODO Jordan : compléter les 2 liens manquants.
export const LIENS = {
  guide: "https://diaspoinvest.gumroad.com/l/oxxzda",
  calculateur: "#", // À créer sur Gumroad (17,99€)
  pack: "#", // À créer sur Gumroad (24,99€)
  mobileMoney: "https://www.mychariow.com/diaspoInvest-pack",
}

// Données BRVM — Juin 2026 · Source : sikafinance.com (mise à jour manuelle)
export const ACTIONS_BRVM = [
  { nom: "Sonatel (SNTS)", cours: "28 500 FCFA", dividende: "1 740 FCFA", rendement: "6,11 %" },
  { nom: "Orange CI", cours: "15 570 FCFA", dividende: "720 FCFA", rendement: "4,62 %" },
  { nom: "Vivo Energy CI", cours: "3 700 FCFA", dividende: "270 FCFA", rendement: "7,30 %" },
  { nom: "SGBCI", cours: "36 015 FCFA", dividende: "2 064 FCFA", rendement: "5,73 %" },
  { nom: "Ecobank CI", cours: "16 300 FCFA", dividende: "799 FCFA", rendement: "4,90 %" },
]

export const STATS = [
  { chiffre: "47", label: "actions BRVM analysées" },
  { chiffre: "8", label: "pays de la zone UEMOA" },
  { chiffre: "6 %", label: "de rendement dividende moyen" },
  { chiffre: "30 ans", label: "de simulation DCA" },
]

export const PRODUITS = [
  {
    id: "guide",
    nom: "Guide PDF",
    sousTitre: "Investir en bourse africaine",
    prix: "14,99 €",
    lien: LIENS.guide,
    populaire: false,
    points: [
      "Comprendre la BRVM pas à pas",
      "Ouvrir un compte chez une SGI",
      "Déclarer son compte en France (formulaire 3916)",
      "Format PDF · accès immédiat",
    ],
  },
  {
    id: "pack",
    nom: "Pack Complet",
    sousTitre: "Guide + Calculateur Excel Excel",
    prix: "24,99 €",
    lien: LIENS.pack,
    populaire: true,
    points: [
      "Le Guide PDF complet",
      "Le Calculateur Excel Excel (10 onglets)",
      "Simulateur DCA sur 30 ans",
      "Module fiscalité France / UEMOA",
      "Meilleur rapport qualité-prix",
    ],
  },
  {
    id: "calculateur",
    nom: "Calculateur Excel Excel",
    sousTitre: "10 onglets · Excel & Google Sheets",
    prix: "17,99 €",
    lien: LIENS.calculateur,
    populaire: false,
    points: [
      "47 actions BRVM par secteur",
      "Simulateur DCA + 4 scénarios",
      "Analyse fondamentale (DCF Gordon-Shapiro)",
      "Suivi de portefeuille personnel",
    ],
  },
]

export const PROBLEMES = [
  {
    titre: "Ton épargne dort",
    texte:
      "Le Livret A plafonne autour de 1,5 % quand certaines actions BRVM versent un dividende net supérieur à 6 %.",
  },
  {
    titre: "La bourse africaine paraît inaccessible",
    texte:
      "Pas de jargon expliqué, pas de mode d'emploi clair pour ouvrir un compte depuis la France ou le continent.",
  },
  {
    titre: "La fiscalité fait peur",
    texte:
      "Beaucoup ignorent le formulaire 3916 — pourtant obligatoire, avec une amende de 1 500 € par an en cas d'oubli.",
  },
  {
    titre: "Trop d'informations contradictoires",
    texte:
      "Entre rumeurs, influenceurs et sources peu fiables, difficile de savoir par où commencer sereinement.",
  },
  {
    titre: 'Tu attends "le bon moment"',
    texte:
      "Ces chiffres ne vont pas changer parce que tu n'as pas encore ouvert ton compte.",
  },
]

export const SOLUTIONS = [
  {
    titre: "Comprendre la BRVM",
    texte: "Les bases de la bourse régionale UEMOA expliquées simplement, sans jargon inutile.",
  },
  {
    titre: "Choisir ses actions",
    texte: "47 actions analysées par secteur, avec labels Blue Chip, Stable et Haut Dividende.",
  },
  {
    titre: "Simuler avant d'investir",
    texte: "Un calculateur DCA sur 30 ans qui sépare croissance du cours et croissance du dividende.",
  },
  {
    titre: "Maîtriser la fiscalité",
    texte: "Flat Tax 31,4 %, formulaires 3916 / 2047 / 2074 et conventions fiscales expliqués.",
  },
  {
    titre: "Passer à l'action",
    texte: "Une méthode claire pour ouvrir un compte chez une SGI et lancer ton premier DCA.",
  },
]

export const FAQ_ITEMS = [
  {
    q: "C'est quoi la BRVM ?",
    r: "La BRVM (Bourse Régionale des Valeurs Mobilières) est la bourse commune aux 8 pays de la zone UEMOA. Nous la citons comme référence factuelle uniquement : DiaspoInvest est un projet éducatif indépendant, non affilié à la BRVM ni au CREPMF.",
  },
  {
    q: "Puis-je investir depuis la France ?",
    r: "Oui. Certaines SGI (sociétés de gestion et d'intermédiation) proposent un accès digital adapté à la diaspora. Le guide explique les étapes d'ouverture de compte et, surtout, comment déclarer ce compte en France.",
  },
  {
    q: "Faut-il déclarer mon compte aux impôts français ?",
    r: "Oui. Un compte détenu à l'étranger doit être déclaré via le formulaire 3916, sous peine d'une amende de 1 500 € par an. Les dividendes sont imposés au PFU (Flat Tax) de 31,4 % (12,8 % IR + 18,6 % prélèvements sociaux). Le guide détaille la marche à suivre.",
  },
  {
    q: "C'est un conseil en investissement ?",
    r: "Non. DiaspoInvest fournit du contenu éducatif uniquement. Rien sur ce site ne constitue un conseil en investissement personnalisé. Investir comporte un risque de perte en capital.",
  },
  {
    q: "Les chiffres sont-ils à jour ?",
    r: "Les données affichées datent de juin 2026 (source : sikafinance.com). Les cours et rendements évoluent : vérifie toujours les informations à jour auprès de ta SGI avant toute décision.",
  },
]

export const SLOGAN =
  "Ces chiffres ne vont pas changer parce que tu n'as pas encore ouvert ton compte."

export const DISCLAIMER =
  "Guide éducatif indépendant — non affilié à la BRVM ni au CREPMF. Ce contenu ne constitue pas un conseil en investissement. Investir comporte un risque de perte en capital."
