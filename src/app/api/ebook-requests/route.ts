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

    // 1. Check for duplicates
    const supabase = await createClient();
    const { data: existingRequest } = await supabase
      .from("ebook_requests")
      .select("id")
      .eq("email", email)
      .eq("ebookname", ebookName)
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: "You have already requested this Ebook! Please check your inbox (and spam folder) for the download link." },
        { status: 409 }
      );
    }

    // 2. Save to Supabase
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

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: `Database Error: ${error?.message || "Unknown error"}` }, { status: 400 });
    }

    const recordId = data[0].id;
    let finalStatus = "sent";

    // 3. Add to MailerLite
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
              phone: phoneNumber ? `${countryCode || '+61'}${phoneNumber}` : ""
            },
            groups: process.env.MAILERLITE_GROUP_ID ? [process.env.MAILERLITE_GROUP_ID] : []
          }),
        });
        
        if (!mlRes.ok) {
           const mlError = await mlRes.text();
           console.error("MailerLite Error:", mlError);
           finalStatus = `failed: ${mlError.substring(0, 50)}`;
        }
      } catch(e: any) {
        console.error("MailerLite exception", e);
        finalStatus = `failed: Exception ${e.message?.substring(0, 50)}`;
      }
    } else {
      finalStatus = "failed: No MAILERLITE_API_KEY configured";
    }

    // Update status in database
    await supabase.from("ebook_requests").update({ status: finalStatus }).eq("id", recordId);

    return NextResponse.json({ success: true, data: { ...data[0], status: finalStatus } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
