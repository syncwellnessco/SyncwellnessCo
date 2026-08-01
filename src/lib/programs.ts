import { publicSupabase } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

function mapDbToProgram(row: any): Program {
  return {
    ...row,
    shortDescription: row.short_description !== undefined ? row.short_description : (row.shortdescription !== undefined ? row.shortdescription : row.shortDescription),
    problemsSolved: row.problems_solved !== undefined ? row.problems_solved : (row.problemssolved !== undefined ? row.problemssolved : row.problemsSolved),
    createdAt: row.created_at !== undefined ? row.created_at : (row.createdat !== undefined ? row.createdat : row.createdAt),
    updatedAt: row.updated_at !== undefined ? row.updated_at : (row.updatedat !== undefined ? row.updatedat : row.updatedAt),
    showOnHome: row.show_on_home !== undefined ? row.show_on_home : (row.showonhome !== undefined ? row.showonhome : (row.showOnHome !== undefined ? row.showOnHome : true)),
  };
}

export async function getAllPrograms(options?: {
  publishedOnly?: boolean;
}): Promise<Program[]> {
  try {
    const supabase = publicSupabase;
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
