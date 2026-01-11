import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1';

function safeErrorMessage(raw: string | null, parsed: any): string {
  if (parsed && typeof parsed === 'object') {
    if (typeof parsed.error === 'string' && parsed.error) return parsed.error;
    if (typeof parsed.message === 'string' && parsed.message) return parsed.message;
  }

  if (!raw) return 'backend_error';
  const trimmed = raw.trim();
  if (trimmed.startsWith('<')) return 'backend_unavailable';
  return trimmed.slice(0, 500);
}

function mapSort(sort: string | null): { sortBy?: string; sortOrder?: 'asc' | 'desc' } {
  switch (sort) {
    case 'name':
      return { sortBy: 'name', sortOrder: 'asc' };
    case 'price-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    default:
      return {};
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const inStock = searchParams.get('inStock')?.trim();
    const page = searchParams.get('page')?.trim() || '1';
    const limit = searchParams.get('limit')?.trim() || '200';
    const sort = searchParams.get('sort');

    const backendParams = new URLSearchParams();
    if (q) backendParams.set('search', q);
    if (category && category !== 'all') backendParams.set('category', category);
    if (inStock) backendParams.set('inStock', inStock);
    backendParams.set('page', page);
    backendParams.set('limit', limit);

    const mapped = mapSort(sort);
    if (mapped.sortBy) backendParams.set('sortBy', mapped.sortBy);
    if (mapped.sortOrder) backendParams.set('sortOrder', mapped.sortOrder);

    const url = `${BACKEND_URL}/products?${backendParams.toString()}`;

    const headers: Record<string, string> = { Accept: 'application/json' };
    const xff = req.headers.get('x-forwarded-for');
    if (xff) headers['x-forwarded-for'] = xff;

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const raw = await backendResponse.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: safeErrorMessage(raw, data) || 'products_fetch_failed' },
        { status: backendResponse.status }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'products_fetch_failed' }, { status: 502 });
    }

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Products proxy error:', e);
    return NextResponse.json({ error: 'products_fetch_failed' }, { status: 500 });
  }
}
