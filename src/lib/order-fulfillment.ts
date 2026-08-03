import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase-server';
import crypto from 'crypto';

export interface FulfillmentResult {
  success: boolean;
  alreadyProcessed?: boolean;
  purchase?: any;
  error?: string;
}

/**
 * Idempotently fulfills an order after successful payment on Stripe.
 * Can be safely called from both Stripe Webhooks and the /api/checkout/verify route.
 */
export async function fulfillOrder(sessionId: string): Promise<FulfillmentResult> {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required' };
  }

  try {
    // 1. Retrieve the checkout session from Stripe
    let session: any;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err: any) {
      console.error(`[OrderFulfillment] Failed to retrieve Stripe session ${sessionId}:`, err);
      return { success: false, error: `Invalid payment session: ${err.message}` };
    }

    if (!session) {
      return { success: false, error: 'Payment session not found' };
    }

    // Verify payment status
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      console.warn(`[OrderFulfillment] Session ${sessionId} status is unpaid/incomplete: ${session.payment_status}`);
      return {
        success: false,
        error: `Payment is not completed. Current status: ${session.payment_status}`,
      };
    }

    const metadata = session.metadata || {};
    const programId = metadata.programId;
    const userIdFromMeta = metadata.userId;
    const email = metadata.email || session.customer_email || session.customer_details?.email;
    const name = metadata.name || session.customer_details?.name || '';
    const phone = metadata.phone || session.customer_details?.phone || '';
    const amount = session.amount_total ?? 0;
    const currency = (session.currency || 'aud').toLowerCase();

    if (!programId) {
      console.error(`[OrderFulfillment] Session ${sessionId} missing programId in metadata`);
      return { success: false, error: 'Program ID missing from payment session metadata' };
    }

    const supabase = getServiceSupabase();

    // 2. Check if purchase record for this stripe_session_id already exists (Idempotency)
    const { data: existingPurchase, error: findErr } = await supabase
      .from('purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (findErr) {
      console.warn(`[OrderFulfillment] Error checking existing purchase for session ${sessionId}:`, findErr.message);
    }

    // 3. Resolve user ID (by metadata, or searching profiles/users by email)
    let finalUserId: string | null = userIdFromMeta || null;
    if (!finalUserId && email) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (profile?.id) {
          finalUserId = profile.id;
        } else {
          const { data: userRec } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();
          if (userRec?.id) {
            finalUserId = userRec.id;
          }
        }
      } catch (userLookupErr) {
        console.warn('[OrderFulfillment] Could not resolve user ID by email:', userLookupErr);
      }
    }

    let purchaseRecord = existingPurchase;

    // If purchase already exists, perform necessary backfills/updates
    if (existingPurchase) {
      console.log(`[OrderFulfillment] Purchase already exists for session ${sessionId}`);

      // If user ID was unknown before but resolved now, update user_id in purchases
      if (!existingPurchase.user_id && finalUserId) {
        await supabase
          .from('purchases')
          .update({ user_id: finalUserId })
          .eq('id', existingPurchase.id);
        purchaseRecord.user_id = finalUserId;
      }

      // Ensure profile array updated
      if (finalUserId) {
        await addProgramToUserProfile(supabase, finalUserId, programId);
      }

      return {
        success: true,
        alreadyProcessed: true,
        purchase: purchaseRecord,
      };
    }

    // 4. Create new purchase record
    let agreementToken = '';
    try {
      agreementToken = crypto.randomBytes(32).toString('hex');
    } catch (e) {
      console.error('[OrderFulfillment] Failed to generate secure agreement token:', e);
    }

    const newPurchasePayload = {
      user_id: finalUserId,
      program_id: programId,
      stripe_session_id: sessionId,
      amount: amount,
      currency: currency,
      status: 'completed',
      email: email || '',
      name: name || '',
      phone: phone || '',
      agreementToken: agreementToken || null,
      agreementStatus: 'Pending',
      agreementVersion: 1,
    };

    const { data: insertedData, error: insertErr } = await supabase
      .from('purchases')
      .insert([newPurchasePayload])
      .select()
      .single();

    if (insertErr) {
      console.error('[OrderFulfillment] Error inserting purchase record into Supabase:', insertErr.message, insertErr);
      return {
        success: false,
        error: `Database insertion error: ${insertErr.message}`,
      };
    }

    purchaseRecord = insertedData;
    console.log(`[OrderFulfillment] Successfully recorded purchase ID ${purchaseRecord.id} in Supabase`);

    // 5. Update user profile / users table purchased_programs array
    if (finalUserId) {
      await addProgramToUserProfile(supabase, finalUserId, programId);
    }

    // 6. Subscribe & trigger MailerLite agreement email automation
    await triggerMailerliteEnrollment(supabase, programId, email, name, agreementToken);

    return {
      success: true,
      alreadyProcessed: false,
      purchase: purchaseRecord,
    };
  } catch (err: any) {
    console.error('[OrderFulfillment] Unhandled exception during order fulfillment:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during order fulfillment',
    };
  }
}

