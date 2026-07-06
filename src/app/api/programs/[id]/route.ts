import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

type RouteContext = { params: Promise<{ id: string }> };

function mapDbToProgram(row: any): Program {
  return {
    ...row,
    shortDescription: row.shortdescription !== undefined ? row.shortdescription : row.shortDescription,
    problemsSolved: row.problemssolved !== undefined ? row.problemssolved : row.problemsSolved,
    createdAt: row.createdat !== undefined ? row.createdat : row.createdAt,
    updatedAt: row.updatedat !== undefined ? row.updatedat : row.updatedAt,
    showOnHome: row.showonhome !== undefined ? row.showonhome : row.showOnHome,
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
  if (dbObj.createdAt !== undefined) {
    dbObj.createdat = dbObj.createdAt;
    delete dbObj.createdAt;
  }
  if (dbObj.updatedAt !== undefined) {
    dbObj.updatedat = dbObj.updatedAt;
    delete dbObj.updatedAt;
  }
  if (dbObj.showOnHome !== undefined) {
    dbObj.showonhome = dbObj.showOnHome;
    delete dbObj.showOnHome;
  }
  return dbObj;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { data, error } = await supabase.from("programs").select("*").eq("id", id).single();
    
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
    const { id } = await context.params;
    let body: Partial<Program>;
    try {
      body = (await request.json()) as Partial<Program>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const supabase = await createClient();
    const updatedBody = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const dbPayload = mapProgramToDb(updatedBody);

    const { data, error } = await supabase
      .from("programs")
      .update(dbPayload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(mapDbToProgram(data[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}
