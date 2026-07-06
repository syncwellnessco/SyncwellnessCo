import { createClient } from "@supabase/supabase-js";
import type { BlogPost } from "@/types/blog";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllBlogPosts(options?: {
  publishedOnly?: boolean;
}): Promise<BlogPost[]> {
  let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  
  return data.map((d: any) => ({
    id: d.slug, // mapping slug to id to keep routes clean
    title: d.title,
    excerpt: d.excerpt || "",
    content: d.content || "",
    image: d.image_url,
    author: d.author || "Admin",
    category: d.category || "Wellness",
    tags: d.tags || "",
    published: d.published,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
  if (error || !data) return undefined;
  return {
    id: data.slug,
    title: data.title,
    excerpt: data.excerpt || "",
    content: data.content || "",
    image: data.image_url,
    author: data.author || "Admin",
    category: data.category || "Wellness",
    tags: data.tags || "",
    published: data.published,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
