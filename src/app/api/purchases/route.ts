import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET all purchases (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .order("createdat", { ascending: false });

    // Gracefully handle missing table
    if (error) {
      console.warn("Could not fetch purchases:", error.message);
      return NextResponse.json([]);
    }

    // Map database fields to standard camelCase/format if needed
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      createdAt: item.createdat || item.createdAt
    }));

    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Purchases API Error:", err);
    return NextResponse.json([]);
  }
}
