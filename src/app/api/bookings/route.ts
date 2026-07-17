import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteeUri = searchParams.get("invitee_uri");
    const email = searchParams.get("email");

    const supabase = await createClient();

    if (inviteeUri) {
      const { data, error } = await supabase
        .from("calendly_bookings")
        .select("*")
        .eq("invitee_uri", inviteeUri)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ found: false });
      }

      return NextResponse.json({ found: true, details: data });
    } else if (email) {
      const { data, error } = await supabase
        .from("calendly_bookings")
        .select("*")
        .ilike("email", email)
        .eq("completed", false)
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ found: false });
      }

      return NextResponse.json({ found: true, details: data });
    } else {
      // Get all bookings for admin dashboard
      const { data, error } = await supabase
        .from("calendly_bookings")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteeUri, email, name, programName } = body;

    if (!inviteeUri || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if it already exists to avoid duplicates
    const { data: existing } = await supabase
      .from("calendly_bookings")
      .select("id")
      .eq("invitee_uri", inviteeUri)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    // Default fallback values
    let eventName = programName ? `1:1 Consultation: ${programName}` : "1:1 Consultation Call";
    let startTime = new Date().toISOString();
    let endTime = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    let timezone = "Local";
    let joinUrl = "";
    let finalEmail = email;
    let finalName = name || "Calendly User";

    // Query Calendly API for real meeting details
    const apiKey = process.env.CALENDLY_API_KEY || process.env.CALENDLY_TOKEN;
    if (apiKey && inviteeUri) {
      try {
        console.log("Fetching Calendly invitee details in POST API:", inviteeUri);
        const inviteeRes = await fetch(inviteeUri, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        });

        if (inviteeRes.ok) {
          const inviteeData = await inviteeRes.json();
          if (inviteeData && inviteeData.resource) {
            const invitee = inviteeData.resource;
            finalEmail = invitee.email || finalEmail;
            finalName = invitee.name || finalName;
            timezone = invitee.timezone || timezone;

            const eventUri = invitee.event;
            if (eventUri) {
              console.log("Fetching Calendly event details in POST API:", eventUri);
              const eventRes = await fetch(eventUri, {
                headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
                }
              });

              if (eventRes.ok) {
                const eventData = await eventRes.json();
                if (eventData && eventData.resource) {
                  const eventResrc = eventData.resource;
                  eventName = eventResrc.name || eventName;
                  startTime = eventResrc.start_time || startTime;
                  endTime = eventResrc.end_time || endTime;
                  if (eventResrc.location) {
                    joinUrl = eventResrc.location.join_url || eventResrc.location.location || "";
                  }
                  console.log("Successfully retrieved Calendly details on client fallback POST:", { eventName, startTime, timezone, joinUrl });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Calendly details in POST API:", err);
      }
    }

    const { error } = await supabase
      .from("calendly_bookings")
      .insert([
        {
          invitee_uri: inviteeUri,
          event_name: eventName,
          name: finalName,
          email: finalEmail,
          start_time: startTime,
          end_time: endTime,
          timezone: timezone,
          join_url: joinUrl,
          completed: false
        }
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

