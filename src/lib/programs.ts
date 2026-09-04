import { cache } from "react";
import { publicSupabase } from "@/lib/supabase-server";
import type { Program } from "@/types/program";

let cachedPrograms: Program[] | null = null;
let lastProgramsFetch = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export function invalidateProgramsCache() {
  cachedPrograms = null;
  lastProgramsFetch = 0;
}

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

export const getAllPrograms = cache(async function getAllPrograms(options?: {
  publishedOnly?: boolean;
}): Promise<Program[]> {
  try {
    const now = Date.now();
    let programs = cachedPrograms;

    if (!programs || now - lastProgramsFetch > CACHE_TTL_MS) {
      const supabase = publicSupabase;
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("featured_rank", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error fetching programs:", error.message);
        return cachedPrograms 
          ? (options?.publishedOnly ? cachedPrograms.filter((p) => p.status === "published") : cachedPrograms)
          : [];
      }
      
      programs = (data || []).map(mapDbToProgram);
      cachedPrograms = programs;
      lastProgramsFetch = now;
    }

    if (options?.publishedOnly) {
      return programs.filter((p) => p.status === "published");
    }

    return programs;
  } catch (err) {
    console.error("Error fetching programs from Supabase:", err);
    return cachedPrograms || [];
  }
});

export const getProgram = cache(async function getProgram(id: string): Promise<Program | undefined> {
  const programs = await getAllPrograms();
  return programs.find((p) => p.id === id);
});

export const getProgramBySlug = cache(async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  const programs = await getAllPrograms();
  const searchSlug = (slug || "").toLowerCase();
  return programs.find((p) => (p.slug || "").toLowerCase() === searchSlug || (p.id || "").toLowerCase() === searchSlug);
});

export const getProgramReviews = cache(async function getProgramReviews(programId: string, limit = 6): Promise<{ data: any[]; total: number }> {
  try {
    const supabase = publicSupabase;
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .eq('status', 'published');

    if (programId) {
      query = query.ilike('program_id', `%${programId}%`);
    }

    query = query.range(0, limit - 1);
    const { data, error, count } = await query;
    if (error) {
      console.error("Error fetching program reviews:", error.message);
      return { data: [], total: 0 };
    }

    const mapped = (data || []).map((r: any) => ({
      ...r,
      program_ids: typeof r.program_id === 'string'
        ? r.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    }));

    return { data: mapped, total: count || 0 };
  } catch (err) {
    console.error("Error in getProgramReviews:", err);
    return { data: [], total: 0 };
  }
});

export const getProgramVideos = cache(async function getProgramVideos(programId: string, limit = 8): Promise<{ data: any[]; total: number }> {
  try {
    const supabase = publicSupabase;
    let query = supabase
      .from('video_testimonials')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (programId) {
      query = query.ilike('program_id', `%${programId}%`);
    }

    query = query.range(0, limit - 1);
    const { data, error, count } = await query;
    if (error) {
      console.error("Error fetching program videos:", error.message);
      return { data: [], total: 0 };
    }

    const mapped = (data || []).map((v: any) => ({
      ...v,
      program_ids: typeof v.program_id === 'string'
        ? v.program_id.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    }));

    return { data: mapped, total: count || 0 };
  } catch (err) {
    console.error("Error in getProgramVideos:", err);
    return { data: [], total: 0 };
  }
});


