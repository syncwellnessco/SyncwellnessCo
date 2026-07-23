import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

      const payload: any = {
        email: purchase.email,
        fields: {
          name: purchase.name || "",
          purchased_program: programTitle,
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
            body: JSON.stringify({ email: purchase.email })
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
              console.log(`Removed subscriber ${subId} from group ${targetGroupId} to prepare for re-addition on resend.`);
            }
          }
        } catch (err) {
          console.warn("Could not pre-remove subscriber from group during resend:", err);
        }

        payload.groups = [targetGroupId];
      }

      console.log(`Resending agreement link via MailerLite to ${purchase.email}...`);

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
        console.error("MailerLite API Error in resend:", mlError);
        return NextResponse.json({ error: "Failed to process resend through MailerLite" }, { status: 520 });
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
