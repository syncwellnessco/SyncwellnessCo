import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET all ebook requests (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ebook_requests")
      .select("*")
      .order("createdat", { ascending: false });

    if (error) {
      console.warn("Could not fetch ebook_requests", error.message);
      return NextResponse.json([]);
    }

    const mappedData = (data || []).map((item: any) => ({
      ...item,
      createdAt: item.createdat || item.createdAt,
      ebookName: item.ebookname || item.ebookName
    }));

    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Ebooks API Error:", err);
    return NextResponse.json([]);
  }
}

// POST new ebook request (from frontend)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, ebookName, name, phoneNumber, countryCode } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // 1. Save to Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ebook_requests")
      .insert([
        {
          email,
          ebookname: ebookName,
          status: "pending",
          phone_number: phoneNumber,
          country_code: countryCode
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 400 });
    }

    // 2. Add to MailerLite
    if (process.env.MAILERLITE_API_KEY) {
      try {
        const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
          body: JSON.stringify({
            email,
            fields: {
              name: name || "",
              phone: phoneNumber ? `${countryCode || '+91'}${phoneNumber}` : ""
            },
            groups: process.env.MAILERLITE_GROUP_ID ? [process.env.MAILERLITE_GROUP_ID] : []
          }),
        });
        
        if (!mlRes.ok) {
           console.error("MailerLite Error:", await mlRes.text());
        }
      } catch(e) {
        console.error("MailerLite exception", e);
      }
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
