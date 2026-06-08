// ─── Chemical category normalization ────────────────────────────────────────
// 261 raw variants → 13 canonical groups

const CANONICAL: Record<string, string> = {
  // Fongicide
  FONGICIDE: 'Fongicide', FONGICIDES: 'Fongicide', FONGICDE: 'Fongicide',
  FUNGICIDE: 'Fongicide', FNGICIDE: 'Fongicide',
  'FONGICIDE A USAGE AGRICOLE': 'Fongicide',
  'FONGICIDE A USAGE AGRICOL': 'Fongicide',
  'FONGICIDE BIOLOGIQUE A USAGE AGRICOLE': 'Fongicide',
  'BIO FONGICIDE': 'Fongicide',
  'FONGICIDE ANTI MILDIOU': 'Fongicide',
  'FONGICIDE(CONTRE LA POURRITURE GRISE (BOTRYTIS CINEREA)': 'Fongicide',
  'FONGICIDE PREVENTIF POUR LA LUTTE CONTRE LE MILDIOU DE LA VIGNE ET DE LA POMME DE TERRE': 'Fongicide',
  MILDIOU: 'Fongicide', OIDIUM: 'Fongicide',
  'مبيد فطري': 'Fongicide',

  // Insecticide
  INSECTICIDE: 'Insecticide', INSECTICIDES: 'Insecticide', INSECTISIDE: 'Insecticide',
  INCECTICIDE: 'Insecticide',
  'INSECTICIDE AGRICOLE': 'Insecticide',
  'INSECTICIDE MAYONNAISE': 'Insecticide',
  'INSECTICIDE MICROGRANULE': 'Insecticide',
  'BIO INSECTICIDES': 'Insecticide',
  'INSECTICIDE (FUMIGANT)': 'Insecticide',
  FUMIGANT: 'Insecticide', FUMIGATION: 'Insecticide',
  'APPAT PROTEIQUE': 'Insecticide',
  PUCERON: 'Insecticide', THRIPS: 'Insecticide', ALEURODES: 'Insecticide',
  RATICIDE: 'Insecticide',

  // Insecticide / Acaricide (dual)
  'INSECTICIDE / ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE/ ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE/ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE/ACARICIDE, FONGICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE, FONGICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE & ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE - ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE – ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE-ACARICIDE': 'Insecticide / Acaricide',
  'INSECTICIDES- ACARICIDES': 'Insecticide / Acaricide',
  'ACARICIDE / INSECTICIDE': 'Insecticide / Acaricide',
  'ACARICIDE/INSECTICIDE': 'Insecticide / Acaricide',
  'ACARICIDE, INSECTICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE, ACARICIDE, FONGICDE BIOLOGIQUE': 'Insecticide / Acaricide',
  'FONGICIDE, INSECTICIDE, ACARICIDE': 'Insecticide / Acaricide',
  'FONGICIDE, INSECTICIDE': 'Insecticide / Acaricide',
  'INSECTICIDE, ACARICIDE, FONGICIDE BIOLOGIQUE': 'Insecticide / Acaricide',

  // Acaricide
  ACARICIDE: 'Acaricide', ACARICIDES: 'Acaricide', ACARICDE: 'Acaricide', ACARIEN: 'Acaricide', ACARIENS: 'Acaricide',
  'BIO ACARICIDE': 'Acaricide', 'BIO ACARIENS': 'Acaricide',
  'ACARICIDE A USAGE AGRICOLE': 'Acaricide',
  'ACARICIDE AGRICOLE': 'Acaricide',
  'مبيد عناكبي': 'Acaricide',

  // Herbicide
  HERBICIDE: 'Herbicide', HERBICIDES: 'Herbicide',
  HEREBICIDE: 'Herbicide', HEBICIDE: 'Herbicide', HERBECIDE: 'Herbicide',
  'HERBICIDE AGRICOLE': 'Herbicide',
  'HERBICIDE SELECTIF D\'ACTIVITE': 'Herbicide',
  'HERBICIDE SYSTEMIQUE': 'Herbicide',
  'MAUVAISE HERBES DICOTYLEDONE': 'Herbicide',
  'ADJUVANT POUR BOUILLIE HERBICIDE': 'Adjuvant',

  // Correcteur de carence
  'CORRECTEUR DE CARENCE': 'Correcteur de carence',
  'CORRECTEUR DE CARENCES': 'Correcteur de carence',
  'CORRECTEUR DE CARRENCE': 'Correcteur de carence',
  'CORECTEUR DE CARRENCE': 'Correcteur de carence',
  'CORRECTEUR DE CARANC': 'Correcteur de carence',
  'CORRECTEUR DE CARANCE': 'Correcteur de carence',
  'CORRECTEUR DE CARANCES': 'Correcteur de carence',
  'CORECCTEUR DE CARRENCE': 'Correcteur de carence',
  'CORRECTEUR DE CARENCES DE CALCIUM': 'Correcteur de carence',
  'CORRECTEUR DE CARENCES DE FER': 'Correcteur de carence',
  'CORRECTEUR DE CARENCE, BIOSTIMULANT, REGULATEUR DE CARENCE, REGULATEUR DE CROISSANCE,': 'Correcteur de carence',
  'CORRECTEUR DE CARENCES, REGULATEUR DE CROISSANCE': 'Correcteur de carence',
  'CORRECTEUR DE CARENCES, REGULATEUR DE CROISSANCE, BIOSTIMULANT': 'Correcteur de carence',
  'CORRECTEUR DE CARENCE-BIOSTUMILANT-': 'Correcteur de carence',
  'CORRECTEUR': 'Correcteur de carence',
  'CORRECTEUR DE SOL': 'Correcteur de carence',
  'CORRECTEUR DE PH': 'Correcteur de carence',
  'CORRECTEURS DE SOLS SALINS': 'Correcteur de carence',
  'CORRECTEUR DE LA SALINITE DU SOL': 'Correcteur de carence',
  'CORRECTEUR DE SALINITE DU SOL': 'Correcteur de carence',
  'CHELATE DE FER': 'Correcteur de carence',
  'AZOTE+CALCIUM': 'Correcteur de carence',
  'NITRATE DE CALCIUM': 'Correcteur de carence',
  'SULPHATE D\'AMONIUM': 'Correcteur de carence',
  'ACIDE HUMIQUE ET FULVIQUE': 'Correcteur de carence',
  'EXTRAITS HUMIQUES': 'Correcteur de carence',
  'MATIERE ORGANIQUE': 'Correcteur de carence',
  'VITAMINE': 'Correcteur de carence',
  'SEL CRISTALIN': 'Correcteur de carence',
  'SOLIDE (SEL CRISTALLIN)': 'Correcteur de carence',
  'CORECTEUR': 'Correcteur de carence',
  'CORRECTEURE DE CARENCE': 'Correcteur de carence',
  '6% FE TOTAL SOLUBLE + 3.2% FER O/O EDDHA + 1.6% FER O/P EDDHA': 'Correcteur de carence',

  // Biostimulant
  BIOSTIMULANT: 'Biostimulant', BIOSTIMULANTS: 'Biostimulant',
  BIOSTUMILANT: 'Biostimulant', BIOSTUMILANTS: 'Biostimulant',
  BIOSTUMULANT: 'Biostimulant',
  'BIOSTOMULANT': 'Biostimulant', 'BIOSTIMULMANT': 'Biostimulant',
  'BIO STIMULANTS': 'Biostimulant', 'BIO STIMULANT': 'Biostimulant',
  'BIO-STIMULANT': 'Biostimulant',
  'BIOSTIMULANT AGRICOLE': 'Biostimulant',
  'BIOSTIMULANT BIOLOGIQUE': 'Biostimulant',
  'BIOSTIMULANT A BASS D\'ACIDES AMINEE': 'Biostimulant',
  'BIOSTIMULANT A BASE D\'ACIDES AMINÉES': 'Biostimulant',
  "BIOSTIMULANT A BASE D'ACIDES AMINÉES": 'Biostimulant',
  'BIOSTIMULANT A BASE D\'ALGUE': 'Biostimulant',
  'BIOSTIMULANT / REGULATEUR DE CROISSANCE': 'Biostimulant',
  'BIOSTIMULANT ET STIMULATEUR DE DEFENSE NATURELLE': 'Biostimulant',

  // Régulateur de croissance
  'REGULATEUR DE CROISSANCE': 'Régulateur de croissance',
  'REGULATEUR  DE CROISSANCE': 'Régulateur de croissance',
  'RÉGULATEUR DE CROISSANCE': 'Régulateur de croissance',
  'REGULATEURS DE CROISSANCES': 'Régulateur de croissance',
  'RÉGULATEURS DE CROISSANCES': 'Régulateur de croissance',
  'REGULATEUR DE CROISSANVE': 'Régulateur de croissance',
  REG: 'Régulateur de croissance',
  'SUBSTANCE DE CROISSANCE': 'Régulateur de croissance',
  'FERTILISANT , REGULATEUR DU SOL': 'Régulateur de croissance',

  // Engrais / Fertilisant
  ENGRAIS: 'Engrais', ENGRAI: 'Engrais',
  'ENGRAIS HYDROSOLUBLE': 'Engrais', 'ENGRAIS LIQUIDE': 'Engrais',
  'ENGRAIS SOLIDE': 'Engrais', 'ENGRAIS SOLUBLE': 'Engrais',
  'ENGRAIS BIOLOGIQUE': 'Engrais', 'ENGRAIS ORGANIQUE': 'Engrais',
  'ENGRAIS MICROGRANULES': 'Engrais', 'ENGRAI MICROGRANULE': 'Engrais',
  'ENGRAIS ORGANIQUE FERTIPURE NPK 4-3-3+1MGO': 'Engrais',
  FERTILISANT: 'Engrais', 'FERTILISANT MICROBIEN': 'Engrais',
  'NPK': 'Engrais',
  'NPK 12.12.36+OE': 'Engrais', 'NPK 13.40.13+OE': 'Engrais',
  'NPK 20.20.20+OE': 'Engrais', 'NPK 12.12.17+OE': 'Engrais',
  ORGANIQUE: 'Engrais',
  'CONDITIONNEUR DU SOL': 'Engrais', 'CONDITIONNEURS DES SOLS': 'Engrais',
  'CONDTIONNEURS DES SOLS': 'Engrais',

  // Nématicide
  NEMATICIDE: 'Nématicide', NEMATICIDES: 'Nématicide',
  'NEMATICIDE, FUNGICIDE': 'Nématicide',
  'NEMAKEY SOLARI': 'Nématicide',

  // Molluscicide
  MOLLUSCICIDE: 'Molluscicide', MOLLUSICIDE: 'Molluscicide',
  MOLLUCICIDE: 'Molluscicide', MOLLUSCIDE: 'Molluscicide',

  // Stimulateur SDN
  'STIMULATEUR DE DEFENSE NATURELLE': 'Stimulateur SDN',
  'STIMULATEUR DE DEFENSES NATURELLE': 'Stimulateur SDN',
  'STIMULATEUR DE DEFENSES NATURELLES': 'Stimulateur SDN',
  'STIMULATEUR DE DEFENSE NATUREL': 'Stimulateur SDN',
  'SIMULATEUR DE DEFENSE NATURELLE OIDIUM': 'Stimulateur SDN',

  // Adjuvant / mouillant
  ADJUVANT: 'Adjuvant', 'CO-ADJUVANT': 'Adjuvant',
  'BOOSTER-ADJUVANT': 'Adjuvant', 'BIO ADJUVANT': 'Adjuvant',
  'ADJUVANT /AGENT MOUILLANT': 'Adjuvant',
  'ACIDIFIANT': 'Adjuvant',
  REPULSIF: 'Adjuvant', 'RÉPULSIF': 'Adjuvant',
};

