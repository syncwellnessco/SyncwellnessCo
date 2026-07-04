"use server";

import { getAllPrograms } from "@/lib/programs";

export async function getProgramsAction() {
  const programs = await getAllPrograms({ publishedOnly: true });
  return programs;
}
