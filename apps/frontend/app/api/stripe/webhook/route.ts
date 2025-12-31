import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 400 });

  const stripe = new Stripe(key, { apiVersion: '2025-09-30.clover' });

  let event: Stripe.Event;
  try {
    if (webhookSecret) {
      const sig = req.headers.get('stripe-signature') as string;
      const body = await req.text();
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      const json = await req.json();
      event = json as any;
    }
  } catch (err) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.id) {
        await prisma.order.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: 'PAID' as any }
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({ received: true });
}
