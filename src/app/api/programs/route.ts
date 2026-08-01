import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(title: string, supabase: any) {
  const baseSlug = slugify(title);
  
  const { data } = await supabase
    .from("programs")
    .select("slug")
    .eq("slug", baseSlug)
    .single();
    
  if (!data) return baseSlug;
  
  return baseSlug + '-' + Math.random().toString(36).substring(2, 6);
}

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
  
  // Do not delete id; it is required as a primary key.

  // Remove columns that no longer exist in Supabase
  delete dbObj.media;
  delete dbObj.testimonials;
  delete dbObj.order;

  return dbObj;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";

  try {
    const supabase = await createClient();
    let query = supabase.from("programs").select("*").order("featured_rank", { ascending: true });
    
    if (publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;
    
    // If table doesn't exist or error, return empty array
    if (error) {
      console.error("Supabase query failed.", error.message);
      return NextResponse.json([]);
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    const mappedData = data.map(mapDbToProgram);
    return NextResponse.json(mappedData);
  } catch (err: any) {
    console.error("Programs API Error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const newSlug = await generateUniqueSlug(body.title, supabase);
  
  const program: Program = {
    id: body.id || crypto.randomUUID(),
    title: body.title,
    slug: newSlug,
    shortDescription: body.shortDescription ?? "",
    description: body.description,
    duration: body.duration ?? "",
    format: body.format ?? "",
    category: body.category ?? "",
    status: body.status ?? "draft",
    featured: body.featured ?? false,
    pricing: body.pricing ?? { price: 0, currency: "AUD", paymentType: "one-time", installmentAvailable: false, requireConsultant: false },
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
    seo: body.seo ?? { metaTitle: body.title, metaDescription: "", keywords: [] },
    quiz: body.quiz ?? { enabled: false, title: "" },
    createdAt: now,
    updatedAt: now,
  };

  try {
    const dbProgram = mapProgramToDb(program);
    const { data, error } = await supabase.from("programs").insert([dbProgram]).select();
    
    if (error) {
      return NextResponse.json({ error: `Database Error: ${error.message}. Did you create the table?` }, { status: 500 });
    }
    if (!data || data.length === 0) {
      return NextResponse.json(program, { status: 201 });
    }
    return NextResponse.json(mapDbToProgram(data[0]), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
