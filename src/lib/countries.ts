import type { Lang } from './types';

export interface CountryInfo {
  ar: string;
  fr: string;
  en: string;
  lat: number;
  lng: number;
}

// ISO2 → localized names + centroid coordinates
export const COUNTRY_INFO: Record<string, CountryInfo> = {
  DZ: { ar: 'الجزائر',               fr: 'Algérie',              en: 'Algeria',              lat: 28.0, lng: 2.65 },
  ES: { ar: 'إسبانيا',               fr: 'Espagne',              en: 'Spain',                lat: 40.46, lng: -3.75 },
  IT: { ar: 'إيطاليا',               fr: 'Italie',               en: 'Italy',                lat: 41.87, lng: 12.57 },
  CN: { ar: 'الصين',                 fr: 'Chine',                en: 'China',                lat: 35.86, lng: 104.19 },
  JO: { ar: 'الأردن',               fr: 'Jordanie',             en: 'Jordan',               lat: 30.59, lng: 36.24 },
  TR: { ar: 'تركيا',                 fr: 'Turquie',              en: 'Turkey',               lat: 38.96, lng: 35.24 },
  DE: { ar: 'ألمانيا',               fr: 'Allemagne',            en: 'Germany',              lat: 51.16, lng: 10.45 },
  PT: { ar: 'البرتغال',              fr: 'Portugal',             en: 'Portugal',             lat: 39.39, lng: -8.22 },
  SA: { ar: 'المملكة العربية السعودية', fr: 'Arabie Saoudite',    en: 'Saudi Arabia',         lat: 23.88, lng: 45.08 },
  IN: { ar: 'الهند',                 fr: 'Inde',                 en: 'India',                lat: 20.59, lng: 78.96 },
  BE: { ar: 'بلجيكا',               fr: 'Belgique',             en: 'Belgium',              lat: 50.50, lng: 4.47 },
  TH: { ar: 'تايلاند',              fr: 'Thaïlande',            en: 'Thailand',             lat: 15.87, lng: 100.99 },
  NL: { ar: 'هولندا',               fr: 'Pays-Bas',             en: 'Netherlands',          lat: 52.13, lng: 5.29 },
  HU: { ar: 'المجر',                fr: 'Hongrie',              en: 'Hungary',              lat: 47.16, lng: 19.50 },
  GB: { ar: 'المملكة المتحدة',       fr: 'Royaume-Uni',          en: 'United Kingdom',       lat: 55.38, lng: -3.44 },
  US: { ar: 'الولايات المتحدة',       fr: 'États-Unis',           en: 'United States',        lat: 37.09, lng: -95.71 },
  RU: { ar: 'روسيا',                fr: 'Russie',               en: 'Russia',               lat: 61.52, lng: 105.32 },
  JP: { ar: 'اليابان',              fr: 'Japon',                en: 'Japan',                lat: 36.20, lng: 138.25 },
  GR: { ar: 'اليونان',              fr: 'Grèce',                en: 'Greece',               lat: 39.07, lng: 21.82 },
  AU: { ar: 'أستراليا',             fr: 'Australie',            en: 'Australia',            lat: -25.27, lng: 133.78 },
  PL: { ar: 'بولندا',               fr: 'Pologne',              en: 'Poland',               lat: 51.92, lng: 19.14 },
  TN: { ar: 'تونس',                 fr: 'Tunisie',              en: 'Tunisia',              lat: 33.89, lng: 9.54 },
  AE: { ar: 'الإمارات',             fr: 'Émirats arabes unis',  en: 'UAE',                  lat: 23.42, lng: 53.85 },
  SI: { ar: 'سلوفينيا',             fr: 'Slovénie',             en: 'Slovenia',             lat: 46.15, lng: 14.99 },
  CL: { ar: 'تشيلي',               fr: 'Chili',                en: 'Chile',                lat: -35.67, lng: -71.54 },
  CY: { ar: 'قبرص',                fr: 'Chypre',               en: 'Cyprus',               lat: 35.13, lng: 33.43 },
  KR: { ar: 'كوريا الجنوبية',        fr: 'Corée du Sud',         en: 'South Korea',          lat: 35.91, lng: 127.77 },
  DK: { ar: 'الدنمارك',             fr: 'Danemark',             en: 'Denmark',              lat: 56.26, lng: 9.50 },
  EG: { ar: 'مصر',                 fr: 'Égypte',               en: 'Egypt',                lat: 26.82, lng: 30.80 },
  BG: { ar: 'بلغاريا',             fr: 'Bulgarie',             en: 'Bulgaria',             lat: 42.73, lng: 25.49 },
  IS: { ar: 'أيسلندا',             fr: 'Islande',              en: 'Iceland',              lat: 64.96, lng: -19.02 },
  MY: { ar: 'ماليزيا',             fr: 'Malaisie',             en: 'Malaysia',             lat: 4.21, lng: 108.0 },
  NO: { ar: 'النرويج',              fr: 'Norvège',              en: 'Norway',               lat: 60.47, lng: 8.47 },
  PE: { ar: 'بيرو',                fr: 'Pérou',                en: 'Peru',                 lat: -9.19, lng: -75.02 },
  AT: { ar: 'النمسا',              fr: 'Autriche',             en: 'Austria',              lat: 47.52, lng: 14.55 },
  SE: { ar: 'السويد',              fr: 'Suède',                en: 'Sweden',               lat: 60.13, lng: 18.64 },
  BR: { ar: 'البرازيل',            fr: 'Brésil',               en: 'Brazil',               lat: -14.24, lng: -51.93 },
  CR: { ar: 'كوستاريكا',           fr: 'Costa Rica',           en: 'Costa Rica',           lat: 9.75, lng: -83.75 },
  ZA: { ar: 'جنوب أفريقيا',        fr: 'Afrique du Sud',       en: 'South Africa',         lat: -30.56, lng: 22.94 },
  MA: { ar: 'المغرب',              fr: 'Maroc',                en: 'Morocco',              lat: 31.79, lng: -7.09 },
  FR: { ar: 'فرنسا',               fr: 'France',               en: 'France',               lat: 46.23, lng: 2.21 },
};

