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
  SCRC:  { pays: 'CI', secteur: 'Banque',                 label: LABELS.STABLE,     dividende: null },

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
