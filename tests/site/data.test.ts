import { describe, it, expect } from 'vitest';
import {
  loadAgrochemicals,
  loadPlantProducts,
  loadSeedlings,
  loadSeeds,
  loadPotatoSeeds,
  loadVetAuthorizations,
  loadVetDistributors,
  loadVetMedicineImporters,
} from '@lib/data';

describe('data loaders', () => {
  it('loads agrochemicals and returns typed records', () => {
    const records = loadAgrochemicals();
    expect(records.length).toBeGreaterThan(0);
    const first = records[0];
    expect(typeof first.company).toBe('string');
    expect(typeof first.productName).toBe('string');
    expect(typeof first.activeSubstance).toBe('string');
    expect(typeof first.category).toBe('string');
    expect(typeof first.countryOfOrigin).toBe('string');
    expect(first.companyNameAr).toBe('');
  });

  it('loads plant products with camelCase fields', () => {
    const records = loadPlantProducts();
    expect(records.length).toBeGreaterThan(0);
    const first = records[0];
    expect(typeof first.knownName).toBe('string');
    expect(typeof first.countryOfOrigin).toBe('string');
  });

  it('loads vet distributors with wilaya field', () => {
    const records = loadVetDistributors();
    expect(records.length).toBeGreaterThan(0);
    expect(typeof records[0].wilaya).toBe('string');
  });

  it('total record count across all datasets is at least 9000', () => {
    const total =
      loadAgrochemicals().length +
      loadPlantProducts().length +
      loadSeedlings().length +
      loadSeeds().length +
      loadPotatoSeeds().length +
      loadVetAuthorizations().length +
      loadVetDistributors().length +
      loadVetMedicineImporters().length;
    expect(total).toBeGreaterThanOrEqual(9000);
  });
});
