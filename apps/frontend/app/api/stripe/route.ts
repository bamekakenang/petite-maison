import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      // If no secret is set (dev without CLI), we might want to allow insecure for testing?
      // But for safety, let's just return error or log warning.
      // For now, if no secret, we can't verify.
      console.warn('Stripe webhook secret not set or signature missing.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.id) {
          const order = await prisma.order.findFirst({
            where: { stripeSessionId: session.id }
          });

          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'PAID' }
            });
            console.log(`Order ${order.id} paid successfully.`);
          } else {
            console.warn(`Order not found for session: ${session.id}`);
          }
        }
        break;
      }
      // Handle other event types if needed (e.g. payment_intent.payment_failed -> CANCELED)
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (e) {
    console.error('Error processing webhook:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
