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

    const { data: booking, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      completed: booking ? booking.completed : false,
      booking: booking || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
