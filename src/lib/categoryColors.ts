export const CATEGORY_COLORS: Record<string, string> = {
  banane:              '#ca8a04',
  tomate:              '#dc2626',
  pommier:             '#ea580c',
  olive:               '#84823a',
  vigne:               '#7c3aed',
  mais:                '#d97706',
  fongicide:           '#16a34a',
  insecticide:         '#b45309',
  herbicide:           '#0369a1',
  palmier:             '#92400e',
  fruits:              '#ca8a04',
  'فاكهة':             '#ca8a04',
  legumes:             '#16a34a',
  'légumes':           '#16a34a',
  'خضروات':            '#16a34a',
  'céréales':          '#d97706',
  'حبوب':              '#d97706',
  plants:              '#059669',
  'شتلات':             '#059669',
  'aliments bétail':   '#92400e',
  'أعلاف الماشية':     '#92400e',
  semences:            '#7c3aed',
  'بذور':              '#7c3aed',
  fleurs:              '#db2777',
  'زهور':              '#db2777',
  // Chemical categories
  'correcteur de carence':    '#0284c7',
  'مصحح النقص':               '#0284c7',
  'biostimulant':             '#059669',
  'محفز حيوي':                '#059669',
  'régulateur de croissance': '#7c3aed',
  'منظم نمو':                 '#7c3aed',
  'non classifié':            '#6b7280',
  'غير مصنف':                 '#6b7280',
  'acaricide':                '#be123c',
  'مبيد عناكب':                '#be123c',
  'engrais':                  '#d97706',
  'سماد':                     '#d97706',
  'nématicide':               '#78350f',
  'adjuvant':                 '#64748b',
  'stimulateur sdn':          '#10b981',
  'stimulateur sdk':          '#10b981',
  'molluscicide':             '#7e22ce',
  'insecticide / acaricide':  '#b45309',
  'مبيد حشري / عناكب':        '#b45309',
  'مبيد فطري':                '#16a34a',
  'مبيد حشري':                '#b45309',
  'مبيد أعشاب':               '#0369a1',
};

const FOREST_DEFAULT = '#2d6a4f';

export function getCategoryColor(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] ?? FOREST_DEFAULT;
}

export const PLANT_CATEGORY_LABELS: Record<string, { ar: string; fr: string; en: string }> = {
  'Fruits':          { ar: 'فاكهة',         fr: 'Fruits',          en: 'Fruits' },
  'Céréales':        { ar: 'حبوب',          fr: 'Céréales',        en: 'Cereals' },
  'Légumes':         { ar: 'خضروات',        fr: 'Légumes',         en: 'Vegetables' },
  'Plants':          { ar: 'شتلات',         fr: 'Plants',          en: 'Seedlings' },
  'Aliments bétail': { ar: 'أعلاف الماشية', fr: 'Aliments bétail', en: 'Livestock feed' },
  'Semences':        { ar: 'بذور',          fr: 'Semences',        en: 'Seeds' },
  'Fleurs':          { ar: 'زهور',          fr: 'Fleurs',          en: 'Flowers' },
  'Autre':           { ar: 'أخرى',          fr: 'Autre',           en: 'Other' },
};

export const SEED_MATERIAL_LABELS: Record<string, { ar: string; fr: string; en: string }> = {
  'Semence standard':   { ar: 'بذرة عادية',  fr: 'Semence standard',   en: 'Standard seed' },
  'Semence hybride':    { ar: 'بذرة هجينة',  fr: 'Semence hybride',    en: 'Hybrid seed' },
  'Porte-greffe':       { ar: 'أصل مطعوم',   fr: 'Porte-greffe',       en: 'Rootstock' },
  'Semence fourragère': { ar: 'بذرة علفية',  fr: 'Semence fourragère', en: 'Forage seed' },
  'Tubercule':          { ar: 'درنة',        fr: 'Tubercule',          en: 'Tuber' },
  'Plant':              { ar: 'شتلة',        fr: 'Plant',              en: 'Seedling' },
  'Autre':              { ar: 'أخرى',        fr: 'Autre',              en: 'Other' },
};

export const CHEM_CATEGORY_LABELS: Record<string, { ar: string; fr: string; en: string }> = {
  'Fongicide':                { ar: 'مبيد فطري',           fr: 'Fongicide',                en: 'Fungicide' },
  'Insecticide':              { ar: 'مبيد حشري',           fr: 'Insecticide',              en: 'Insecticide' },
  'Herbicide':                { ar: 'مبيد أعشاب',          fr: 'Herbicide',                en: 'Herbicide' },
  'Acaricide':                { ar: 'مبيد عناكب',          fr: 'Acaricide',                en: 'Acaricide' },
  'Engrais':                  { ar: 'سماد',                fr: 'Engrais',                  en: 'Fertilizer' },
  'Biostimulant':             { ar: 'محفز حيوي',           fr: 'Biostimulant',             en: 'Biostimulant' },
  'Correcteur de carence':    { ar: 'مصحح النقص',          fr: 'Correcteur de carence',    en: 'Deficiency corrector' },
  'Régulateur de croissance': { ar: 'منظم نمو',            fr: 'Régulateur de croissance', en: 'Growth regulator' },
  'Insecticide / Acaricide':  { ar: 'مبيد حشري / عناكب',  fr: 'Insecticide / Acaricide',  en: 'Insecticide / Acaricide' },
  'Non classifié':            { ar: 'غير مصنف',            fr: 'Non classifié',            en: 'Unclassified' },
};
