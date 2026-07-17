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

    let query = supabase
      .from("calendly_bookings")
      .select("*")
      .ilike("email", email);

    if (programTitle) {
      query = query.ilike("event_name", `%${programTitle}%`);
    }

    const { data: bookings, error } = await query
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completed = bookings ? bookings.some((b: any) => b.completed) : false;
    const latestBooking = bookings && bookings.length > 0 ? bookings[0] : null;

    return NextResponse.json({
      completed,
      booking: latestBooking
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
