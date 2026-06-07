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
  DZ: { ar: 'الجزائر',                  fr: 'Algérie',              en: 'Algeria',              lat: 28.0,   lng: 2.65   },
  ES: { ar: 'إسبانيا',                  fr: 'Espagne',              en: 'Spain',                lat: 40.46,  lng: -3.75  },
  IT: { ar: 'إيطاليا',                  fr: 'Italie',               en: 'Italy',                lat: 41.87,  lng: 12.57  },
  CN: { ar: 'الصين',                    fr: 'Chine',                en: 'China',                lat: 35.86,  lng: 104.19 },
  JO: { ar: 'الأردن',                  fr: 'Jordanie',             en: 'Jordan',               lat: 30.59,  lng: 36.24  },
  TR: { ar: 'تركيا',                    fr: 'Turquie',              en: 'Turkey',               lat: 38.96,  lng: 35.24  },
  DE: { ar: 'ألمانيا',                  fr: 'Allemagne',            en: 'Germany',              lat: 51.16,  lng: 10.45  },
  PT: { ar: 'البرتغال',                 fr: 'Portugal',             en: 'Portugal',             lat: 39.39,  lng: -8.22  },
  SA: { ar: 'المملكة العربية السعودية',  fr: 'Arabie Saoudite',      en: 'Saudi Arabia',         lat: 23.88,  lng: 45.08  },
  IN: { ar: 'الهند',                    fr: 'Inde',                 en: 'India',                lat: 20.59,  lng: 78.96  },
  BE: { ar: 'بلجيكا',                  fr: 'Belgique',             en: 'Belgium',              lat: 50.50,  lng: 4.47   },
  TH: { ar: 'تايلاند',                 fr: 'Thaïlande',            en: 'Thailand',             lat: 15.87,  lng: 100.99 },
  NL: { ar: 'هولندا',                  fr: 'Pays-Bas',             en: 'Netherlands',          lat: 52.13,  lng: 5.29   },
  HU: { ar: 'المجر',                   fr: 'Hongrie',              en: 'Hungary',              lat: 47.16,  lng: 19.50  },
  GB: { ar: 'المملكة المتحدة',          fr: 'Royaume-Uni',          en: 'United Kingdom',       lat: 55.38,  lng: -3.44  },
  US: { ar: 'الولايات المتحدة',          fr: 'États-Unis',           en: 'United States',        lat: 37.09,  lng: -95.71 },
  RU: { ar: 'روسيا',                   fr: 'Russie',               en: 'Russia',               lat: 61.52,  lng: 105.32 },
  JP: { ar: 'اليابان',                 fr: 'Japon',                en: 'Japan',                lat: 36.20,  lng: 138.25 },
  GR: { ar: 'اليونان',                 fr: 'Grèce',                en: 'Greece',               lat: 39.07,  lng: 21.82  },
  AU: { ar: 'أستراليا',                fr: 'Australie',            en: 'Australia',            lat: -25.27, lng: 133.78 },
  PL: { ar: 'بولندا',                  fr: 'Pologne',              en: 'Poland',               lat: 51.92,  lng: 19.14  },
  TN: { ar: 'تونس',                    fr: 'Tunisie',              en: 'Tunisia',              lat: 33.89,  lng: 9.54   },
  AE: { ar: 'الإمارات',                fr: 'Émirats arabes unis',  en: 'UAE',                  lat: 23.42,  lng: 53.85  },
  SI: { ar: 'سلوفينيا',                fr: 'Slovénie',             en: 'Slovenia',             lat: 46.15,  lng: 14.99  },
  CL: { ar: 'تشيلي',                  fr: 'Chili',                en: 'Chile',                lat: -35.67, lng: -71.54 },
  CY: { ar: 'قبرص',                   fr: 'Chypre',               en: 'Cyprus',               lat: 35.13,  lng: 33.43  },
  KR: { ar: 'كوريا الجنوبية',           fr: 'Corée du Sud',         en: 'South Korea',          lat: 35.91,  lng: 127.77 },
  DK: { ar: 'الدنمارك',                fr: 'Danemark',             en: 'Denmark',              lat: 56.26,  lng: 9.50   },
  EG: { ar: 'مصر',                    fr: 'Égypte',               en: 'Egypt',                lat: 26.82,  lng: 30.80  },
  BG: { ar: 'بلغاريا',                fr: 'Bulgarie',             en: 'Bulgaria',             lat: 42.73,  lng: 25.49  },
  IS: { ar: 'أيسلندا',                fr: 'Islande',              en: 'Iceland',              lat: 64.96,  lng: -19.02 },
  MY: { ar: 'ماليزيا',                fr: 'Malaisie',             en: 'Malaysia',             lat: 4.21,   lng: 108.0  },
  NO: { ar: 'النرويج',                 fr: 'Norvège',              en: 'Norway',               lat: 60.47,  lng: 8.47   },
  PE: { ar: 'بيرو',                   fr: 'Pérou',                en: 'Peru',                 lat: -9.19,  lng: -75.02 },
  AT: { ar: 'النمسا',                  fr: 'Autriche',             en: 'Austria',              lat: 47.52,  lng: 14.55  },
  SE: { ar: 'السويد',                  fr: 'Suède',                en: 'Sweden',               lat: 60.13,  lng: 18.64  },
  BR: { ar: 'البرازيل',                fr: 'Brésil',               en: 'Brazil',               lat: -14.24, lng: -51.93 },
  CR: { ar: 'كوستاريكا',               fr: 'Costa Rica',           en: 'Costa Rica',           lat: 9.75,   lng: -83.75 },
  ZA: { ar: 'جنوب أفريقيا',            fr: 'Afrique du Sud',       en: 'South Africa',         lat: -30.56, lng: 22.94  },
  MA: { ar: 'المغرب',                  fr: 'Maroc',                en: 'Morocco',              lat: 31.79,  lng: -7.09  },
  FR: { ar: 'فرنسا',                   fr: 'France',               en: 'France',               lat: 46.23,  lng: 2.21   },
  // Additional countries found in MADR data
  GT: { ar: 'غواتيمالا',               fr: 'Guatemala',            en: 'Guatemala',            lat: 15.78,  lng: -90.23 },
  CO: { ar: 'كولومبيا',                fr: 'Colombie',             en: 'Colombia',             lat: 4.57,   lng: -74.30 },
  EC: { ar: 'الإكوادور',               fr: 'Équateur',             en: 'Ecuador',              lat: -1.83,  lng: -78.18 },
  MX: { ar: 'المكسيك',                 fr: 'Mexique',              en: 'Mexico',               lat: 23.63,  lng: -102.55},
  NZ: { ar: 'نيوزيلندا',               fr: 'Nouvelle-Zélande',     en: 'New Zealand',          lat: -40.90, lng: 174.89 },
  KE: { ar: 'كينيا',                   fr: 'Kenya',                en: 'Kenya',                lat: -0.02,  lng: 37.91  },
  TZ: { ar: 'تنزانيا',                 fr: 'Tanzanie',             en: 'Tanzania',             lat: -6.37,  lng: 34.89  },
  VN: { ar: 'فيتنام',                  fr: 'Viêt Nam',             en: 'Vietnam',              lat: 14.06,  lng: 108.28 },
  RS: { ar: 'صربيا',                   fr: 'Serbie',               en: 'Serbia',               lat: 44.02,  lng: 21.01  },
  LB: { ar: 'لبنان',                   fr: 'Liban',                en: 'Lebanon',              lat: 33.85,  lng: 35.86  },
  HR: { ar: 'كرواتيا',                 fr: 'Croatie',              en: 'Croatia',              lat: 45.10,  lng: 15.20  },
  CI: { ar: 'كوت ديفوار',              fr: "Côte d'Ivoire",        en: "Côte d'Ivoire",        lat: 7.54,   lng: -5.55  },
  CM: { ar: 'الكاميرون',               fr: 'Cameroun',             en: 'Cameroon',             lat: 7.37,   lng: 12.35  },
  PA: { ar: 'بنما',                    fr: 'Panama',               en: 'Panama',               lat: 8.42,   lng: -80.11 },
  AR: { ar: 'الأرجنتين',               fr: 'Argentine',            en: 'Argentina',            lat: -38.42, lng: -63.62 },
  CH: { ar: 'سويسرا',                  fr: 'Suisse',               en: 'Switzerland',          lat: 46.82,  lng: 8.23   },
  CZ: { ar: 'التشيك',                  fr: 'Tchéquie',             en: 'Czech Republic',       lat: 49.82,  lng: 15.47  },
  RO: { ar: 'رومانيا',                 fr: 'Roumanie',             en: 'Romania',              lat: 45.94,  lng: 24.97  },
  SK: { ar: 'سلوفاكيا',                fr: 'Slovaquie',            en: 'Slovakia',             lat: 48.67,  lng: 19.70  },
  LT: { ar: 'ليتوانيا',                fr: 'Lituanie',             en: 'Lithuania',            lat: 55.17,  lng: 23.88  },
  IL: { ar: 'إسرائيل',                 fr: 'Israël',               en: 'Israel',               lat: 31.05,  lng: 34.85  },
  SG: { ar: 'سنغافورة',               fr: 'Singapour',            en: 'Singapore',            lat: 1.35,   lng: 103.82 },
  IR: { ar: 'إيران',                   fr: 'Iran',                 en: 'Iran',                 lat: 32.43,  lng: 53.69  },
  LY: { ar: 'ليبيا',                   fr: 'Libye',                en: 'Libya',                lat: 26.34,  lng: 17.23  },
  SY: { ar: 'سوريا',                   fr: 'Syrie',                en: 'Syria',                lat: 34.80,  lng: 38.99  },
  IQ: { ar: 'العراق',                  fr: 'Irak',                 en: 'Iraq',                 lat: 33.22,  lng: 43.68  },
  SD: { ar: 'السودان',                 fr: 'Soudan',               en: 'Sudan',                lat: 12.86,  lng: 30.22  },
  SN: { ar: 'السنغال',                 fr: 'Sénégal',              en: 'Senegal',              lat: 14.50,  lng: -14.45 },
  UY: { ar: 'أوروغواي',               fr: 'Uruguay',              en: 'Uruguay',              lat: -32.52, lng: -55.77 },
  ID: { ar: 'إندونيسيا',               fr: 'Indonésie',            en: 'Indonesia',            lat: -0.79,  lng: 113.92 },
  PK: { ar: 'باكستان',                 fr: 'Pakistan',             en: 'Pakistan',             lat: 30.37,  lng: 69.35  },
  TW: { ar: 'تايوان',                  fr: 'Taïwan',               en: 'Taiwan',               lat: 23.70,  lng: 120.96 },
  UA: { ar: 'أوكرانيا',                fr: 'Ukraine',              en: 'Ukraine',              lat: 48.38,  lng: 31.17  },
  GN: { ar: 'غينيا',                   fr: 'Guinée',               en: 'Guinea',               lat: 11.75,  lng: -15.10 },
  FI: { ar: 'فنلندا',                   fr: 'Finlande',             en: 'Finland',              lat: 61.92,  lng: 25.75  },
};

