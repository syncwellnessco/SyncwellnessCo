import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { programId, programName } = await req.json();

    // In a real application, you'd map programId to a Stripe Price ID or amount.
    // For this demonstration, we'll create a dynamic line item based on programName.
    // Assuming a default of $599 if not specified, but you'd normally look this up in your DB/config.
    let priceAmount = 59900; // $599.00
    
    if (programId === 'gut-cleanse') priceAmount = 14900;
    else if (programId === 'metabolic-kickstarter') priceAmount = 24900;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: programName || 'Program Enrollment',
              description: 'SyncWellnessCo Coaching Program',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/programs/${programId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
