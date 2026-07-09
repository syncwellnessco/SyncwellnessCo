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

    // Create the PaymentIntent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      receipt_email: email || undefined,
      metadata: {
        programId: program.id,
        programSlug: program.slug || '',
        programTitle: program.title,
        email: email || '',
        name: name || '',
        phone: phone || '',
        userId: userId || '',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: price,
      currency: currency.toUpperCase(),
      programTitle: program.title,
    });
  } catch (err: any) {
    console.error('PaymentIntent creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
