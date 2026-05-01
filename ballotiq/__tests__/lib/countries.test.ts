/**
 * Tests for country constants and helper functions.
 */

import { COUNTRIES, getCountryByCode, getAllCountryCodes } from '@/lib/constants/countries';

describe('COUNTRIES constants', () => {
  it('has exactly 8 entries', () => {
    expect(COUNTRIES).toHaveLength(8);
  });

  it('all countries have required fields', () => {
    COUNTRIES.forEach(country => {
      expect(country.code).toMatch(/^[A-Z]{2}$/);
      expect(country.name).toBeDefined();
      expect(country.flag).toBeDefined();
      expect(country.electionType).toBeDefined();
      expect(typeof country.votingAge).toBe('number');
      expect(country.electionBody).toBeDefined();
      expect(country.electionBodyUrl).toMatch(/^https?:\/\//);
      expect(Array.isArray(country.languages)).toBe(true);
    });
  });

  it('India has Tamil in languages array', () => {
    const india = COUNTRIES.find(c => c.code === 'IN');
    expect(india?.languages).toContain('ta');
  });

  it('no duplicate country codes', () => {
    const codes = COUNTRIES.map(c => c.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

describe('getCountryByCode', () => {
  it('returns India for "IN"', () => {
    expect(getCountryByCode('IN')?.name).toBe('India');
  });

  it('is case insensitive', () => {
    expect(getCountryByCode('in')?.name).toBe('India');
  });

  it('returns undefined for invalid code', () => {
    expect(getCountryByCode('XX')).toBeUndefined();
  });
});

describe('getAllCountryCodes', () => {
  it('returns all 8 codes', () => {
    const codes = getAllCountryCodes();
    expect(codes).toHaveLength(8);
    expect(codes).toContain('IN');
    expect(codes).toContain('US');
  });
});
