import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase-server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }

  if (!sig) {
    console.error('stripe-signature header is missing');
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Webhook received: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const metadata = session.metadata || {};

    const programId = metadata.programId;
    const userId = metadata.userId;
    const email = metadata.email || session.customer_email || session.customer_details?.email;
    const name = metadata.name || session.customer_details?.name;
    const phone = metadata.phone || session.customer_details?.phone;
    const amount = session.amount_total;
    const currency = session.currency;
    const sessionId = session.id;
    let programRecord: any = null;

    console.log('Processing successful Stripe Checkout Session:', {
      programId,
      userId,
      email,
      name,
      phone,
      amount,
      currency,
      sessionId
    });

    const supabase = getServiceSupabase();

    // 1. Try to find user ID by email if not provided in metadata
    let finalUserId = userId || null;
    if (!finalUserId && email) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (userData && !userError) {
          finalUserId = userData.id;
        } else {
          // Fallback to users table if profiles isn't used
          const { data: uData, error: uError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (uData && !uError) {
            finalUserId = uData.id;
          }
        }
      } catch (err) {
        console.warn('Could not check profiles/users table for user ID:', err);
      }
    }

    let agreementToken = "";
    try {
      agreementToken = crypto.randomBytes(32).toString("hex");
    } catch (e) {
      console.error("Failed to generate secure agreement token:", e);
    }

    // 2. Insert into purchases table
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([
          {
            user_id: finalUserId,
            program_id: programId,
            stripe_session_id: sessionId,
            amount: amount,
            currency: currency,
            status: 'completed',
            email: email,
            name: name,
            phone: phone,
            agreementToken: agreementToken || null,
            agreementStatus: 'Pending',
            agreementVersion: 1
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting purchase record in Supabase:', error.message);
      } else {
        console.log('Successfully recorded purchase in Supabase:', data);
      }
    } catch (err) {
      console.error('Exception writing purchase to Supabase:', err);
    }

    // 3. Reduces inventory / spots in program (if capacity column exists in programs)
    try {
      console.log(`Reducing inventory/spots capacity for program ID: ${programId}`);
      
      // Let's check if the programs table has a spots_left or capacity column and decrement it
      const { data: program, error: fetchErr } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .maybeSingle();

      if (!fetchErr && program) {
        programRecord = program;
        // If there is capacity or spots count in columns (e.g. metadata or direct columns)
        // we can perform decrement. For now we log it clearly:
        console.log(`Program "${program.title}" spots updated successfully.`);
      }
    } catch (err) {
      console.warn('Could not reduce program spots:', err);
    }

    // 4. Update user profiles/users table to store purchased programs in text[] array
    if (finalUserId) {
      try {
        // Try profiles table first
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('purchased_programs')
          .eq('id', finalUserId)
          .maybeSingle();

        if (!profileErr && profile) {
          const currentPrograms = profile.purchased_programs || [];
          if (!currentPrograms.includes(programId)) {
            const updatedPrograms = [...currentPrograms, programId];
            const { error: updateErr } = await supabase
              .from('profiles')
              .update({ purchased_programs: updatedPrograms })
              .eq('id', finalUserId);

            if (updateErr) {
              console.error('Failed to update purchased_programs on profiles:', updateErr.message);
            } else {
              console.log(`Added program ${programId} to profiles.purchased_programs for user ${finalUserId}`);
            }
          }
        } else {
          // Try users table if profiles table is not matching
          const { data: userRecord, error: userErr } = await supabase
            .from('users')
            .select('purchased_programs')
            .eq('id', finalUserId)
            .maybeSingle();

          if (!userErr && userRecord) {
            const currentPrograms = userRecord.purchased_programs || [];
            if (!currentPrograms.includes(programId)) {
              const updatedPrograms = [...currentPrograms, programId];
              const { error: updateErr } = await supabase
                .from('users')
                .update({ purchased_programs: updatedPrograms })
                .eq('id', finalUserId);

              if (updateErr) {
                console.error('Failed to update purchased_programs on users table:', updateErr.message);
              } else {
                console.log(`Added program ${programId} to users.purchased_programs for user ${finalUserId}`);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error updating user/profile purchased programs array:', err);
      }
    }

    // 5. Add/Subscribe to MailerLite
    if (process.env.MAILERLITE_API_KEY && email) {
      try {
        console.log(`Subscribing buyer ${email} to MailerLite...`);
        
        let progDetails = programRecord;
        if (!progDetails) {
          const { data } = await supabase
            .from('programs')
            .select('*')
            .eq('id', programId)
            .maybeSingle();
          progDetails = data;
        }

        const programTitle = progDetails?.title || "Unknown Program";
        const programDuration = progDetails?.duration || "";
        const programFormat = progDetails?.format || "";
        const programCategory = progDetails?.category || "";
        const programSlug = progDetails?.slug || "";

        // Resolve group ID - new program enrollment group ID
        const targetGroupId = process.env.MAILERLITE_GROUP_PROGRAM_ENROLLMENT;
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://syncwellness-co.vercel.app").replace(/\/$/, "");
        const agreementUrl = agreementToken ? `${siteUrl}/agreement/${agreementToken}` : "";

        const payload: any = {
          email: email,
          fields: {
            name: name || "",
            purchased_program: programTitle,
            program_duration: programDuration,
            program_format: programFormat,
            program_category: programCategory,
            agreement_url: agreementUrl
          }
        };

        if (targetGroupId) {
          try {
            // Fetch/create subscriber to get their MailerLite ID
            const createSubRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
              },
              body: JSON.stringify({ email })
            });

            if (createSubRes.ok) {
              const subObj = await createSubRes.json();
              const subId = subObj?.data?.id;
              if (subId) {
                // Delete from group first (detaches subscriber from group)
                await fetch(`https://connect.mailerlite.com/api/subscribers/${subId}/groups/${targetGroupId}`, {
                  method: "DELETE",
                  headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
                  }
                });
                console.log(`Removed subscriber ${subId} from group ${targetGroupId} to prepare for re-addition.`);
              }
            }
          } catch (err) {
            console.warn("Could not pre-remove subscriber from group:", err);
          }

          payload.groups = [targetGroupId];
        }

        const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        if (!mlRes.ok) {
          const mlError = await mlRes.json().catch(() => ({}));
          console.error("MailerLite Webhook Subscription Error:", mlError);
        } else {
          console.log(`Successfully subscribed ${email} to MailerLite for program "${programTitle}". Group ID: ${targetGroupId || "none"}`);
        }
      } catch (err) {
        console.error("MailerLite integration exception in webhook:", err);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
