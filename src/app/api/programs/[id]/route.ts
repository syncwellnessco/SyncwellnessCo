import { NextRequest, NextResponse } from "next/server";
import { verifyApiSecret } from "@/lib/api-auth";
import {
  deleteProgram,
  getPrograms,
  saveProgram,
} from "@/lib/content-store";
import { seedPrograms } from "@/data/seed-programs";
import type { UpdateProgramInput } from "@/types/program";

type RouteContext = { params: Promise<{ id: string }> };

async function findProgram(id: string) {
  const stored = await getPrograms();
  const programs = stored.length > 0 ? stored : seedPrograms;
  return programs.find((p) => p.id === id);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const program = await findProgram(id);

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findProgram(id);

  if (!existing) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  let body: UpdateProgramInput;
  try {
    body = (await request.json()) as UpdateProgramInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = {
    ...existing,
    ...body,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveProgram(updated);
  return NextResponse.json(saved);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findProgram(id);

  if (!existing) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const stored = await getPrograms();
  if (stored.length === 0) {
    const remaining = seedPrograms.filter((p) => p.id !== id);
    for (const program of remaining) {
      await saveProgram(program);
    }
    return NextResponse.json({ success: true });
  }

  const deleted = await deleteProgram(id);
  if (!deleted) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}
