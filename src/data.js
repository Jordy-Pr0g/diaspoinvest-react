// Données centralisées DiaspoInvest — source unique de vérité.
// Données BRVM factuelles (Juin 2026). Référence éducative uniquement.
// Non affilié à la BRVM ni au CREPMF.

// Liens Lemon Squeezy — checkout direct par produit.
export const LIENS = {
  guide:      "https://diaspoinvest.lemonsqueezy.com/checkout/buy/c908db0b-b753-4196-9bf5-ed01ddd4e42b",
  guideUemoa: "https://diaspoinvest.lemonsqueezy.com/checkout/buy/7855c4ed-54da-4a25-95e4-59dec1989e65",
  calculateur:"https://diaspoinvest.lemonsqueezy.com/checkout/buy/a57a680d-8503-4ca1-8e80-44906ae9a3c2",
  pack:       "https://diaspoinvest.lemonsqueezy.com/checkout/buy/3c7690d1-d8ca-426b-8745-f88bfd81e556",
  packUemoa:  "https://diaspoinvest.lemonsqueezy.com/checkout/buy/7d7196b5-9afa-4932-aa20-abd83c979223",
}

// Données BRVM — 16/06/2026 · Source : scraper brvm_scraper.py (brvm.org + sikafinance.com)
export const ACTIONS_BRVM = [
  { nom: "Sonatel (SNTS)", cours: "28 400 FCFA", dividende: "1 740 FCFA", rendement: "6,13 %" },
  { nom: "Orange CI", cours: "15 800 FCFA", dividende: "720 FCFA", rendement: "4,56 %" },
  { nom: "Vivo Energy CI", cours: "3 700 FCFA", dividende: "270 FCFA", rendement: "7,30 %" },
  { nom: "SGBCI", cours: "36 015 FCFA", dividende: "2 064 FCFA", rendement: "5,73 %" },
  { nom: "Ecobank CI", cours: "16 770 FCFA", dividende: "799 FCFA", rendement: "4,76 %" },
]

export const STATS = [
  { chiffre: "47", label: "actions BRVM analysées" },
  { chiffre: "8", label: "pays de la zone UEMOA" },
  { chiffre: "6 %", label: "de rendement dividende moyen" },
  { chiffre: "30 ans", label: "de simulation DCA" },
]

// Segment France / Europe
export const PRODUITS = [
  {
    id: "guide",
    nom: "Guide PDF Europe",
    sousTitre: "Investir depuis la France",
    prix: "14,99 €",
    lien: LIENS.guide,
    populaire: false,
    points: [
      "Comprendre la BRVM pas à pas",
      "Ouvrir un compte chez une SGI à distance",
      "Déclarer son compte en France (formulaire 3916)",
      "Fiscalité France expliquée (Flat Tax 31,4 %)",
      "Format PDF · accès immédiat",
    ],
  },
  {
    id: "pack",
    nom: "Pack Complet Europe",
    sousTitre: "Guide + Tracker Dashboard",
    prix: "29,99 €",
    lien: LIENS.pack,
    populaire: true,
    points: [
      "Le Guide PDF Diaspora Europe complet",
      "Le Tracker Dashboard (10 onglets)",
      "Simulateur DCA sur 30 ans + fiscalité France / UEMOA",
      "6 mois de mises à jour cours incluses",
      "Meilleur rapport qualité-prix",
    ],
  },
  {
    id: "calculateur",
    nom: "Tracker Dashboard",
    sousTitre: "10 onglets · Excel et Google Sheets",
    prix: "24,99 €",
    lien: LIENS.calculateur,
    populaire: false,
    points: [
      "47 actions BRVM par secteur",
      "Simulateur DCA sur 30 ans + fiscalité France / UEMOA",
      "Suivi de portefeuille personnel",
      "6 mois de mises à jour cours incluses",
    ],
  },
]

// Segment UEMOA / Afrique
export const PRODUITS_UEMOA = [
  {
    id: "guideUemoa",
    nom: "Guide PDF UEMOA",
    sousTitre: "Investir depuis la zone UEMOA",
    prix: "14,99 €",
    lien: LIENS.guideUemoa,
    populaire: false,
    points: [
      "Comprendre la BRVM et ses 47 actions",
      "Ouvrir un compte SGI dans ton pays",
      "Fiscalité UEMOA (plus-values exonérées)",
      "Stratégie DCA adaptée aux résidents",
      "Format PDF · accès immédiat",
    ],
  },
  {
    id: "trackerUemoa",
    nom: "Tracker Dashboard",
    sousTitre: "10 onglets · Excel et Google Sheets",
    prix: "24,99 €",
    lien: LIENS.calculateur,
    populaire: false,
    points: [
      "47 actions BRVM par secteur",
      "Simulateur DCA sur 30 ans avec fiscalité UEMOA",
      "Suivi de portefeuille personnel",
      "6 mois de mises à jour cours incluses",
    ],
  },
  {
    id: "packUemoa",
    nom: "Pack Complet UEMOA",
    sousTitre: "Guide UEMOA + Tracker Dashboard",
    prix: "29,99 €",
    lien: LIENS.packUemoa,
    populaire: true,
    points: [
      "Le Guide PDF Résident UEMOA complet",
      "Le Tracker Dashboard (10 onglets)",
      "Fiscalité UEMOA pays par pays",
      "6 mois de mises à jour cours incluses",
      "Meilleur rapport qualité-prix",
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
      "Beaucoup ignorent le formulaire 3916, pourtant obligatoire, avec une amende de 1 500 € par an en cas d'oubli.",
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
    q: "Et si ça ne me convient pas ?",
    r: "Satisfait ou remboursé, sans condition, pendant 14 jours. Tu envoies un email à contact@diaspoinvest.fr et tu es remboursé dans les 48 h. Aucune question posée.",
  },
  {
    q: "Je ne connais rien à la bourse, c'est fait pour moi ?",
    r: "Oui, c'est exactement pour toi. Le guide part de zéro : qu'est-ce que la BRVM, comment ouvrir un compte depuis la diaspora, quelles actions regarder en premier. Tout est expliqué en langage simple, sans jargon financier.",
  },
  {
    q: "Puis-je investir depuis la France (ou l'étranger) ?",
    r: "Oui. Certaines SGI proposent un accès 100 % digital adapté à la diaspora. Le guide t'explique les étapes d'ouverture de compte et, surtout, comment déclarer ce compte en France pour être en règle.",
  },
  {
    q: "Faut-il déclarer mon compte aux impôts français ?",
    r: "Oui, c'est obligatoire. Un compte détenu à l'étranger se déclare via le formulaire 3916, sous peine d'une amende de 1 500 € par an. Les dividendes sont imposés au PFU (Flat Tax) de 31,4 %. Le guide détaille toute la démarche.",
  },
  {
    q: "Les chiffres sont-ils à jour ?",
    r: "Les données BRVM sont récupérées automatiquement chaque jour de bourse depuis brvm.org. Les cours et rendements évoluent : vérifie toujours les informations à jour auprès de ta SGI avant toute décision.",
  },
  {
    q: "C'est un conseil en investissement ?",
    r: "Non. DiaspoInvest fournit du contenu éducatif uniquement. Rien sur ce site ne constitue un conseil en investissement personnalisé. Investir comporte un risque de perte en capital.",
  },
]

export const SLOGAN =
  "Ces chiffres ne vont pas changer parce que tu n'as pas encore ouvert ton compte."

export const DISCLAIMER =
  "Guide éducatif indépendant, non affilié à la BRVM ni au CREPMF. Ce contenu ne constitue pas un conseil en investissement. Investir comporte un risque de perte en capital."
