import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Use service role client to bypass RLS since users accepting agreement might not be logged in or have specific auth roles
    const supabase = getServiceSupabase();

    // 1. Fetch the corresponding purchase to validate token
    const { data: purchase, error: fetchErr } = await supabase
      .from("purchases")
      .select("*")
      .eq("agreementToken", token)
      .maybeSingle();

    if (fetchErr || !purchase) {
      console.warn(`Agreement accept attempt failed: Token not found: ${token}`);
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    // 2. Prevent accepting the agreement twice
    if (purchase.agreementStatus === "Accepted") {
      return NextResponse.json({ error: "Agreement already accepted" }, { status: 400 });
    }

    // 3. Update the purchase record to Accepted
    const { error: updateErr } = await supabase
      .from("purchases")
      .update({
        agreementStatus: "Accepted",
        agreementAcceptedAt: new Date().toISOString(),
        agreementIp: ip,
        agreementUserAgent: userAgent
      })
      .eq("agreementToken", token);

    if (updateErr) {
      console.error("Failed to update agreement status in DB:", updateErr.message);
      return NextResponse.json({ error: "Failed to accept agreement. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Agreement acceptance route exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
