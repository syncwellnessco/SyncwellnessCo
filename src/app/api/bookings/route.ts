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

    const { error } = await supabase
      .from("calendly_bookings")
      .insert([
        {
          invitee_uri: inviteeUri,
          event_name: programName ? `1:1 Consultation: ${programName}` : "1:1 Consultation Call",
          name: name || "Calendly User",
          email: email,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          timezone: "Local",
          join_url: "",
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

