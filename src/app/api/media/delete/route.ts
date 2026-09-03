import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { deleteFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || session.user?.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing object key or url" }, { status: 400 });
    }

    const result = await deleteFromR2(key);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file from storage." },
      { status: 500 }
    );
  }
}
