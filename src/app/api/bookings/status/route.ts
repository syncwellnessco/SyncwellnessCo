import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const programId = searchParams.get("programId");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const supabase = await createClient();

    let programTitle = "";
    if (programId) {
      const { data: program } = await supabase
        .from("programs")
        .select("title")
        .or(`id.eq.${programId},slug.eq.${programId}`)
        .single();
      if (program) {
        programTitle = program.title;
      }
    }

    const { data: bookings, error } = await supabase
      .from("calendly_bookings")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completed = bookings ? bookings.some((b: any) => b.completed === true) : false;
    
    // Find the latest booking that is either generic or matches this programTitle
    let latestBooking = null;
    if (bookings && bookings.length > 0) {
      if (programTitle) {
        const cleanTitle = programTitle.toLowerCase();
        latestBooking = bookings.find((b: any) => {
          const name = (b.event_name || "").toLowerCase();
          return name.includes(cleanTitle) || 
                 name.includes("consultation") || 
                 name.includes("discovery") || 
                 name.includes("call") || 
                 name.includes("meeting") || 
                 name.includes("30min");
        });
      }
      if (!latestBooking) {
        latestBooking = bookings[0];
      }
    }

    return NextResponse.json({
      completed,
      booking: latestBooking
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
