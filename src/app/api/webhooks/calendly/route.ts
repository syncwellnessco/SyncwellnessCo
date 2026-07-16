import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

    // Optional webhook signature verification for production security
    if (webhookSecret) {
      const signatureHeader = request.headers.get("Calendly-Webhook-Signature");
      if (!signatureHeader) {
        console.error("Calendly Webhook Error: Missing signature header but CALENDLY_WEBHOOK_SIGNING_KEY is configured.");
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      try {
        const parts = signatureHeader.split(",");
        const timestampPart = parts.find(p => p.trim().startsWith("t="));
        const signaturePart = parts.find(p => p.trim().startsWith("v1="));

        if (!timestampPart || !signaturePart) {
          throw new Error("Invalid signature format");
        }

        const timestamp = timestampPart.split("=")[1];
        const signature = signaturePart.split("=")[1];

        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(`${timestamp}.${rawBody}`)
          .digest("hex");

        const isVerified = crypto.timingSafeEqual(
          Buffer.from(signature, "hex"),
          Buffer.from(expectedSignature, "hex")
        );

        if (!isVerified) {
          console.error("Calendly Webhook Error: Signature mismatch.");
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
        
        // Optional: Replay attack prevention (5 minutes tolerance)
        const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
        if (age > 300) {
          console.error(`Calendly Webhook Error: Timestamp is too old (${age}s). Possible replay attack.`);
          return NextResponse.json({ error: "Replay window exceeded" }, { status: 401 });
        }
      } catch (err: any) {
        console.error("Calendly Webhook Signature Verification Exception:", err);
        return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
      }
    } else {
      console.warn("WARNING: CALENDLY_WEBHOOK_SIGNING_KEY is not configured. Skipping webhook signature verification.");
    }

    const body = JSON.parse(rawBody);
    console.log("Calendly Webhook Received:", JSON.stringify(body));

    const eventType = body.event;
    const payload = body.payload;
    if (!payload) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const inviteeUri = payload.uri;
    if (!inviteeUri) {
      return NextResponse.json({ error: "Missing invitee URI" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Handle invitee cancellation
    if (eventType === "invitee.canceled" || eventType === "invitee_canceled") {
      console.log(`Handling cancellation for invitee: ${inviteeUri}`);
      const { error } = await supabase
        .from("calendly_bookings")
        .delete()
        .eq("invitee_uri", inviteeUri);

      if (error) {
        console.error("Error deleting canceled booking from db:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Booking removed successfully" });
    }

    // Handle invitee creation
    if (eventType === "invitee.created" || eventType === "invitee_created") {
      const email = payload.email;
      const name = payload.name;
      const timezone = payload.timezone;
      
      // Determine the event URI dynamically based on payload structure
      let eventUri = "";
      if (typeof payload.event === "string") {
        eventUri = payload.event;
      } else if (payload.event && typeof payload.event.uri === "string") {
        eventUri = payload.event.uri;
      } else if (payload.scheduled_event) {
        if (typeof payload.scheduled_event === "string") {
          eventUri = payload.scheduled_event;
        } else if (typeof payload.scheduled_event.uri === "string") {
          eventUri = payload.scheduled_event.uri;
        }
      }

      // Default fallback details
      let eventName = "1:1 Consultation Call";
      let startTime = payload.scheduled_event?.start_time || null;
      let endTime = payload.scheduled_event?.end_time || null;
      let joinUrl = "";

      if (payload.scheduled_event && payload.scheduled_event.location) {
        joinUrl = payload.scheduled_event.location.join_url || payload.scheduled_event.location.location || "";
      }

      // Fetch full details if API key is provided
      const apiKey = process.env.CALENDLY_API_KEY || process.env.CALENDLY_TOKEN;
      if (apiKey && eventUri) {
        try {
          console.log("Fetching Calendly event details from API:", eventUri);
          const response = await fetch(eventUri, {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.resource) {
              const resource = data.resource;
              eventName = resource.name || eventName;
              startTime = resource.start_time || startTime;
              endTime = resource.end_time || endTime;
              if (resource.location) {
                joinUrl = resource.location.join_url || resource.location.location || "";
              }
              console.log("Successfully fetched event details from API:", { eventName, startTime, endTime, joinUrl });
            }
          } else {
            console.error(`Failed to fetch Calendly event details from API: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.error("Error fetching Calendly event details from API:", err);
        }
      } else {
        console.log("CALENDLY_API_KEY is not configured or eventUri is missing. Using payload defaults.");
      }

      if (!email) {
        return NextResponse.json({ error: "Missing email info" }, { status: 400 });
      }

      // Check if booking already exists to avoid unique constraint violations
      const { data: existingBooking, error: checkError } = await supabase
        .from("calendly_bookings")
        .select("id, completed")
        .eq("invitee_uri", inviteeUri)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing booking:", checkError.message);
      }

      let error = null;

      if (existingBooking) {
        console.log(`Updating existing booking for invitee: ${inviteeUri}`);
        const { error: updateError } = await supabase
          .from("calendly_bookings")
          .update({
            event_uri: eventUri || null,
            event_name: eventName,
            name: name || "Calendly User",
            email: email,
            timezone: timezone || null,
            start_time: startTime || null,
            end_time: endTime || null,
            join_url: joinUrl || null
          })
          .eq("invitee_uri", inviteeUri);
        error = updateError;
      } else {
        console.log(`Inserting new booking for invitee: ${inviteeUri}`);
        const { error: insertError } = await supabase
          .from("calendly_bookings")
          .insert([
            {
              invitee_uri: inviteeUri,
              event_uri: eventUri || null,
              event_name: eventName,
              name: name || "Calendly User",
              email: email,
              timezone: timezone || null,
              start_time: startTime || null,
              end_time: endTime || null,
              join_url: joinUrl || null,
              completed: false
            }
          ]);
        error = insertError;
      }

      if (error) {
        console.error("Error saving Calendly booking to db:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Ignore other event types
    return NextResponse.json({ received: true, ignored: true });
  } catch (error: any) {
    console.error("Calendly Webhook Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

