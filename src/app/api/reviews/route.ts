import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { programId, name, testimonial, beforeImage, afterImage, rating } = body;

    if (!programId || !name || !testimonial) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          program_id: programId,
          name,
          testimonial,
          before_image: beforeImage,
          after_image: afterImage,
          rating: rating || 5,
          status: body.status || 'published',
          featured_on_home: body.featured_on_home ?? false
        }
      ])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data: data?.[0] });
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
    
    if (programId) query = query.eq('program_id', programId);
    if (status) query = query.eq('status', status);
    if (featured === 'true') query = query.eq('featured_on_home', true);

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return NextResponse.json({
        data: data || [],
        total: count || 0,
        hasMore: (offset + (data?.length || 0)) < (count || 0)
      });
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

