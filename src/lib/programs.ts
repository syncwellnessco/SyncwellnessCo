import { seedPrograms } from "@/data/seed-programs";
import { getPrograms as getStoredPrograms } from "@/lib/content-store";
import type { Program } from "@/types/program";

export async function getAllPrograms(options?: {
  publishedOnly?: boolean;
}): Promise<Program[]> {
  const stored = await getStoredPrograms();
  const programs = stored.length > 0 ? stored : seedPrograms;

  if (options?.publishedOnly) {
    return programs.filter((p) => p.published);
  }

  return programs;
}

export async function getProgram(id: string): Promise<Program | undefined> {
  const programs = await getAllPrograms();
  return programs.find((p) => p.id === id);
}

/** Sync helper for client components that import static seed data */
export { seedPrograms as programs };
