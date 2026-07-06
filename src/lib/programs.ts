import { createClient } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

function mapDbToProgram(row: any): Program {
  return {
    ...row,
    shortDescription: row.shortdescription !== undefined ? row.shortdescription : row.shortDescription,
    problemsSolved: row.problemssolved !== undefined ? row.problemssolved : row.problemsSolved,
    createdAt: row.createdat !== undefined ? row.createdat : row.createdAt,
    updatedAt: row.updatedat !== undefined ? row.updatedat : row.updatedAt,
    showOnHome: row.showonhome !== undefined ? row.showonhome : (row.showOnHome !== undefined ? row.showOnHome : true),
  };
}

export async function getAllPrograms(options?: {
  publishedOnly?: boolean;
}): Promise<Program[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("programs").select("*").order("featured_rank", { ascending: true });
    
    if (options?.publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error fetching programs:", error.message);
      return [];
    }
    
    if (!data) return [];

    return data.map(mapDbToProgram);
  } catch (err) {
    console.error("Error fetching programs from Supabase:", err);
    return [];
  }
}

export async function getProgram(id: string): Promise<Program | undefined> {
  const programs = await getAllPrograms();
  return programs.find((p) => p.id === id);
}

export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  const programs = await getAllPrograms();
  const searchSlug = slug.toLowerCase();
  const match = programs.find((p) => (p.slug || "").toLowerCase() === searchSlug || (p.id || "").toLowerCase() === searchSlug);
  console.log("DEBUG getProgramBySlug:", { inputSlug: slug, searchSlug, foundMatch: !!match, totalPrograms: programs.length });
  return match;
}
