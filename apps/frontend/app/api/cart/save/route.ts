import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function safeParseJson<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray((body as any)?.items) ? (body as any).items : [];

    // We avoid any server-side DB dependency here.
    // In production auth uses JWT cookies, not a Prisma Session table.
    const user = safeParseJson<{ id?: number }>(cookies().get('user')?.value);
    const scope = user?.id ? 'user' : 'guest';

    const res = NextResponse.json(
      { ok: true, scope },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set('guest_cart', JSON.stringify(items), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: 'cart_save_failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
