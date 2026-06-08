export interface PlantProduct {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  countryOfOrigin: string;
  productionZone: string;
  category: string;
}

export interface Seedling {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  materialType: string;
  productionZone: string;
  plantingZone: string;
  countryOfOrigin: string;
}

export interface Agrochemical {
  company: string;
  companyNameAr: string;
  productName: string;
  activeSubstance: string;
  category: string;
  countryOfOrigin: string;
}

export interface PotatoSeed {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  materialType: string;
  productionZone: string;
  countryOfOrigin: string;
  category: string;
}

export interface Seed {
  company: string;
  companyNameAr: string;
  knownName: string;
  variety: string;
  materialType: string;
  productionZone: string;
  countryOfOrigin: string;
}

export interface VetAuthorization {
  company: string;
  companyNameAr: string;
  authorizationNumber: string;
  agreementNumber: string;
  productType: string;
  productTypeLabel: { fr: string; ar: string; en: string };
}

export interface VetDistributor {
  company: string;
  companyNameAr: string;
  number: string;
  wilaya: string;
  address: string;
}

export interface VetMedicineImporter {
  company: string;
  companyNameAr: string;
  number: string;
  location: string;
}

export type Lang = 'fr' | 'ar' | 'en';
