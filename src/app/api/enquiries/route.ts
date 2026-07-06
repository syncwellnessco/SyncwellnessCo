import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET all enquiries (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_enquiries")
      .select("*")
      .order("createdat", { ascending: false });

    // Gracefully handle missing table
    if (error) {
      console.warn("Could not fetch enquiries", error.message);
      return NextResponse.json([]);
    }

    // Map database createdat to createdAt for frontend
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      createdAt: item.createdat || item.createdAt
    }));

    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Enquiries API Error:", err);
    return NextResponse.json([]);
  }
}

// POST new enquiry (from frontend contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_enquiries")
      .insert([
        {
          name,
          email,
          subject,
          message,
          status: "new",
        }
      ])
      .select();

    if (error) {
      // Return 400 so the frontend fetch can throw and user gets a clear alert
      return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
