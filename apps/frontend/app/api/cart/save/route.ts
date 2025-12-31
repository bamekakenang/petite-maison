import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? body.items : [];
    const token = cookies().get('auth_token')?.value;
    if (token) {
      const session = await prisma.session.findUnique({ where: { token } });
      if (session) {
        await prisma.cart.upsert({
          where: { userId: session.userId },
          update: { json: JSON.stringify(items) },
          create: { userId: session.userId, json: JSON.stringify(items) }
        });
        return NextResponse.json({ ok: true, scope: 'user' });
      }
    }
    const res = NextResponse.json({ ok: true, scope: 'guest' });
    res.cookies.set('guest_cart', JSON.stringify(items), { path: '/', maxAge: 60*60*24*7 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'cart_save_failed' }, { status: 500 });
  }
}
