const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export function backendOriginFromApiUrl(): string | null {
  try {
    return new URL(API_URL).origin;
  } catch {
    return null;
  }
}

/**
 * Convert backend-relative paths like `/uploads/...` or `/images/...` to absolute URLs.
 * Leaves frontend-public assets like `/products/...` untouched.
 */
export function resolveProductImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  const trimmed = String(imageUrl).trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // picsum.photos placeholder images are unreliable (302 chains, 404s) → use fallback.
    try {
      const host = new URL(trimmed).hostname;
      if (host === 'picsum.photos') return '/products/house.svg';
    } catch { /* not a valid URL, fall through */ }
    return trimmed;
  }

  // Backend /uploads/ paths → prefix with backend origin.
  if (trimmed.startsWith('/uploads/')) {
    const origin = backendOriginFromApiUrl();
    if (origin) return `${origin}${trimmed}`;
  }

  // Legacy /images/ paths from seed data don't exist anywhere → use fallback.
  if (trimmed.startsWith('/images/')) {
    return '/products/house.svg';
  }

  return trimmed;
}
