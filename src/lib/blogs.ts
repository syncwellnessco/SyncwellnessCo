import { seedBlogs } from "@/data/seed-blogs";
import { getBlogPosts as getStoredPosts } from "@/lib/content-store";
import type { BlogPost } from "@/types/blog";

export async function getAllBlogPosts(options?: {
  publishedOnly?: boolean;
}): Promise<BlogPost[]> {
  const stored = await getStoredPosts();
  const posts = stored.length > 0 ? stored : seedBlogs;

  if (options?.publishedOnly) {
    return posts.filter((p) => p.published);
  }

  return posts;
}

export async function getBlogPost(id: string): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPosts();
  return posts.find((p) => p.id === id);
}

export { seedBlogs as demoBlogs };
