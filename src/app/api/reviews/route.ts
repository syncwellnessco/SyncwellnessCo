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
          status: 'published'
        }
      ]);

    if (error) throw error;
    return NextResponse.json({ success: true });
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

    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    
    if (programId) query = query.eq('program_id', programId);
    if (status) query = query.eq('status', status);
    if (featured === 'true') query = query.eq('featured_on_home', true);

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
