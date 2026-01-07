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

    // Try to get cookies, but don't fail if unavailable
    let scope = 'guest';
    try {
      const cookieStore = await cookies();
      const userCookie = cookieStore.get('user');
      if (userCookie?.value) {
        const user = safeParseJson<{ id?: number }>(userCookie.value);
        if (user?.id) scope = 'user';
      }
    } catch (e) {
      // cookies() might throw in some runtimes - just use guest scope
      console.debug('Cookie read skipped (guest scope):', e instanceof Error ? e.message : 'unknown');
    }

    const res = NextResponse.json(
      { ok: true, scope },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    // Always try to set the cart cookie
    try {
      const isProd = process.env.NODE_ENV === 'production';
      res.cookies.set('guest_cart', JSON.stringify(items), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
      });
    } catch (e) {
      console.debug('Cookie write skipped:', e instanceof Error ? e.message : 'unknown');
    }

    return res;
  } catch (error) {
    console.error('Cart save error:', error);
    // Return 200 anyway - cart save is non-critical
    return NextResponse.json(
      { ok: true, error: 'cart_save_partial', scope: 'guest' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
