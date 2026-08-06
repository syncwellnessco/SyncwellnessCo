import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.user_metadata?.role !== 'admin') {
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
    try {
      revalidatePath('/testimonials');
      revalidatePath('/', 'layout');
    } catch (revErr) {
      console.error("Revalidation error:", revErr);
    }
    return NextResponse.json(resItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    try {
      revalidatePath('/testimonials');
      revalidatePath('/', 'layout');
    } catch (revErr) {
      console.error("Revalidation error:", revErr);
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
