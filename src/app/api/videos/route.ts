import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  let query = supabase.from('video_testimonials').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (featured === 'true') {
    query = query.eq('featured_on_home', true);
  }
  
  const programId = searchParams.get('program_id') || searchParams.get('programId');
  if (programId) {
    query = query.ilike('program_id', `%${programId}%`);
  }

  const mapVideo = (v: any) => ({
    ...v,
    program_ids: typeof v.program_id === 'string'
      ? v.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  });

  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data: (data || []).map(mapVideo),
      total: count || 0,
      hasMore: (offset + (data?.length || 0)) < (count || 0)
    });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data || []).map(mapVideo));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { video_url, caption, name, program_ids, featured_on_home } = json;
    const selectedProgramIds = Array.isArray(program_ids) ? program_ids.filter(Boolean) : [];

    const { data, error } = await supabase
      .from('video_testimonials')
      .insert({
        video_url,
        caption,
        name,
        program_id: selectedProgramIds.join(','),
        featured_on_home: featured_on_home !== undefined ? featured_on_home : true
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      data.program_ids = typeof data.program_id === 'string'
        ? data.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
