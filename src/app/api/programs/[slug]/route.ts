import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

type RouteContext = { params: Promise<{ slug: string }> };

function mapDbToProgram(row: any): Program {
  if (!row) return {} as Program;
  return {
    ...row,
    shortDescription: row.short_description !== undefined ? row.short_description : (row.shortdescription !== undefined ? row.shortdescription : row.shortDescription),
    problemsSolved: row.problems_solved !== undefined ? row.problems_solved : (row.problemssolved !== undefined ? row.problemssolved : row.problemsSolved),
    createdAt: row.created_at !== undefined ? row.created_at : (row.createdat !== undefined ? row.createdat : row.createdAt),
    updatedAt: row.updated_at !== undefined ? row.updated_at : (row.updatedat !== undefined ? row.updatedat : row.updatedAt),
    showOnHome: row.show_on_home !== undefined ? row.show_on_home : (row.showonhome !== undefined ? row.showonhome : row.showOnHome),
  };
}

function mapProgramToDb(program: any): any {
  const dbObj = { ...program };
  if (dbObj.shortDescription !== undefined) {
    dbObj.shortdescription = dbObj.shortDescription;
    delete dbObj.shortDescription;
  }
  if (dbObj.problemsSolved !== undefined) {
    dbObj.problemssolved = dbObj.problemsSolved;
    delete dbObj.problemsSolved;
  }

  // Handle createdAt -> created_at and clean up legacy keys
  if (dbObj.createdAt !== undefined) {
    dbObj.created_at = dbObj.createdAt;
    delete dbObj.createdAt;
  } else if (dbObj.createdat !== undefined) {
    dbObj.created_at = dbObj.createdat;
  }
  delete dbObj.createdat;

  // Handle updatedAt -> updated_at and clean up legacy keys
  if (dbObj.updatedAt !== undefined) {
    dbObj.updated_at = dbObj.updatedAt;
    delete dbObj.updatedAt;
  } else if (dbObj.updatedat !== undefined) {
    dbObj.updated_at = dbObj.updatedat;
  }
  delete dbObj.updatedat;

  if (dbObj.showOnHome !== undefined) {
    dbObj.showonhome = dbObj.showOnHome;
    delete dbObj.showOnHome;
  }

  // Remove columns that no longer exist in Supabase
  delete dbObj.media;
  delete dbObj.testimonials;
  delete dbObj.order;

  return dbObj;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const supabase = await createClient();
    
    // Allow fetching by ID or slug
    const { data, error } = await supabase.from("programs").select("*").or(`id.eq.${slug},slug.eq.${slug}`).single();
    
    if (error || !data) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(mapDbToProgram(data));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    let body: Partial<Program>;
    try {
      body = (await request.json()) as Partial<Program>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const updatedBody = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const dbPayload = mapProgramToDb(updatedBody);

    const { data, error } = await supabase
      .from("programs")
      .update(dbPayload)
      .or(`id.eq.${slug},slug.eq.${slug}`)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json(updatedBody);
    }
    return NextResponse.json(mapDbToProgram(data[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    
    const { error } = await supabase.from("programs").delete().or(`id.eq.${slug},slug.eq.${slug}`);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}
