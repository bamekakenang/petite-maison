import { NextResponse } from 'next/server';
import { currentUser } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import Stripe from 'stripe';

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const actives = await prisma.subscription.findMany({ where: { userId: user.id, status: 'ACTIVE' as any } });
    if (actives.length === 0) return NextResponse.json({ ok: true, canceled: 0 });

    const key = process.env.STRIPE_SECRET_KEY;
    const stripe = key ? new Stripe(key, { apiVersion: '2024-06-20' }) : null;

    for (const sub of actives) {
      if (stripe && sub.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
        } catch (e) {
          console.error('Stripe subscription cancel failed', e);
        }
      }
    }

    await prisma.subscription.updateMany({
      where: { id: { in: actives.map(s => s.id) } },
      data: { status: 'CANCELED' as any }
    });

    return NextResponse.json({ ok: true, canceled: actives.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'cancel_failed' }, { status: 500 });
  }
}
