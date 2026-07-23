import { NextResponse } from "next/server";
import { getServiceSupabase, createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    if (!session || session.user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Parallel count & limit queries
    const [
      enquiriesCountRes,
      ebooksCountRes,
      programsCountRes,
      reviewsCountRes,
      purchasesCountRes,
      recentPurchasesRes,
      recentEnquiriesRes,
      recentEbooksRes
    ] = await Promise.all([
      // Counts
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("ebook_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("programs").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      
      // Revenue calculation requires completed purchases amounts
      supabase.from("purchases").select("amount").in("status", ["completed", "succeeded"]),

      // Top 4 recent lists
      supabase.from("purchases").select("id, name, program_id, amount, createdat").order("createdat", { ascending: false }).limit(4),
      supabase.from("enquiries").select("id, name, subject, createdat").eq("status", "new").order("createdat", { ascending: false }).limit(4),
      supabase.from("ebook_requests").select("id, email, ebookname, createdat").eq("status", "pending").order("createdat", { ascending: false }).limit(4)
    ]);

    const enquiriesCount = enquiriesCountRes.count || 0;
    const ebooksCount = ebooksCountRes.count || 0;
    const activeProgramsCount = programsCountRes.count || 0;
    const pendingReviewsCount = reviewsCountRes.count || 0;

    const completedPurchases = purchasesCountRes.data || [];
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + (p.amount / 100), 0);

    return NextResponse.json({
      counts: {
        enquiries: enquiriesCount,
        ebooks: ebooksCount,
        programs: activeProgramsCount,
        reviews: pendingReviewsCount,
        revenue: totalRevenue
      },
      recent: {
        purchases: (recentPurchasesRes.data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          program_id: p.program_id,
          amount: p.amount,
          createdAt: p.createdat
        })),
        enquiries: (recentEnquiriesRes.data || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          subject: e.subject,
          createdAt: e.createdat
        })),
        ebooks: (recentEbooksRes.data || []).map((eb: any) => ({
          id: eb.id,
          email: eb.email,
          ebookName: eb.ebookname || "General Guide",
          createdAt: eb.createdat
        }))
      }
    });
  } catch (err: any) {
    console.error("Admin summary endpoint error:", err);
    return NextResponse.json({ error: "Failed to generate admin summary data" }, { status: 500 });
  }
}
