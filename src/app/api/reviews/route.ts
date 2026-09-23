import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, testimonial, program_ids, programIds, programId, beforeImage, afterImage, rating } = body;

    const rawProgramIds = Array.isArray(program_ids) ? program_ids : (Array.isArray(programIds) ? programIds : (programId ? [programId] : []));
    const selectedProgramIds = rawProgramIds.map((s: string) => s.trim()).filter(Boolean);

    if (selectedProgramIds.length === 0 || !name || !testimonial) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          program_id: selectedProgramIds.join(','),
          name,
          testimonial,
          before_image: body.before_image ?? beforeImage ?? null,
          after_image: body.after_image ?? afterImage ?? null,
          rating: rating || 5,
          status: body.status || 'published',
          featured_on_home: body.featured_on_home ?? false
        }
      ])
      .select();

    if (error) throw error;
    const resData = data?.[0];
    if (resData) {
      resData.program_ids = typeof resData.program_id === 'string'
        ? resData.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    try {
      revalidatePath('/testimonials');
      revalidatePath('/', 'layout');
    } catch (revErr) {
      console.error("Revalidation error:", revErr);
    }
    return NextResponse.json({ success: true, data: resData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let query = supabase.from('reviews').select('*', { count: 'exact' });
    
    if (programId) query = query.ilike('program_id', `%${programId}%`);
    if (status) query = query.eq('status', status);
    if (featured === 'true') query = query.eq('featured_on_home', true);

    const normalizeMediaUrl = (url?: string | null) => {
      if (!url) return url;
      const baseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "https://media.syncwellnessco.com").replace(/\/+$/, "");
      if (baseUrl && url.includes(".r2.dev/")) {
        const key = url.split(".r2.dev/")[1];
        return `${baseUrl}/${key}`;
      }
      return url;
    };

    const mapReview = (r: any) => ({
      ...r,
      before_image: normalizeMediaUrl(r.before_image),
      after_image: normalizeMediaUrl(r.after_image),
      program_ids: typeof r.program_id === 'string'
        ? r.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    });

    const { data, error, count } = await query;
    if (error) throw error;

    const mapped = (data || []).map(mapReview);

    // Reviews with images should be on top, followed by reviews without images, newest first within each group
    const hasImage = (r: any) => Boolean((r.before_image && r.before_image.trim()) || (r.after_image && r.after_image.trim()));
    const sorted = mapped.sort((a: any, b: any) => {
      const aImg = hasImage(a);
      const bImg = hasImage(b);
      if (aImg && !bImg) return -1;
      if (!aImg && bImg) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
      const paged = sorted.slice(offset, offset + limit);

      return NextResponse.json({
        data: paged,
        total: count || sorted.length,
        hasMore: (offset + paged.length) < (count || sorted.length)
      });
    }

    return NextResponse.json(sorted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
