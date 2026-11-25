// Métadonnées statiques BRVM — secteur, pays, label, dividende connu
// Source : BRVM.org classifications + Sikafinance (juin 2026)

export const SECTEURS = [
  'Banque',
  'Télécoms',
  'Distribution & Énergie',
  'Agro-industrie',
  'Transport',
  'Immobilier',
  'Autres',
]

export const PAYS_BRVM = ['CI', 'SN', 'BF', 'ML', 'BJ', 'TG', 'NE', 'GW']

export const PAYS_LABEL = {
  CI: "Côte d'Ivoire 🇨🇮",
  SN: 'Sénégal 🇸🇳',
  BF: 'Burkina Faso 🇧🇫',
  ML: 'Mali 🇲🇱',
  BJ: 'Bénin 🇧🇯',
  TG: 'Togo 🇹🇬',
  NE: 'Niger 🇳🇪',
  GW: 'Guinée-Bissau 🇬🇼',
}

// Labels qualitatifs
export const LABELS = {
  BLUE_CHIP: 'Blue Chip',
  HAUT_DIV: 'Haut Dividende',
  STABLE: 'Stable',
  CROISSANCE: 'Croissance',
}

export const META = {
  // Télécoms
  SNTS:  { pays: 'SN', secteur: 'Télécoms',               label: LABELS.BLUE_CHIP,  dividende: 1740 },
  ORAC:  { pays: 'CI', secteur: 'Télécoms',               label: LABELS.BLUE_CHIP,  dividende: 720  },
  ONTBF: { pays: 'BF', secteur: 'Télécoms',               label: LABELS.STABLE,     dividende: 150  },

  // Banque & Finance
  SGBC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.BLUE_CHIP,  dividende: 2062 },
  BICC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 1500 },
  SIBC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 400  },
  NSBC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 550  },
  ECOC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 600  },
  BOAB:  { pays: 'BJ', secteur: 'Banque',                 label: LABELS.HAUT_DIV,   dividende: 526  },
  BOABF: { pays: 'BF', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 200  },
  BOAC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 340  },
  BOAM:  { pays: 'ML', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 200  },
  BOAN:  { pays: 'NE', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 300  },
  BOAS:  { pays: 'SN', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 250  },
  BICB:  { pays: 'BJ', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 300  },
  CBIBF: { pays: 'BF', secteur: 'Banque',                 label: LABELS.HAUT_DIV,   dividende: 900  },
  ORGT:  { pays: 'TG', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: 120  },

  // Distribution & Énergie
  TTLC:  { pays: 'CI', secteur: 'Distribution & Énergie', label: LABELS.HAUT_DIV,   dividende: 200  },
  TTLS:  { pays: 'SN', secteur: 'Distribution & Énergie', label: LABELS.HAUT_DIV,   dividende: 180  },
  CIEC:  { pays: 'CI', secteur: 'Distribution & Énergie', label: LABELS.STABLE,     dividende: 200  },
  SDCC:  { pays: 'CI', secteur: 'Distribution & Énergie', label: LABELS.STABLE,     dividende: 400  },

  // Agro-industrie & Boissons
  PALC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.HAUT_DIV,   dividende: 502  },
  SPHC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.HAUT_DIV,   dividende: 500  },
  NTLC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.BLUE_CHIP,  dividende: 700  },
  SLBC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.HAUT_DIV,   dividende: 2000 },
  STBC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.HAUT_DIV,   dividende: 4800 },
  CABC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.STABLE,     dividende: 200  },
  UNXC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.STABLE,     dividende: null },
  SAFC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.STABLE,     dividende: null },
  SMBC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.STABLE,     dividende: null },

  // Transport & Logistique
  SDSC:  { pays: 'CI', secteur: 'Transport',              label: LABELS.STABLE,     dividende: null },
  STAC:  { pays: 'CI', secteur: 'Transport',              label: LABELS.STABLE,     dividende: null },
  CFAC:  { pays: 'CI', secteur: 'Transport',              label: LABELS.STABLE,     dividende: null },

  // Distribution & Énergie (compléments)
  SHEC:  { pays: 'CI', secteur: 'Distribution & Énergie', label: LABELS.STABLE,    dividende: null },
  SEMC:  { pays: 'CI', secteur: 'Distribution & Énergie', label: LABELS.STABLE,    dividende: null },
  SOGC:  { pays: 'CI', secteur: 'Distribution & Énergie', label: LABELS.STABLE,    dividende: null },

  // Banque (compléments)
  ABJC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: null },
  BNBC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: null },
  LNBB:  { pays: 'BJ', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: null },
  PRSC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: null },
  SCRC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.STABLE,     dividende: null },

  // Autres / Industrie
  ETIT:  { pays: 'TG', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: null },
  FTSC:  { pays: 'CI', secteur: 'Autres',                 label: LABELS.STABLE,     dividende: null },
  NEIC:  { pays: 'CI', secteur: 'Autres',                 label: LABELS.STABLE,     dividende: null },
  SICC:  { pays: 'CI', secteur: 'Agro-industrie',         label: LABELS.STABLE,     dividende: null },
  SIVC:  { pays: 'CI', secteur: 'Autres',                 label: LABELS.STABLE,     dividende: null },
}

export function getMeta(symbole) {
  return META[symbole] || { pays: '?', secteur: 'Autres', label: null, dividende: null }
}

// Titres suspendus de cotation par la BRVM.
// Source qui fait autorité : le flux /api/brvm-data?dataset=suspensions, lu chaque jour
// dans le Bulletin Officiel de la Cote (mention « SP ») par le dépôt d'automation.
// Ce socle statique (avis BRVM du 16/09/2026) sert seulement à :
//  - donner la date officielle et le motif détaillé d'une suspension que le flux confirme ;
//  - servir de repli si le flux est injoignable.
// Sucrivoire (SCRC), suspendue le 16/09/2026, recote depuis fin septembre : retirée.
// Un titre suspendu ne peut etre ni achete ni vendu : on l'affiche comme tel.
export const SUSPENSIONS = {
  SICC: { date: '2026-09-16', motif: 'Manquement aux obligations de publication : resultats du 1er trimestre et du 1er semestre 2026 non publies' },
  SEMC: { date: '2026-09-16', motif: 'Manquement aux obligations de publication : resultats du 1er trimestre et du 1er semestre 2026 non publies' },
}

// `flux` = objet { SYMBOLE: { constate_le, cours } } issu de l'API, ou null si injoignable.
// Flux disponible : seuls les titres qu'il liste sont suspendus (une suspension levée
// disparaît), enrichis de la date et du motif du socle quand on les a.
// Flux injoignable : repli sur le socle.
export function mergeSuspensions(flux) {
  if (!flux || typeof flux !== 'object') return { ...SUSPENSIONS }
  const out = {}
  for (const [sym, info] of Object.entries(flux)) {
    out[sym] = { ...info, ...(SUSPENSIONS[sym] || {}) }
  }
  return out
}