// Physical form codes / truly unclassified — used as category by data entry error
const PHYSICAL_FORM = new Set([
  'LIQUIDE', 'SOLIDE', 'POUDRE', 'GRANULE', 'GRANULES', 'MICROGRANULE',
  'MICRO GRANULE', 'MICRO GRANULAIRE', 'HYDROSOLUBLE',
  'LIQUIDE/GEL', 'GEL', 'NC LIQUIDE', 'LIQUIDE NC', 'GRANULES NC',
  'SUSPENSION CONCENTREE', 'SUSPENSIO CONCETREE', 'SUSPENSION CONCENTRE',
  'CAPSULE POUDRE', 'NC PATE', 'WP', 'SL', 'EC', 'SP', 'GEL',
  'OMS', 'OMS U', 'OMS U – WG', 'OMS SG', 'OMS NS', 'SG OMS',
  'N C', 'NC', 'FORCE CA+B ET FORCE FE ECO',
  '45 G/KG + 45 G/KG + 37.5 G/KG + 135 G/KG',
  "LIQUIDE (MICROÉLÉMENTS CHÉLATÉS D'EDDHA)",
  "LIQUIDE (MICROÉLÉMENTS CHELATÉS D'EDDHA)",
  'PESTICIDE', 'PESTICIDES',
  'PRODUIT PHYTOSANITAIRE', 'PRODUITS PHYTOSANITAIRES',
]);

