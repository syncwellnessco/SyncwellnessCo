import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { seedPrograms } from "@/data/seed-programs";
import type { Program } from "@/types/program";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";

  try {
    const supabase = await createClient();
    let query = supabase.from("programs").select("*").order("order", { ascending: true });
    
    if (publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;
    
    // If table doesn't exist or error, fallback to seedPrograms so site doesn't break
    if (error) {
      console.warn("Supabase query failed, falling back to seed programs.", error.message);
      const filtered = publishedOnly ? seedPrograms.filter((p) => p.status === "published") : seedPrograms;
      return NextResponse.json(filtered);
    }

    // If table is empty, we also return seedPrograms so they can see them and sync them
    if (!data || data.length === 0) {
      const filtered = publishedOnly ? seedPrograms.filter((p) => p.status === "published") : seedPrograms;
      return NextResponse.json(filtered);
    }

    const mappedData = data.map(mapDbToProgram);
    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Programs API Error:", err);
    const filtered = publishedOnly ? seedPrograms.filter((p) => p.status === "published") : seedPrograms;
    return NextResponse.json(filtered);
  }
}

export async function POST(request: NextRequest) {
  let body: Partial<Program>;
  try {
    body = (await request.json()) as Partial<Program>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || !body.description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  
  const program: Program = {
    id: body.id ?? slugify(body.title),
    title: body.title,
    slug: body.slug ?? slugify(body.title),
    shortDescription: body.shortDescription ?? "",
    description: body.description,
    duration: body.duration ?? "",
    format: body.format ?? "",
    category: body.category ?? "",
    status: body.status ?? "draft",
    featured: body.featured ?? false,
    order: body.order ?? 0,
    pricing: body.pricing ?? { price: 0, currency: "USD", paymentType: "one-time", installmentAvailable: false },
    hero: body.hero ?? { bannerImage: "", ctaText: "Join", ctaLink: "/programs" },
    audience: body.audience ?? { designedFor: [], notFor: [], idealClient: [] },
    problemsSolved: body.problemsSolved ?? [],
    outcomes: body.outcomes ?? { summary: "", physical: [], mental: [], lifestyle: [], wellness: [] },
    included: body.included ?? [],
    bonuses: body.bonuses ?? [],
    structure: body.structure ?? { weeks: [], coachingSchedule: "", sessionFrequency: "", supportStructure: "" },
    methodology: body.methodology ?? { framework: "", process: "", whyItWorks: "", scientificBasis: "" },
    faqs: body.faqs ?? [],
    enrollment: body.enrollment ?? { startDates: [], process: "", applicationProcess: "", paymentPlans: "" },
    testimonials: body.testimonials ?? [],
    media: body.media ?? { bannerImages: [], gallery: [], videos: [], pdfs: [], resources: [] },
    seo: body.seo ?? { metaTitle: body.title, metaDescription: "", keywords: [] },
    quiz: body.quiz ?? { enabled: false, title: "" },
    createdAt: now,
    updatedAt: now,
  };

  try {
    const supabase = await createClient();
    const dbProgram = mapProgramToDb(program);
    const { data, error } = await supabase.from("programs").insert([dbProgram]).select();
    
    if (error) {
      return NextResponse.json({ error: `Database Error: ${error.message}. Did you create the table?` }, { status: 500 });
    }
    return NextResponse.json(mapDbToProgram(data[0]), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