// ─── Raw string → ISO2 (case-sensitive exact match, then case-insensitive) ───
// Every distinct value from MADR data is listed here.
const RAW_TO_ISO: Record<string, string> = {
  // Algeria
  'ALGÉRIE': 'DZ', 'ALGERIE': 'DZ', 'Algérie': 'DZ', 'Algerie': 'DZ',
  // Spain
  'ESPAGNE': 'ES', 'Espagne': 'ES', 'espagne': 'ES', 'ESPEGNE': 'ES',
  'ESPAGNE-Union européenne': 'ES', 'ESPAGNE-UNION EUROPEENNE': 'ES',
  // Italy
  'ITALIE': 'IT', 'Italie': 'IT', 'italie': 'IT', 'ITALIA': 'IT', 'ITALY': 'IT',
  'italy': 'IT', 'itali': 'IT', 'ITALIE/CHINE': 'IT', 'AMERIQUE /ITALY': 'IT',
  'IRAN / ITALIE': 'IT',
  // China
  'CHINE': 'CN', 'Chine': 'CN', 'chine': 'CN', 'CHINA': 'CN', 'China': 'CN',
  'china': 'CN', 'Chine.': 'CN', 'ANHUI,CHINA': 'CN', 'CHINE/THAILAND': 'CN',
  'CHINE ET TANZANIA': 'CN', 'Chine, USA': 'CN', 'CHINE/INDE': 'CN',
  'Chine/Inde': 'CN', 'INDE/THAILLANDE': 'CN', 'Thaïlande/Inde': 'CN',
  'Thaïlande / Inde': 'TH', 'Thaïlande / CHINE': 'TH', 'THAILANDE, CHINE': 'TH',
  'Thaïlande-Inde-Chine': 'TH', 'THAÏLANDE + INDE': 'TH', 'Pérou / Thaïlande': 'PE',
  // Jordan
  'JORDANIE': 'JO', 'Jordanie': 'JO', 'jordanie': 'JO',
  'JORDAN': 'JO', 'JORDONIE': 'JO', 'JOREDANIE': 'JO', 'jordanie 2': 'JO',
  'JORDADIE': 'JO', 'JERDANIE': 'JO',
  // Turkey
  'TURQUIE': 'TR', 'Turquie': 'TR', 'turquie': 'TR',
  'TURKEY': 'TR', 'Turkey': 'TR', 'turkey': 'TR', 'TURKY': 'TR',
  'TURQUE': 'TR', 'TURKIE': 'TR', 'turkiye': 'TR', 'TURKIYE': 'TR',
  "République de Turquie": 'TR', 'REPUBLIQUE DE TURQUIE': 'TR',
  // Germany
  'ALLEMAGNE': 'DE', 'Allemagne': 'DE', 'allemagne': 'DE',
  'GERMANY': 'DE', 'ALLEMEGNE': 'DE', 'Allemand': 'DE',
  "République fédérale d'Allemagne (Union européenne)": 'DE',
  'Munster/Germany': 'DE',
  // Portugal
  'PORTUGAL': 'PT', 'Portugal': 'PT', 'portugal': 'PT',
  'PEROU &  PAYS BAS': 'PE',
  // Saudi Arabia
  'ARABIE SAOUDITE': 'SA', 'Arabie Saoudite': 'SA', 'Arabie saoudite': 'SA',
  'ARABIE SAOUDIA': 'SA', 'ARABIE SAOUSITE': 'SA',
  "L'Arabie Saoudite": 'SA', 'saudi arabia': 'SA', 'SAUDI ARABIA': 'SA',
  // India
  'INDE': 'IN', 'Inde': 'IN', 'inde': 'IN', 'INDIA': 'IN', 'India': 'IN', 'india': 'IN',
  'INDE/THAILLANDE': 'IN',
  // Belgium
  'BELGIQUE': 'BE', 'Belgique': 'BE', 'belgique': 'BE',
  // Thailand
  'THAÏLANDE': 'TH', 'Thaïlande': 'TH', 'THAI': 'TH',
  'THAILANDE': 'TH', 'Thailande': 'TH', 'thailand': 'TH', 'THAILAND': 'TH',
  'Thailland': 'TH', 'Thaillande': 'TH',
  // Netherlands
  'PAYS BAS': 'NL', 'Pays Bas': 'NL', 'HOLLANDE': 'NL', 'Hollande': 'NL',
  'PAYS-BAS': 'NL', 'Pays-Bas': 'NL', 'pays-bas': 'NL',
  'HOLLAND': 'NL', 'Netherlands': 'NL', 'NETHERLANDS': 'NL',
  'Thailande / pays Bas': 'TH',
  // Hungary
  'HONGRIE': 'HU', 'Hongrie': 'HU', 'HUNGARY': 'HU', 'HONGARIE': 'HU',
  // United Kingdom
  'UK': 'GB', 'ROYAUME-UNI': 'GB', 'Royaume-Uni': 'GB', 'royaume-uni': 'GB',
  'Royaume uni': 'GB', 'ROYAUME UNI': 'GB',
  'GRANDE BRETAGNE': 'GB', 'Grande Bretagne': 'GB', 'Grande bretagne': 'GB',
  'GRAND BRETAGNE': 'GB', 'Angleterre': 'GB', 'united kingdam': 'GB',
  // USA
  'USA': 'US', 'usa': 'US', 'Usa': 'US', 'us': 'US',
  'Etats Unis': 'US', 'Etat Unis': 'US', 'ETATS UNIS': 'US',
  'États-Unis': 'US', 'ETATS UNIS D\'AMERIQUE USA': 'US',
  'USAالولايات المتحدة الامريكية': 'US', 'AMERIQUE /ITALY': 'US',
  // Russia
  'RUSSIE': 'RU', 'Russie': 'RU', 'russie': 'RU',
  // Japan
  'JAPON': 'JP', 'Japon': 'JP', 'JAPAN': 'JP',
  // Greece
  'GRÈCE': 'GR', 'Grèce': 'GR', 'GRECE': 'GR', 'GREECE': 'GR',
  'Greece': 'GR', 'Gréce': 'GR',
  // Australia
  'AUSTRALIE': 'AU', 'Australie': 'AU', 'Australia': 'AU',
  // Poland
  'POLOGNE': 'PL', 'Pologne': 'PL', 'POLONGNE': 'PL', 'Poland': 'PL',
  // Tunisia
  'TUNISIE': 'TN', 'Tunisie': 'TN',
  // UAE
  'EMIRATS ARABES UNIS': 'AE', 'Emirats Arabes Unis': 'AE',
  'UNITED ARAB EMIRATE': 'AE',
  // Slovenia
  'SLOVÉNIE': 'SI', 'SLOVENIE': 'SI', "Slovénie": 'SI', 'SLOVINIE': 'SI',
  // Chile
  'CHILI': 'CL', 'Chili': 'CL', 'chili': 'CL', 'CHILE': 'CL', 'Chile': 'CL',
  'CHILIE': 'CL',
  // Cyprus
  'CHYPRE': 'CY',
  // South Korea
  'CORÉE DU SUD': 'KR', 'Corée du Sud': 'KR',
  // Denmark
  'DANEMARK': 'DK',
  // Egypt
  'EGYPTE': 'EG', 'ÉGYPTE': 'EG', 'Égypte': 'EG', 'Egypte': 'EG',
  'EGYPT': 'EG', 'Egypt': 'EG',
  // Bulgaria
  'BULGARIE': 'BG', 'Bulgarie': 'BG', 'Bulgaria': 'BG',
  // Iceland
  'ISLANDE': 'IS', 'Islande': 'IS',
  // Malaysia
  'MALAISIE': 'MY',
  // Norway
  'NORVEGE': 'NO', 'NORVÈGE': 'NO',
  // Peru
  'PÉROU': 'PE', 'Pérou': 'PE', 'PEROU': 'PE', 'Peru': 'PE', 'PERU': 'PE',
  'ICA-PERU': 'PE', 'Inde / Pérou': 'PE', 'Inda / Pérou': 'PE',
  'Kenya+ Perou': 'KE',
  // Austria
  'AUTRICHE': 'AT', 'Autriche': 'AT',
  // Sweden
  'SUÈDE': 'SE', 'suède': 'SE',
  // Brazil
  'BRÉSIL': 'BR', 'brésil': 'BR', 'BRESIL': 'BR', 'Brazil': 'BR', 'BRAZIL': 'BR',
  'BRAZIL/ARGENTINE': 'BR', 'ARGENTINE/BRAZIL': 'BR', 'BRESIL / ARGENTINE': 'BR',
  'argentine brazil': 'AR',
  // Costa Rica (many multi-origin banana import strings — take first)
  'COSTA RICA': 'CR', 'COSTARICA': 'CR', 'Costa Rica': 'CR', 'costa rica': 'CR',
  'COSTA-RICA / COLOMBIA': 'CR', 'COSTA RICA / COLOMBIA': 'CR',
  'COSTA RICA OU COLOMBIE': 'CR', 'Cota Rica – Colombie': 'CR',
  'COSTA RICA  COLOMBIE': 'CR', 'COSTA RICA-COLOMBIA': 'CR',
  'COSTA RICA -COLOMBIA': 'CR', 'COSTA RICA/COLOMBIA': 'CR',
  'COSTA RICA  COLOMBIE GUATEMALA': 'CR', 'COSTA RICA COLOMBIA': 'CR',
  'COSTA RICA, COLOMBIA, GUATEMALA': 'CR',
  'COSTA RICA, COLOMBIA, GUATEMALA PORTUGAL': 'CR',
  'COSTA RICA / COLOMBIA / GUATEMALA': 'CR',
  'COSTA RICA/COLOMBIA/GUATEMALA': 'CR', 'COSTA RICA/COLOMBIA/GUATIMALA': 'CR',
  'COSTA RICA-COLOMBIE-GUATEMALA': 'CR', 'COSTA RICA-COLOMBIA-GUATEMALA': 'CR',
  'COSTA RICA-COLOMBIA-COTE D\'IVOIRE-CAMERON': 'CR',
  'COSTA RICA – PANAMA – COLOMBIE – MEXICO – GUATEMALA': 'CR',
  'COSTA RICA –COLOMBIE -GUATEMALA': 'CR',
  'Costa-Rica/Colombie': 'CR', 'Costa Rica / Colombia / Mexico': 'CR',
  'COTE D\'IVOIR-COSTA RICA-COLOMBIA-GUATEMALA': 'CR',
  "cote d'ivoire-costa rica-colombie-guatemala": 'CR',
  "costa rica -colombie-cote d'ivoir": 'CR',
  "colombie – costa-rica-guatemala": 'CR',
  'COLOMBIE. COSTA RICA. PEROU .GUATEMALA.MEXIQUE.COTEDIVOIRE .CAMIRON.BRAZIL': 'CR',
  "COLOMBIE, COSTA RICA, PEROU, GUATEMALA, MEXIQUE, COTE D'IVOIRE, CAMERON, BRAZIL.": 'CR',
  ": COLOMBIE / COSTA RICA / PEROU / GUATEMALA / MEXIQUE / COTE D'IVOIRE / CAMERON / BRAZIL.": 'CR',
  // South Africa
  'AFRIQUE DU SUD': 'ZA', 'AFRIQUE DE SUD': 'ZA', 'Afrique du Sud': 'ZA',
  'Afrique du sud': 'ZA', 'SUD D\'AFRIQUE': 'ZA',
  'France/Afrique du sud': 'FR', 'France , Italie et Chine': 'FR',
  // Morocco
  'MAROC': 'MA', 'Maroc': 'MA',
  // France
  'FRANCE': 'FR', 'France': 'FR',
  // Guatemala
  'GUATEMALA': 'GT',
  // Colombia
  'COLOMBIE': 'CO', 'Colombie': 'CO',
  // Ecuador
  'ÉQUATEUR': 'EC', 'EQUATEUR': 'EC', 'Equateur': 'EC', 'Équateur': 'EC',
  // Mexico
  'MEXIQUE': 'MX', 'Mexique': 'MX',
  // New Zealand
  'NOUVELLE-ZÉLANDE': 'NZ', 'Nouvelle-Zélande': 'NZ', 'NOUVELLE ZELANDE': 'NZ',
  'NEW ZEALAND': 'NZ', 'NEW ZELAND': 'NZ', 'NOUVELLE ZELAND': 'NZ',
  'Nouvelle Zélande': 'NZ', 'Nouvelle Zelande': 'NZ', 'New zelande': 'NZ',
  'Nouvelle Zeland': 'NZ',
  // Kenya
  'KENYA': 'KE', 'Kenya': 'KE',
  // Tanzania
  'TANZANIE': 'TZ', 'Tanzanie': 'TZ', 'TANZANIA': 'TZ', 'Tanzania': 'TZ',
  // Vietnam
  'VIETNAM': 'VN', 'Viêt Nam': 'VN',
  // Serbia
  'SERBIE': 'RS', 'Serbie': 'RS',
  // Lebanon
  'LIBAN': 'LB', 'Liban': 'LB',
  // Croatia
  'CROATIE': 'HR', 'Croatie': 'HR',
  // Argentina
  'ARGENTINE': 'AR', 'Argentine': 'AR',
  // Switzerland
  'SUISSE': 'CH', 'Suisse': 'CH',
  // Czech Republic
  'REPUBLIQUE TCHEQUE': 'CZ', 'République tchèque': 'CZ',
  // Romania
  'ROUMANIE': 'RO', 'Roumanie': 'RO',
  // Slovakia
  'SLOVAQUIE': 'SK', 'Slovaquie': 'SK',
  // Lithuania
  'LITUANIE': 'LT',
  // Israel
  'ISRAËL': 'IL', 'ISRAEL': 'IL', 'Israël': 'IL',
  // Singapore
  'SINGAPOUR': 'SG', 'Singapore': 'SG',
  // Iran
  'IRAN': 'IR', 'Iran': 'IR',
  // Libya
  'LIBYE': 'LY', 'Libye': 'LY',
  // Syria
  'SYRIE': 'SY',
  // Iraq
  'IRAK': 'IQ', 'Iraq': 'IQ',
};

