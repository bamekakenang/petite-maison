import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;
    if (token) {
      const session = await prisma.session.findUnique({ where: { token } });
      if (session) {
        const cart = await prisma.cart.findUnique({ where: { userId: session.userId } });
        return NextResponse.json({ items: cart ? JSON.parse(cart.json || '[]') : [] });
      }
    }
    const guest = cookies().get('guest_cart')?.value;
    return NextResponse.json({ items: guest ? JSON.parse(guest) : [] });
  } catch (e) {
    return NextResponse.json({ items: [] });
  }
}
