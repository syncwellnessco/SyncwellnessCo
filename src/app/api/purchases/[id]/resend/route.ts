import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, createClient } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Purchase ID is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch the purchase details
    const { data: purchase, error: fetchErr } = await supabase
      .from("purchases")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !purchase) {
      return NextResponse.json({ error: "Purchase record not found" }, { status: 404 });
    }

    if (purchase.agreementStatus === "Accepted") {
      return NextResponse.json({ error: "Coaching agreement has already been accepted" }, { status: 400 });
    }

    let agreementToken = purchase.agreementToken;
    if (!agreementToken) {
      try {
        const crypto = require("crypto");
        agreementToken = crypto.randomBytes(32).toString("hex");
        const { error: updateErr } = await supabase
          .from("purchases")
          .update({ agreementToken })
          .eq("id", id);

        if (updateErr) {
          console.error("Failed to generate and save agreementToken on resend:", updateErr);
          return NextResponse.json({ error: "Failed to generate signing token" }, { status: 500 });
        }
      } catch (tokenGenErr) {
        console.error("Crypto token generation error:", tokenGenErr);
        return NextResponse.json({ error: "Token generation exception" }, { status: 500 });
      }
    }

    // 2. Fetch the program details for title mapping
    const { data: program } = await supabase
      .from("programs")
      .select("title")
      .eq("id", purchase.program_id)
      .maybeSingle();

    const programTitle = program?.title || "our coaching program";

    // 3. Trigger subscriber creation/update in Mailerlite (which will fire the automation workflow)
    if (process.env.MAILERLITE_API_KEY && purchase.email) {
      const targetGroupId = process.env.MAILERLITE_GROUP_PROGRAM_ENROLLMENT;
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://syncwellness-co.vercel.app").replace(/\/$/, "");
      const agreementUrl = agreementToken ? `${siteUrl}/agreement/${agreementToken}` : "";

      // Step 1: Upsert the subscriber's fields/status only.
      // IMPORTANT: we deliberately do NOT pass `groups` here. MailerLite's
      // "subscriber joins a group" automation does not reliably fire when a
      // group is assigned via this bulk upsert endpoint - it only fires
      // reliably from the dedicated group-assignment endpoint used below.
      const subscriberPayload: any = {
        email: purchase.email,
        status: "active",
        resubscribe: true,
        fields: {
          name: purchase.name || "",
          purchased_program: programTitle,
          agreement_url: agreementUrl
        }
      };

      console.log(`Resending agreement link via MailerLite to ${purchase.email}...`);

      const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
        },
        body: JSON.stringify(subscriberPayload)
      });

      if (!mlRes.ok) {
        const mlError = await mlRes.json().catch(() => ({}));
        console.error("MailerLite API Error in resend:", mlError);
        return NextResponse.json({ error: "Failed to process resend through MailerLite" }, { status: 520 });
      }

      const subObj = await mlRes.json().catch(() => ({}));
      const subId = subObj?.data?.id;

      if (targetGroupId && subId) {
        // Remove first so that a subscriber already in this group is treated
        // as freshly joining when re-added below, so the automation re-fires.
        try {
          const delRes = await fetch(`https://connect.mailerlite.com/api/subscribers/${subId}/groups/${targetGroupId}`, {
            method: "DELETE",
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
            }
          });
          if (delRes.ok) {
            console.log(`Removed subscriber ${subId} from group ${targetGroupId} to prepare for re-addition on resend.`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        } catch (err) {
          console.warn("Could not pre-remove subscriber from group during resend:", err);
        }

        // Step 2: Explicitly assign to the group via the dedicated
        // endpoint. THIS is what actually triggers the MailerLite
        // automation email - not the `groups` field on the upsert above.
        const groupAddRes = await fetch(`https://connect.mailerlite.com/api/subscribers/${subId}/groups/${targetGroupId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`
          }
        });

        if (!groupAddRes.ok) {
          const groupAddErr = await groupAddRes.json().catch(() => ({}));
          console.error("MailerLite group assignment error on resend (automation will not fire):", groupAddErr);
          return NextResponse.json({ error: "Failed to assign subscriber to group in MailerLite" }, { status: 520 });
        } else {
          console.log(`Assigned subscriber ${subId} to group ${targetGroupId} on resend. Automation email should now trigger.`);
        }
      }
    } else {
      return NextResponse.json({ error: "MailerLite integration keys are missing" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Coaching Agreement resend route exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}