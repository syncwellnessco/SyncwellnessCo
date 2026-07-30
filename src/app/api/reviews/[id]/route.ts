import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await request.json();
    const updates: any = { ...body };

    if (Array.isArray(body.program_ids)) {
      updates.program_id = body.program_ids.filter(Boolean).join(',');
    }

    delete updates.program_ids;
    delete updates.programIds;
    delete updates.programId;
    delete updates.beforeImage;
    delete updates.afterImage;
    delete updates.published;

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    const resItem = data?.[0];
    if (resItem) {
      resItem.program_ids = typeof resItem.program_id === 'string'
        ? resItem.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    return NextResponse.json(resItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
