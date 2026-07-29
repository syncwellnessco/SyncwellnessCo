import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET all purchases (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getServiceSupabase();
    let { data, error } = await supabase
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("created_at")) {
      const fallback = await supabase
        .from("purchases")
        .select("*")
        .order("createdat", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    // Gracefully handle missing table
    if (error) {
      console.warn("Could not fetch purchases:", error.message);
      return NextResponse.json([]);
    }

    // Map database fields to standard camelCase/format if needed
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      createdAt: item.created_at || item.createdat || item.createdAt
    }));

    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Purchases API Error:", err);
    return NextResponse.json([]);
  }
}

