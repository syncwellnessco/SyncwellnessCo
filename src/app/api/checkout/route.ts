import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { publicSupabase } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { programId, email, name, phone, userId } = await req.json();

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    // Fetch program details from Supabase to verify the price
    const { data: program, error } = await publicSupabase
      .from('programs')
      .select('*')
      .or(`id.eq.${programId},slug.eq.${programId}`)
      .single();

    if (error || !program) {
      console.error('Error fetching program for checkout:', error);
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Extract price and handle fallbacks
    const pricing = program.pricing || {};


    const price = pricing.salePrice !== undefined && pricing.salePrice !== null
      ? pricing.salePrice 
      : (pricing.price !== undefined && pricing.price !== null ? pricing.price : 599);

    const amountInCents = Math.round(price * 100);
    const currency = 'aud';

    const origin = req.headers.get('origin');
    const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: program.title,
              description: program.shortDescription || 'SyncwellnessCo Coaching Program',
              images: program.hero?.bannerImage ? [program.hero.bannerImage] : [],
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        programId: program.id,
        programSlug: program.slug || '',
        programTitle: program.title,
        email: email || '',
        name: name || '',
        phone: phone || '',
        userId: userId || '',
      },
      success_url: `${siteUrl}${process.env.STRIPE_SUCCESS_PATH || '/success'}?programId=${program.id}&email=${encodeURIComponent(email || '')}&title=${encodeURIComponent(program.title)}&amount=${price}&currency=${currency.toUpperCase()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/programs/${program.slug || program.id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout Session creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
