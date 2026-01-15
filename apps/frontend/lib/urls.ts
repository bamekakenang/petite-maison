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
    return trimmed;
  }

  // Only prefix paths that are expected to be served by the backend.
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/images/')) {
    const origin = backendOriginFromApiUrl();
    if (origin) return `${origin}${trimmed}`;
  }

  return trimmed;
}