// Comprehensive normalization: raw string → ISO2 code
// Handles typos, variants, abbreviations, and mixed languages found in MADR data
const RAW_TO_ISO: Record<string, string> = {
  // Algeria
  'ALGÉRIE': 'DZ', 'ALGERIE': 'DZ', 'Algérie': 'DZ',
  // Spain
  'ESPAGNE': 'ES', 'Espagne': 'ES', 'espagne': 'ES', 'ESPEGNE': 'ES',
  // Italy
  'ITALIE': 'IT', 'Italie': 'IT', 'italie': 'IT', 'ITALIA': 'IT', 'ITALY': 'IT',
  // China
  'CHINE': 'CN', 'Chine': 'CN', 'chine': 'CN', 'CHINA': 'CN', 'Chine.': 'CN',
  // Jordan
  'JORDANIE': 'JO', 'Jordanie': 'JO', 'jordanie': 'JO',
  'JORDAN': 'JO', 'JORDONIE': 'JO', 'JOREDANIE': 'JO', 'jordanie 2': 'JO',
  // Turkey
  'TURQUIE': 'TR', 'Turquie': 'TR', 'turquie': 'TR',
  'TURKEY': 'TR', 'Turkey': 'TR', 'turkey': 'TR',
  'TURQUE': 'TR', 'TURKIE': 'TR',
  "République de Turquie": 'TR', 'REPUBLIQUE DE TURQUIE': 'TR',
  // Germany
  'ALLEMAGNE': 'DE', 'Allemagne': 'DE', 'allemagne': 'DE',
  'GERMANY': 'DE', 'ALLEMEGNE': 'DE',
  "République fédérale d'Allemagne (Union européenne)": 'DE',
  'Munster/Germany': 'DE',
  // Portugal
  'PORTUGAL': 'PT', 'Portugal': 'PT', 'portugal': 'PT',
  // Saudi Arabia
  'ARABIE SAOUDITE': 'SA', 'Arabie Saoudite': 'SA', 'Arabie saoudite': 'SA',
  'ARABIE SAOUDIA': 'SA', 'ARABIE SAOUSITE': 'SA',
  "L'Arabie Saoudite": 'SA', 'saudi arabia': 'SA', 'SAUDI ARABIA': 'SA',
  // India
  'INDE': 'IN', 'Inde': 'IN', 'inde': 'IN', 'INDIA': 'IN', 'India': 'IN', 'india': 'IN',
  // Belgium
  'BELGIQUE': 'BE', 'Belgique': 'BE',
  // Thailand
  'THAÏLANDE': 'TH', 'Thaïlande': 'TH', 'THAI': 'TH',
  // Netherlands
  'PAYS BAS': 'NL', 'Pays Bas': 'NL', 'HOLLANDE': 'NL', 'Hollande': 'NL',
  'HOLLAND': 'NL',
  // Hungary
  'HONGRIE': 'HU', 'Hongrie': 'HU', 'HUNGARY': 'HU',
  // United Kingdom
  'UK': 'GB', 'ROYAUME-UNI': 'GB', 'Royaume-Uni': 'GB', 'royaume-uni': 'GB',
  'GRANDE BRETAGNE': 'GB', 'Grande Bretagne': 'GB', 'Grande bretagne': 'GB',
  'GRAND BRETAGNE': 'GB', 'Angleterre': 'GB', 'united kingdam': 'GB',
  // USA
  'USA': 'US', 'usa': 'US', 'Etats Unis': 'US', 'Etat Unis': 'US',
  'ETATS UNIS': 'US',
  // Russia
  'RUSSIE': 'RU', 'Russie': 'RU', 'russie': 'RU',
  // Japan
  'JAPON': 'JP', 'Japon': 'JP', 'JAPAN': 'JP',
  // Greece
  'GRÈCE': 'GR', 'Grèce': 'GR', 'GRECE': 'GR', 'GREECE': 'GR',
  'Greece': 'GR', 'Gréce': 'GR',
  // Australia
  'AUSTRALIE': 'AU', 'Australie': 'AU',
  // Poland
  'POLOGNE': 'PL', 'Pologne': 'PL', 'POLONGNE': 'PL', 'Poland': 'PL',
  // Tunisia
  'TUNISIE': 'TN',
  // UAE
  'EMIRATS ARABES UNIS': 'AE', 'Emirats Arabes Unis': 'AE',
  'UNITED ARAB EMIRATE': 'AE',
  // Slovenia
  'SLOVÉNIE': 'SI', 'SLOVENIE': 'SI', "Slovénie": 'SI', 'SLOVINIE': 'SI',
  // Chile
  'CHILI': 'CL', 'Chili': 'CL',
  // Cyprus
  'CHYPRE': 'CY',
  // South Korea
  'CORÉE DU SUD': 'KR', 'Corée du Sud': 'KR',
  // Denmark
  'DANEMARK': 'DK',
  // Egypt
  'EGYPTE': 'EG', 'ÉGYPTE': 'EG', 'Égypte': 'EG',
  // Bulgaria
  'BULGARIE': 'BG', 'Bulgarie': 'BG', 'Bulgaria': 'BG',
  // Iceland
  'ISLANDE': 'IS', 'Islande': 'IS',
  // Malaysia
  'MALAISIE': 'MY',
  // Norway
  'NORVEGE': 'NO', 'NORVÈGE': 'NO',
  // Peru
  'PÉROU': 'PE', 'Pérou': 'PE',
  // Austria
  'AUTRICHE': 'AT', 'Autriche': 'AT',
  // Sweden
  'SUÈDE': 'SE', 'suède': 'SE',
  // Brazil
  'BRÉSIL': 'BR', 'brésil': 'BR',
  // Costa Rica
  'COSTA RICA': 'CR',
  // South Africa
  'AFRIQUE DU SUD': 'ZA', 'AFRIQUE DE SUD': 'ZA',
  // Morocco
  'MAROC': 'MA',
  // France
  'FRANCE': 'FR',
};

export function countryToIso(raw: string): string {
  const trimmed = raw.trim();
  return RAW_TO_ISO[trimmed] ?? trimmed.toUpperCase().slice(0, 2);
}

export function countryName(iso: string, lang: Lang): string {
  return COUNTRY_INFO[iso]?.[lang] ?? iso;
}

export function countryLabelForChart(raw: string, lang: Lang): string {
  const iso = countryToIso(raw);
  return COUNTRY_INFO[iso]?.[lang] ?? raw.trim();
}
