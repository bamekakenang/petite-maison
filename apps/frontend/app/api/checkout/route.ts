import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { items, currency, locale, customer, origin: originFromBody } = await req.json();
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: 'stripe_not_configured' }, { status: 400 });
    }
    const stripe = new Stripe(key, { apiVersion: '2025-09-30.clover' });

    // Validate cart
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
    }

    // Derive origin
    const origin = originFromBody || req.headers.get('origin') || req.headers.get('referer')?.replace(/\/(fr|en|[a-z]{2})(\/.*)?$/, '') || 'http://localhost:3001';

    // Require authentication
    let userId: number | undefined;
    try {
      const token = cookies().get('auth_token')?.value;
      if (token) {
        const { prisma } = await import('../../../lib/prisma');
        const sess = await prisma.session.findUnique({ where: { token } });
        if (sess && sess.expiresAt > new Date()) userId = sess.userId;
      }
    } catch {}
    if (!userId) {
      const ref = req.headers.get('referer');
      let nextPath = `/${locale || 'fr'}/panier`;
      try { if (ref) nextPath = new URL(ref).pathname; } catch {}
      return NextResponse.json({ error: 'unauthenticated', login: `${origin}/${locale || 'fr'}/connexion?next=${encodeURIComponent(nextPath)}` }, { status: 401 });
    }

    let customerId: string | undefined;
    if (customer?.email || customer?.name) {
      const created = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      });
      customerId = created.id;
    }

    const productsForTotal = items.map((i: any) => ({ price: Number(i.price), qty: Number(i.qty) || 1 }));
    const totalCentsEstimate = productsForTotal.reduce((s, p) => s + Math.round(p.price * 100) * p.qty, 0);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer: customerId,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: [customer?.address?.country || 'FR', 'BE', 'DE', 'ES', 'IT', 'PT', 'US', 'GB'] },
      line_items: (items || []).map((i: any) => ({
        price_data: {
          currency: (currency || 'eur').toLowerCase(),
          product_data: { name: i.title },
          unit_amount: Math.round(Number(i.price) * 100)
        },
        quantity: Number(i.qty) || 1
      })),
      success_url: `${origin}/${locale || 'fr'}/confirmation`,
      cancel_url: `${origin}/${locale || 'fr'}/panier`
    });

    try {
      const { prisma } = await import('../../../lib/prisma');
      await prisma.order.create({ data: { totalCents: totalCentsEstimate, status: 'PENDING' as any, stripeSessionId: session.id, userId } });
    } catch {}

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
