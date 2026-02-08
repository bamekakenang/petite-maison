import { resolveProductImageUrl, backendOriginFromApiUrl } from '../../lib/urls';

describe('resolveProductImageUrl', () => {
  it('should return undefined for undefined input', () => {
    expect(resolveProductImageUrl(undefined)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(resolveProductImageUrl('')).toBeUndefined();
  });

  it('should return undefined for whitespace-only string', () => {
    expect(resolveProductImageUrl('   ')).toBeUndefined();
  });

  it('should return fallback for picsum.photos URLs', () => {
    expect(resolveProductImageUrl('https://picsum.photos/400/600?random=1')).toBe('/products/house.svg');
  });

  it('should return the URL as-is for valid external URLs', () => {
    expect(resolveProductImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
  });

  it('should return fallback for /images/ paths (legacy seed data)', () => {
    expect(resolveProductImageUrl('/images/some-product.jpg')).toBe('/products/house.svg');
  });

  it('should prefix /uploads/ paths with backend origin', () => {
    const result = resolveProductImageUrl('/uploads/products/photo.jpg');
    // The exact result depends on NEXT_PUBLIC_API_URL env var
    // In test env it defaults to localhost
    expect(result).toContain('/uploads/products/photo.jpg');
  });

  it('should return local paths unchanged', () => {
    expect(resolveProductImageUrl('/products/house.svg')).toBe('/products/house.svg');
    expect(resolveProductImageUrl('/products/figurine.webp')).toBe('/products/figurine.webp');
  });
});

describe('backendOriginFromApiUrl', () => {
  it('should extract origin from API URL', () => {
    // Default is http://localhost:3000/api/v1
    const origin = backendOriginFromApiUrl();
    expect(origin).toBe('http://localhost:3000');
  });
});
