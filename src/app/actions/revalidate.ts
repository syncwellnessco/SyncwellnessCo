"use server";

import { revalidatePath } from "next/cache";

/**
 * Instantly purges cache across the entire website and specific paths
 */
export async function revalidateWebsite(path?: string) {
  try {
    if (path) {
      revalidatePath(path);
    }
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to revalidate website cache:", error);
  }
}
