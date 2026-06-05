export interface WilayaInfo {
  code: number;
  fr: string;
  ar: string;
  en: string;
}

export const WILAYA_BY_CODE: Record<number, WilayaInfo> = {
  1:  { code: 1,  fr: 'Adrar',            ar: 'أدرار',              en: 'Adrar' },
  2:  { code: 2,  fr: 'Chlef',            ar: 'الشلف',              en: 'Chlef' },
  3:  { code: 3,  fr: 'Laghouat',         ar: 'الأغواط',            en: 'Laghouat' },
  4:  { code: 4,  fr: 'Oum El Bouaghi',   ar: 'أم البواقي',         en: 'Oum El Bouaghi' },
  5:  { code: 5,  fr: 'Batna',            ar: 'باتنة',              en: 'Batna' },
  6:  { code: 6,  fr: 'Béjaïa',           ar: 'بجاية',              en: 'Bejaia' },
  7:  { code: 7,  fr: 'Biskra',           ar: 'بسكرة',              en: 'Biskra' },
  8:  { code: 8,  fr: 'Béchar',           ar: 'بشار',               en: 'Bechar' },
  9:  { code: 9,  fr: 'Blida',            ar: 'البليدة',            en: 'Blida' },
  10: { code: 10, fr: 'Bouïra',           ar: 'البويرة',            en: 'Bouira' },
  11: { code: 11, fr: 'Tamanrasset',      ar: 'تمنراست',            en: 'Tamanrasset' },
  12: { code: 12, fr: 'Tébessa',          ar: 'تبسة',               en: 'Tebessa' },
  13: { code: 13, fr: 'Tlemcen',          ar: 'تلمسان',             en: 'Tlemcen' },
  14: { code: 14, fr: 'Tiaret',           ar: 'تيارت',              en: 'Tiaret' },
  15: { code: 15, fr: 'Tizi Ouzou',       ar: 'تيزي وزو',           en: 'Tizi Ouzou' },
  16: { code: 16, fr: 'Alger',            ar: 'الجزائر',            en: 'Algiers' },
  17: { code: 17, fr: 'Djelfa',           ar: 'الجلفة',             en: 'Djelfa' },
  18: { code: 18, fr: 'Jijel',            ar: 'جيجل',               en: 'Jijel' },
  19: { code: 19, fr: 'Sétif',            ar: 'سطيف',               en: 'Setif' },
  20: { code: 20, fr: 'Saïda',            ar: 'سعيدة',              en: 'Saida' },
  21: { code: 21, fr: 'Skikda',           ar: 'سكيكدة',             en: 'Skikda' },
  22: { code: 22, fr: 'Sidi Bel Abbès',   ar: 'سيدي بلعباس',        en: 'Sidi Bel Abbes' },
  23: { code: 23, fr: 'Annaba',           ar: 'عنابة',              en: 'Annaba' },
  24: { code: 24, fr: 'Guelma',           ar: 'قالمة',              en: 'Guelma' },
  25: { code: 25, fr: 'Constantine',      ar: 'قسنطينة',            en: 'Constantine' },
  26: { code: 26, fr: 'Médéa',            ar: 'المدية',             en: 'Medea' },
  27: { code: 27, fr: 'Mostaganem',       ar: 'مستغانم',            en: 'Mostaganem' },
  28: { code: 28, fr: "M'Sila",           ar: 'المسيلة',            en: "M'Sila" },
  29: { code: 29, fr: 'Mascara',          ar: 'معسكر',              en: 'Mascara' },
  30: { code: 30, fr: 'Ouargla',          ar: 'ورقلة',              en: 'Ouargla' },
  31: { code: 31, fr: 'Oran',             ar: 'وهران',              en: 'Oran' },
  32: { code: 32, fr: 'El Bayadh',        ar: 'البيض',              en: 'El Bayadh' },
  33: { code: 33, fr: 'Illizi',           ar: 'إليزي',              en: 'Illizi' },
  34: { code: 34, fr: 'Bordj Bou Arréridj', ar: 'برج بوعريريج',   en: 'Bordj Bou Arreridj' },
  35: { code: 35, fr: 'Boumerdès',        ar: 'بومرداس',            en: 'Boumerdes' },
  36: { code: 36, fr: 'El Tarf',          ar: 'الطارف',             en: 'El Tarf' },
  37: { code: 37, fr: 'Tindouf',          ar: 'تندوف',              en: 'Tindouf' },
  38: { code: 38, fr: 'Tissemsilt',       ar: 'تيسمسيلت',          en: 'Tissemsilt' },
  39: { code: 39, fr: 'El Oued',          ar: 'الوادي',             en: 'El Oued' },
  40: { code: 40, fr: 'Khenchela',        ar: 'خنشلة',              en: 'Khenchela' },
  41: { code: 41, fr: 'Souk Ahras',       ar: 'سوق أهراس',          en: 'Souk Ahras' },
  42: { code: 42, fr: 'Tipaza',           ar: 'تيبازة',             en: 'Tipaza' },
  43: { code: 43, fr: 'Mila',             ar: 'ميلة',               en: 'Mila' },
  44: { code: 44, fr: 'Aïn Defla',        ar: 'عين الدفلى',         en: 'Ain Defla' },
  45: { code: 45, fr: 'Naâma',            ar: 'النعامة',            en: 'Naama' },
  46: { code: 46, fr: 'Aïn Témouchent',   ar: 'عين تموشنت',         en: 'Ain Temouchent' },
  47: { code: 47, fr: 'Ghardaïa',         ar: 'غرداية',             en: 'Ghardaia' },
  48: { code: 48, fr: 'Relizane',         ar: 'غليزان',             en: 'Relizane' },
  49: { code: 49, fr: 'Timimoun',         ar: 'تيميمون',            en: 'Timimoun' },
  50: { code: 50, fr: 'Bordj Badji Mokhtar', ar: 'برج باجي مختار', en: 'Bordj Badji Mokhtar' },
  51: { code: 51, fr: 'Ouled Djellal',    ar: 'أولاد جلال',         en: 'Ouled Djellal' },
  52: { code: 52, fr: 'Béni Abbès',       ar: 'بني عباس',           en: 'Beni Abbes' },
  53: { code: 53, fr: 'In Salah',         ar: 'عين صالح',           en: 'In Salah' },
  54: { code: 54, fr: 'In Guezzam',       ar: 'عين قزام',           en: 'In Guezzam' },
  55: { code: 55, fr: 'Touggourt',        ar: 'تقرت',               en: 'Touggourt' },
  56: { code: 56, fr: 'Djanet',           ar: 'جانت',               en: 'Djanet' },
  57: { code: 57, fr: "El M'Ghair",       ar: "المغير",             en: "El M'Ghair" },
  58: { code: 58, fr: 'El Meniaa',        ar: 'المنيعة',            en: 'El Meniaa' },
};

export function wilayaNameByCode(code: number, lang: 'ar' | 'fr' | 'en' = 'ar'): string {
  return WILAYA_BY_CODE[code]?.[lang] ?? `W${code}`;
}

// Map French/Arabic wilaya name variants → code number for distributor data matching
export const WILAYA_NAME_TO_CODE: Record<string, number> = Object.fromEntries(
  Object.values(WILAYA_BY_CODE).flatMap((w) => [
    [w.fr.toLowerCase(), w.code],
    [w.ar, w.code],
    [w.en.toLowerCase(), w.code],
  ])
);

export function wilayaCodeFromName(name: string): number | null {
  const norm = name.trim().toLowerCase()
    .replace(/'/g, "'")
    .replace(/\s+/g, ' ');
  return WILAYA_NAME_TO_CODE[norm] ?? null;
}