/**
 * Helper to update purchased_programs text[] on profiles or users table.
 */
async function addProgramToUserProfile(supabase: any, userId: string, programId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('purchased_programs')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      const current = profile.purchased_programs || [];
      if (!current.includes(programId)) {
        await supabase
          .from('profiles')
          .update({ purchased_programs: [...current, programId] })
          .eq('id', userId);
        console.log(`[OrderFulfillment] Added ${programId} to profiles.purchased_programs for user ${userId}`);
      }
      return;
    }

    const { data: userRec } = await supabase
      .from('users')
      .select('purchased_programs')
      .eq('id', userId)
      .maybeSingle();

    if (userRec) {
      const current = userRec.purchased_programs || [];
      if (!current.includes(programId)) {
        await supabase
          .from('users')
          .update({ purchased_programs: [...current, programId] })
          .eq('id', userId);
        console.log(`[OrderFulfillment] Added ${programId} to users.purchased_programs for user ${userId}`);
      }
    }
  } catch (err) {
    console.warn('[OrderFulfillment] Error updating user profile purchased_programs array:', err);
  }
}

/**
 * Helper to send email / trigger MailerLite automation
 */
async function triggerMailerliteEnrollment(
  supabase: any,
  programId: string,
  email: string | undefined,
  name: string,
  agreementToken: string
) {
  if (!process.env.MAILERLITE_API_KEY || !email) {
    console.warn('[OrderFulfillment] Skipping MailerLite: MAILERLITE_API_KEY or buyer email is missing');
    return;
  }

  try {
    const { data: prog } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .maybeSingle();

    const programTitle = prog?.title || 'SyncwellnessCo Program';
    const programDuration = prog?.duration || '';
    const programFormat = prog?.format || '';
    const programCategory = prog?.category || '';

    const targetGroupId = process.env.MAILERLITE_GROUP_PROGRAM_ENROLLMENT;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://syncwellness-co.vercel.app').replace(/\/$/, '');
    const agreementUrl = agreementToken ? `${siteUrl}/agreement/${agreementToken}` : '';

    const subscriberPayload: any = {
      email: email,
      status: 'active',
      resubscribe: true,
      fields: {
        name: name || '',
        purchased_program: programTitle,
        program_duration: programDuration,
        program_format: programFormat,
        program_category: programCategory,
        agreement_url: agreementUrl,
      },
    };

    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify(subscriberPayload),
    });

    if (!mlRes.ok) {
      const mlErr = await mlRes.json().catch(() => ({}));
      console.error('[OrderFulfillment] MailerLite upsert subscriber error:', mlErr);
      return;
    }

    const subObj = await mlRes.json().catch(() => ({}));
    const subId = subObj?.data?.id;
    console.log(`[OrderFulfillment] Successfully upserted ${email} in MailerLite`);

    if (targetGroupId && subId) {
      // Pre-remove to reset automation trigger if repeat purchase
      try {
        const delRes = await fetch(
          `https://connect.mailerlite.com/api/subscribers/${subId}/groups/${targetGroupId}`,
          {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
            },
          }
        );
        if (delRes.ok) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.warn('[OrderFulfillment] Could not pre-remove subscriber from MailerLite group:', err);
      }

      // Add to group to trigger automation email
      const groupAddRes = await fetch(
        `https://connect.mailerlite.com/api/subscribers/${subId}/groups/${targetGroupId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        }
      );

      if (!groupAddRes.ok) {
        const groupAddErr = await groupAddRes.json().catch(() => ({}));
        console.error('[OrderFulfillment] MailerLite group assignment error:', groupAddErr);
      } else {
        console.log(`[OrderFulfillment] Assigned subscriber ${subId} to group ${targetGroupId}. Email automation triggered.`);
      }
    }
  } catch (err) {
    console.error('[OrderFulfillment] Exception during MailerLite enrollment trigger:', err);
  }
}
