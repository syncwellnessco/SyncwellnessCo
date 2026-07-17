import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};
    if ("completed" in body) updateData.completed = body.completed;

    const supabase = await createClient();
    
    // If marking as completed, update the program requirement too
    if (body.completed === true) {
      const { data: booking } = await supabase
        .from("calendly_bookings")
        .select("event_name")
        .eq("id", id)
        .maybeSingle();

      if (booking && booking.event_name) {
        const { data: programs } = await supabase
          .from("programs")
          .select("id, title, pricing");

        if (programs) {
          const matchedProgram = programs.find(p => {
            const cleanTitle = p.title.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
            const cleanEvent = booking.event_name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return cleanEvent.includes(cleanTitle) || cleanTitle.includes(cleanEvent);
          });

          if (matchedProgram) {
            const updatedPricing = {
              ...(matchedProgram.pricing || {}),
              requireConsultant: false
            };

            await supabase
              .from("programs")
              .update({ pricing: updatedPricing })
              .eq("id", matchedProgram.id);
          }
        }
      }
    }

    const { data, error } = await supabase
      .from("calendly_bookings")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("calendly_bookings").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
