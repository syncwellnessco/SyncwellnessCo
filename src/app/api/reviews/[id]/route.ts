import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await props.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('reviews')
      .update(body)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
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
