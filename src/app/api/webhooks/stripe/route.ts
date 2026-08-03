import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/order-fulfillment';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }

  if (!sig) {
    console.error('[Stripe Webhook] stripe-signature header is missing');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    console.log(`[Stripe Webhook] Processing checkout.session.completed for session ID: ${session.id}`);

    const result = await fulfillOrder(session.id);
    if (!result.success) {
      console.error(`[Stripe Webhook] Order fulfillment error for session ${session.id}:`, result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log(`[Stripe Webhook] Order fulfillment succeeded for session ${session.id}`);
  } else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    console.log(`[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}