import type {
  Agrochemical,
  PlantProduct,
  Seedling,
  Seed,
  PotatoSeed,
  VetAuthorization,
  VetDistributor,
  VetMedicineImporter,
} from './types';
import { normalizeChemicalCategory, normalizePlantCategory, aggregateByCompany } from './normalize';
export type { CompanyStat } from './normalize';

interface RawAgrochemical {
  company: string;
  company_name_ar: string;
  product_name: string;
  active_substance: string;
  category: string;
  country_of_origin: string;
}

interface RawPlantProduct {
  company: string;
  company_name_ar: string;
  known_name: string;
  variety: string;
  country_of_origin: string;
  production_zone: string;
  category: string;
}

interface RawSeedling {
  company: string;
  company_name_ar: string;
  known_name: string;
  variety: string;
  material_type: string;
  production_zone: string;
  planting_zone: string;
  country_of_origin: string;
}

interface RawSeed {
  company: string;
  company_name_ar: string;
  known_name: string;
  variety: string;
  material_type: string;
  production_zone: string;
  country_of_origin: string;
}

interface RawPotatoSeed {
  company: string;
  company_name_ar: string;
  known_name: string;
  variety: string;
  material_type: string;
  production_zone: string;
  country_of_origin: string;
  category: string;
}

interface RawVetAuthorization {
  company: string;
  company_name_ar: string;
  authorization_number: string;
  agreement_number: string;
  product_type: string;
  product_type_label: { fr: string; ar: string; en: string };
}

interface RawVetDistributor {
  company: string;
  company_name_ar: string;
  number: string;
  wilaya: string;
  address: string;
}

interface RawVetMedicineImporter {
  company: string;
  company_name_ar: string;
  number: string;
  location: string;
}

import rawAgrochemicals from '../../data/agrochemicals.json';
import rawPlantProducts from '../../data/plant-products.json';
import rawSeedlings from '../../data/seedlings.json';
import rawSeeds from '../../data/seeds.json';
import rawPotatoSeeds from '../../data/potato-seeds.json';
import rawVetAuthorizations from '../../data/vet-authorizations.json';
import rawVetDistributors from '../../data/vet-distributors.json';
import rawVetMedicineImporters from '../../data/vet-medicine-importers.json';

export function loadAgrochemicals(): Agrochemical[] {
  return (rawAgrochemicals as RawAgrochemical[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    productName: r.product_name,
    activeSubstance: r.active_substance,
    category: normalizeChemicalCategory(r.category),
    countryOfOrigin: r.country_of_origin,
  }));
}

export function loadPlantProducts(): PlantProduct[] {
  return (rawPlantProducts as RawPlantProduct[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    knownName: r.known_name,
    variety: r.variety,
    countryOfOrigin: r.country_of_origin,
    productionZone: r.production_zone,
    category: normalizePlantCategory(r.category),
  }));
}

export function loadSeedlings(): Seedling[] {
  return (rawSeedlings as RawSeedling[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    knownName: r.known_name,
    variety: r.variety,
    materialType: r.material_type,
    productionZone: r.production_zone,
    plantingZone: r.planting_zone,
    countryOfOrigin: r.country_of_origin,
  }));
}

export function loadSeeds(): Seed[] {
  return (rawSeeds as RawSeed[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    knownName: r.known_name,
    variety: r.variety,
    materialType: r.material_type,
    productionZone: r.production_zone,
    countryOfOrigin: r.country_of_origin,
  }));
}

export function loadPotatoSeeds(): PotatoSeed[] {
  return (rawPotatoSeeds as RawPotatoSeed[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    knownName: r.known_name,
    variety: r.variety,
    materialType: r.material_type,
    productionZone: r.production_zone,
    countryOfOrigin: r.country_of_origin,
    category: r.category,
  }));
}

export function loadVetAuthorizations(): VetAuthorization[] {
  return (rawVetAuthorizations as RawVetAuthorization[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    authorizationNumber: r.authorization_number,
    agreementNumber: r.agreement_number,
    productType: r.product_type,
    productTypeLabel: r.product_type_label ?? { fr: r.product_type, ar: r.product_type, en: r.product_type },
  }));
}

export function loadVetDistributors(): VetDistributor[] {
  return (rawVetDistributors as RawVetDistributor[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    number: r.number,
    wilaya: r.wilaya,
    address: r.address,
  }));
}

export function loadVetMedicineImporters(): VetMedicineImporter[] {
  return (rawVetMedicineImporters as RawVetMedicineImporter[]).map((r) => ({
    company: r.company,
    companyNameAr: r.company_name_ar,
    number: r.number,
    location: r.location,
  }));
}

export function loadCompanyStats() {
  const rows = [
    ...loadAgrochemicals().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'agrochemicals' })),
    ...loadPlantProducts().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'plants' })),
    ...loadSeedlings().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'seedlings' })),
    ...loadSeeds().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'seeds' })),
    ...loadPotatoSeeds().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'potato-seeds' })),
    ...loadVetAuthorizations().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'vet-auths' })),
    ...loadVetDistributors().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'vet-dist' })),
    ...loadVetMedicineImporters().map((r) => ({ company: r.company, companyNameAr: r.companyNameAr, sector: 'vet-imp' })),
  ];
  return aggregateByCompany(rows);
}