// Build a case-insensitive fallback map (uppercased keys)
const RAW_UPPER: Record<string, string> = {};
for (const [k, v] of Object.entries(RAW_TO_ISO)) {
  RAW_UPPER[k.toUpperCase()] = v;
}

/**
 * Normalize a raw country string → ISO 3166-1 alpha-2 code.
 * For multi-country strings (e.g. "COSTA RICA / COLOMBIA") returns the first resolved country.
 * Returns 'XX' for truly unrecognized values.
 */
export function countryToIso(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'XX';

  // Exact match
  const exact = RAW_TO_ISO[trimmed];
  if (exact) return exact;

  // Case-insensitive match
  const upper = trimmed.toUpperCase();
  const ci = RAW_UPPER[upper];
  if (ci) return ci;

  // If it already looks like an ISO code (2 capital letters) and is in COUNTRY_INFO, trust it
  if (/^[A-Z]{2}$/.test(trimmed) && COUNTRY_INFO[trimmed]) return trimmed;

  // Multi-country: split on /, ,, –, -, ' et ', ' ou ', ' OR ', ' AND '
  // Return the first successfully resolved part
  const parts = trimmed.split(/[\/,;]|\s+[-–]\s+|\s+(?:et|ou|or|and)\s+/i);
  for (const part of parts) {
    const p = part.trim();
    if (!p || p.length < 2) continue;
    const iso = RAW_TO_ISO[p] ?? RAW_UPPER[p.toUpperCase()];
    if (iso) return iso;
  }

  return 'XX';
}

export function countryName(iso: string, lang: Lang): string {
  if (iso === 'XX') return lang === 'ar' ? 'غير محدد' : lang === 'fr' ? 'Inconnu' : 'Unknown';
  return COUNTRY_INFO[iso]?.[lang] ?? iso;
}

export function countryLabelForChart(raw: string, lang: Lang): string {
  const iso = countryToIso(raw);
  return COUNTRY_INFO[iso]?.[lang] ?? raw.trim();
}