export function normalizeChemicalCategory(raw: string | undefined | null): string {
  if (!raw) return 'Non classifié';
  const cleaned = raw.trim();
  // Direct lookup (case-insensitive)
  const upper = cleaned
    .toUpperCase()
    .replace(/'/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (PHYSICAL_FORM.has(upper)) return 'Non classifié';
  const canonical = CANONICAL[upper];
  if (canonical) return canonical;
  // Try the cleaned original-case key too (for accented chars like Régulateur)
  const origKey = cleaned.replace(/\s+/g, ' ').trim();
  const canonicalOrig = CANONICAL[origKey.toUpperCase()];
  if (canonicalOrig) return canonicalOrig;
  // Unknown
  return cleaned || 'Non classifié';
}

// ─── Plant product category normalization ────────────────────────────────────
// 90+ raw variants (mostly banana chaos) → 6 canonical groups

export function normalizePlantCategory(raw: string | undefined | null): string {
  if (!raw) return 'Autre';
  const u = raw.trim()
    .toUpperCase()
    .replace(/[''ʼʻ′`‘’]/g, "'")
    .replace(/\s+/g, ' ');

  if (!u) return 'Autre';

  // Garbage / uncategorized entries
  if (/^[.\/?…]$/.test(u) || ['NON', 'OUI', 'NC', 'NO', 'STANDARD', 'PRODUIT VEGETAL', 'PRODUITS PERISSABLE'].includes(u) ||
      /^(CATEGORI|CATÉGORI|I-PREMIUM|PREMIUM|PRUMIUM|RALSTONIA)/.test(u)) return 'Autre';

  // Fleurs — check before fruits (fraîche matches both otherwise)
  if (/FLEUR/.test(u)) return 'Fleurs';

  // Fruits — banana, Cavendish, Musa, fresh fruit
  if (/BANAN|MUSA|CAVENDISH|FRESH GREEN|MUSACE/.test(u) ||
      /^FRUIT/.test(u) || u === 'FRUIT' || u === 'FRUITS' || u === 'FRUIT FRAIS' ||
      /FRAICHES?|FRAÎCHE|FRAIS[,\s–-]/.test(u) ||
      /CONSOM/.test(u)) return 'Fruits';

  // Céréales et protéagineux
  if (/CEREAL|CÉRÉAL|MAIS|MAÏS|SOJA|GRAIN|TOURTEAUX|AMIDON/.test(u)) return 'Céréales';

  // Plants et matériel végétatif
  if (/PLANT|ARBORICOL|POMMIER|POIRIER|VITICOLE|IN.?VITRO|MICRO.BOUTURE|VIGNE|OLIVIER|ORNEMENT/.test(u)) return 'Plants';

  // Semences
  if (/SEMENCE|PETITS POIS/.test(u)) return 'Semences';

  // Aliments bétail
  if (/BETAIL|VOLAILLE|ALIMENT/.test(u)) return 'Aliments bétail';

  return 'Autre';
}

// ─── Seed / seedling material_type normalization ─────────────────────────────
// 95+ raw variants → 7 canonical groups

export function normalizeSeedMaterial(raw: string | undefined | null): string {
  if (!raw) return 'Autre';
  const u = raw.trim().toUpperCase()
    .replace(/[''ʼʻ′`'']/g, "'")
    .replace(/\s+/g, ' ');
  if (!u) return 'Autre';

  if (/ABAMECTIN|DELTAMETHRIN|DIFECONAZOLE|ACETAMIPRIDE|METALAXYL|CIFLUFENAMIDE/.test(u)) return 'Autre';
  if (['TEST', 'VOIR ANNEXE', 'BULBES A FLEURES', 'DIVERS', 'FRUIT', 'ECHANTILLONS'].includes(u)) return 'Autre';

  if (/TUBERCUL/.test(u)) return 'Tubercule';
  if (/^PLANT/.test(u) && !/SEMENCE/.test(u)) return 'Plant';
  if (/PORTE.?GREFFE|PORTE GREFFE|GREFFES?$|VITIS VINIFERA/.test(u) || ['M9', 'M09', 'GF677'].includes(u)) return 'Porte-greffe';
  if (/FOURAG|FOURRAG|LUZERNE|RHODES GRASS/.test(u)) return 'Semence fourragère';
  if (/HYBRIDE|HYBRID|HYBR|\bF1\b/.test(u)) return 'Semence hybride';
  if (/SEMENCE|SEMENCES|SEMANCE/.test(u)) return 'Semence standard';

  return 'Autre';
}

// ─── Company aggregation ──────────────────────────────────────────────────────

export interface CompanyStat {
  name: string;
  nameAr: string;
  totalLicenses: number;
  sectors: string[];
}

interface LicenseRow {
  company: string;
  companyNameAr: string;
  sector: string;
}

export function aggregateByCompany(rows: LicenseRow[]): CompanyStat[] {
  const map = new Map<string, { name: string; nameAr: string; licenses: number; sectors: Set<string> }>();

  for (const row of rows) {
    const name = row.company?.trim() ?? '';
    if (!name) continue;
    const key = name.toUpperCase();
    const entry = map.get(key);
    if (entry) {
      entry.licenses += 1;
      if (row.sector) entry.sectors.add(row.sector);
      // Prefer non-empty Arabic name
      if (!entry.nameAr && row.companyNameAr?.trim()) {
        entry.nameAr = row.companyNameAr.trim();
      }
    } else {
      map.set(key, {
        name,
        nameAr: row.companyNameAr?.trim() ?? '',
        licenses: 1,
        sectors: new Set(row.sector ? [row.sector] : []),
      });
    }
  }

  return Array.from(map.values())
    .map((c) => ({ name: c.name, nameAr: c.nameAr, totalLicenses: c.licenses, sectors: Array.from(c.sectors).sort() }))
    .sort((a, b) => b.totalLicenses - a.totalLicenses);
}
