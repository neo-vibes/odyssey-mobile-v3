import { parseTokenFromUrl } from '../pairing';

describe('parseTokenFromUrl', () => {
  it('extracts token from valid URL', () => {
    const url = 'https://app.getodyssey.xyz/pair-mobile?token=abc123';
    expect(parseTokenFromUrl(url)).toBe('abc123');
  });

  it('extracts token from URL with extra params', () => {
    const url = 'https://app.getodyssey.xyz/pair-mobile?token=abc123&foo=bar';
    expect(parseTokenFromUrl(url)).toBe('abc123');
  });

  it('returns null for invalid domain', () => {
    const url = 'https://evil.com/pair-mobile?token=abc123';
    expect(parseTokenFromUrl(url)).toBeNull();
  });

  it('returns null for wrong path', () => {
    const url = 'https://app.getodyssey.xyz/other?token=abc123';
    expect(parseTokenFromUrl(url)).toBeNull();
  });

  it('returns null for missing token', () => {
    const url = 'https://app.getodyssey.xyz/pair-mobile';
    expect(parseTokenFromUrl(url)).toBeNull();
  });

  it('returns null for non-URL string', () => {
    expect(parseTokenFromUrl('not a url')).toBeNull();
  });
});
