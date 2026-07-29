import { createClient } from "@supabase/supabase-js";
import type { BlogPost } from "@/types/blog";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    id: d.id || d.slug,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt || "",
    content: d.content || "",
    image: d.image_url,
    author: d.author || "Admin",
    category: d.category || "",
    tags: d.tags || "",
    published: d.published,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

export async function getBlogPost(slugOrId: string): Promise<BlogPost | undefined> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  const query = isUuid 
    ? supabase.from('blogs').select('*').or(`id.eq.${slugOrId},slug.eq.${slugOrId}`)
    : supabase.from('blogs').select('*').eq('slug', slugOrId);
    
  const { data, error } = await query.single();
  if (error || !data) return undefined;
  return {
    id: data.id || data.slug,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt || "",
    content: data.content || "",
    image: data.image_url,
    author: data.author || "Admin",
    category: data.category || "",
    tags: data.tags || "",
    published: data.published,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
