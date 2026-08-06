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

    let query = supabase.from('reviews').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    
    if (programId) query = query.ilike('program_id', `%${programId}%`);
    if (status) query = query.eq('status', status);
    if (featured === 'true') query = query.eq('featured_on_home', true);

    const mapReview = (r: any) => ({
      ...r,
      program_ids: typeof r.program_id === 'string'
        ? r.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    });

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return NextResponse.json({
        data: (data || []).map(mapReview),
        total: count || 0,
        hasMore: (offset + (data?.length || 0)) < (count || 0)
      });
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json((data || []).map(mapReview));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
