import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET all quiz responses (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let { data, error } = await supabase
      .from("quiz_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("created_at")) {
      const fallback = await supabase
        .from("quiz_responses")
        .select("*")
        .order("createdat", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.warn("Could not fetch quiz_responses", error.message);
      return NextResponse.json([]);
    }

    const mappedData = (data || []).map((item: any) => ({
      ...item,
      createdAt: item.created_at || item.createdat || item.createdAt,
      phoneNumber: item.phone_number || item.phoneNumber,
      countryCode: item.country_code || item.countryCode,
      programId: item.program_id || item.programId,
      programTitle: item.program_title || item.programTitle,
    }));

    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Quiz Responses API GET Error:", err);
    return NextResponse.json([]);
  }
}

// POST new quiz response (from frontend quiz submission)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phoneNumber, 
      countryCode, 
      answers, 
      score, 
      classification, 
      programId, 
      programTitle 
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields: name and email are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quiz_responses")
      .insert([
        {
          name,
          email,
          phone_number: phoneNumber || null,
          country_code: countryCode || null,
          answers: answers || {},
          score: score || 0,
          classification: classification || "Unknown",
          program_id: programId || null,
          program_title: programTitle || null
        }
      ])
      .select();

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: `Database Error: ${error?.message || "Unknown error"}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (err: any) {
    console.error("Quiz Responses API POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
