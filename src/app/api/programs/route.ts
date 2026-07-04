import { NextRequest, NextResponse } from "next/server";
import { verifyApiSecret } from "@/lib/api-auth";
import { getPrograms, saveProgram } from "@/lib/content-store";
import { seedPrograms } from "@/data/seed-programs";
import type { CreateProgramInput, Program } from "@/types/program";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";

  const stored = await getPrograms();
  const programs = stored.length > 0 ? stored : seedPrograms;
  const filtered = publishedOnly ? programs.filter((p) => p.published) : programs;

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateProgramInput;
  try {
    body = (await request.json()) as CreateProgramInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name || !body.description) {
    return NextResponse.json(
      { error: "name and description are required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const program: Program = {
    id: body.id ?? slugify(body.name),
    name: body.name,
    duration: body.duration ?? "",
    format: body.format ?? "Online",
    description: body.description,
    overview: body.overview ?? body.description,
    features: body.features ?? [],
    bonuses: body.bonuses,
    perfectFor: body.perfectFor ?? [],
    outcomes: body.outcomes ?? "",
    featured: body.featured ?? false,
    cta: body.cta ?? "Learn More",
    ctaLink: body.ctaLink ?? "/programs",
    pricing: body.pricing,
    videoUrl: body.videoUrl,
    published: body.published ?? true,
    stats: body.stats ?? [],
    problems: body.problems ?? [],
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveProgram(program);
  return NextResponse.json(saved, { status: 201 });
}
