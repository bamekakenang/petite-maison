import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

type CreateProductPayload = {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  minStock?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<CreateProductPayload>;

    // Basic validation (backend also validates)
    if (!body.sku || !body.name || body.price === undefined || body.stock === undefined || !body.category) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const payload: CreateProductPayload = {
      sku: String(body.sku).trim(),
      name: String(body.name).trim(),
      description: body.description ? String(body.description) : undefined,
      price: Number(body.price),
      stock: Number(body.stock),
      category: String(body.category).trim(),
      imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
      minStock: body.minStock === undefined ? undefined : Number(body.minStock),
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Preserve original client IP so backend rate-limit works per user (not per App Service IP)
    const xff = req.headers.get('x-forwarded-for');
    if (xff) headers['x-forwarded-for'] = xff;

    const backendResponse = await fetch(`${BACKEND_URL}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
        { error: safeErrorMessage(raw, data) || 'create_product_failed' },
        { status: backendResponse.status }
      );
    }

    // Preserve the backend shape { success, data }
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'create_product_failed' }, { status: 502 });
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (e) {
    console.error('Create product proxy error:', e);
    return NextResponse.json({ error: 'create_product_failed' }, { status: 500 });
  }
}
