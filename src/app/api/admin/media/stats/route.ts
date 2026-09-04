import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getMediaStorageStats } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { session },
    } = await authClient.auth.getSession();

    if (!session || session.user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getMediaStorageStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Media stats API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve media storage stats" },
      { status: 500 }
     );
  }
}
