import { promises as fs } from "fs";
import path from "path";
import type { Program } from "@/types/program";
import type { BlogPost } from "@/types/blog";

const DATA_DIR = path.join(process.cwd(), "src/data/store");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(collection: "programs" | "blogs") {
  return path.join(DATA_DIR, `${collection}.json`);
}

async function readCollection<T>(collection: "programs" | "blogs"): Promise<T[]> {
  await ensureDataDir();
  const file = filePath(collection);

  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeCollection<T>(collection: "programs" | "blogs", items: T[]) {
  await ensureDataDir();
  await fs.writeFile(filePath(collection), JSON.stringify(items, null, 2), "utf-8");
}

export async function getPrograms(): Promise<Program[]> {
  return readCollection<Program>("programs");
}

export async function getProgramById(id: string): Promise<Program | undefined> {
  const programs = await getPrograms();
  return programs.find((p) => p.id === id);
}

export async function saveProgram(program: Program): Promise<Program> {
  const programs = await getPrograms();
  const index = programs.findIndex((p) => p.id === program.id);

  if (index >= 0) {
    programs[index] = program;
  } else {
    programs.push(program);
  }

  await writeCollection("programs", programs);
  return program;
}

export async function deleteProgram(id: string): Promise<boolean> {
  const programs = await getPrograms();
  const filtered = programs.filter((p) => p.id !== id);

  if (filtered.length === programs.length) return false;

  await writeCollection("programs", filtered);
  return true;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return readCollection<BlogPost>("blogs");
}

export async function getBlogPostById(id: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.id === id);
}

export async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  const posts = await getBlogPosts();
  const index = posts.findIndex((p) => p.id === post.id);

  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.push(post);
  }

  await writeCollection("blogs", posts);
  return post;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const posts = await getBlogPosts();
  const filtered = posts.filter((p) => p.id !== id);

  if (filtered.length === posts.length) return false;

  await writeCollection("blogs", filtered);
  return true;
}
