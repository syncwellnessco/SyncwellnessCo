import { seedPrograms } from "@/data/seed-programs";
import { createClient } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

function mapDbToProgram(row: any): Program {
  return {
    ...row,
    shortDescription: row.shortdescription !== undefined ? row.shortdescription : row.shortDescription,
    problemsSolved: row.problemssolved !== undefined ? row.problemssolved : row.problemsSolved,
    createdAt: row.createdat !== undefined ? row.createdat : row.createdAt,
    updatedAt: row.updatedat !== undefined ? row.updatedat : row.updatedAt,
  };
}

export async function getAllPrograms(options?: {
  publishedOnly?: boolean;
}): Promise<Program[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("programs").select("*").order("order", { ascending: true });
    
    if (options?.publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.warn("Falling back to seed programs", error?.message);
      const filtered = options?.publishedOnly ? seedPrograms.filter((p) => p.status === "published") : seedPrograms;
      return filtered as Program[];
    }

    return data.map(mapDbToProgram);
  } catch (err) {
    console.error("Error fetching programs from Supabase:", err);
    return (options?.publishedOnly ? seedPrograms.filter((p) => p.status === "published") : seedPrograms) as Program[];
  }
}

export async function getProgram(id: string): Promise<Program | undefined> {
  const programs = await getAllPrograms();
  return programs.find((p) => p.id === id);
}

/** Sync helper for client components that import static seed data */
export { seedPrograms as programs };
