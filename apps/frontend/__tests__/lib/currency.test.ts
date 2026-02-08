import { currencyForLocale } from '../../lib/currency';

describe('currencyForLocale', () => {
  it('should return EUR for French locale', () => {
    expect(currencyForLocale('fr')).toBe('EUR');
  });

  it('should return EUR for English locale', () => {
    expect(currencyForLocale('en')).toBe('EUR');
  });

  it('should return JPY for Japanese locale', () => {
    expect(currencyForLocale('ja')).toBe('JPY');
  });

  it('should return PLN for Polish locale', () => {
    expect(currencyForLocale('pl')).toBe('PLN');
  });

  it('should return INR for Hindi locale', () => {
    expect(currencyForLocale('hi')).toBe('INR');
  });

  it('should handle locale with region code (fr-FR)', () => {
    expect(currencyForLocale('fr-FR')).toBe('EUR');
  });

  it('should handle locale with region code (en-US)', () => {
    expect(currencyForLocale('en-US')).toBe('EUR');
  });

  it('should default to EUR for unknown locale', () => {
    expect(currencyForLocale('xx')).toBe('EUR');
  });

  it('should default to EUR for empty string', () => {
    expect(currencyForLocale('')).toBe('EUR');
  });

  it('should be case-insensitive', () => {
    expect(currencyForLocale('FR')).toBe('EUR');
    expect(currencyForLocale('JA')).toBe('JPY');
  });
});
