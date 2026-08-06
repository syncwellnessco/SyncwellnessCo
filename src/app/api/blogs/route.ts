import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyApiSecret } from "@/lib/api-auth";
import { getBlogPosts, saveBlogPost } from "@/lib/content-store";
import type { BlogPost, CreateBlogInput } from "@/types/blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";

  const posts = await getBlogPosts();
  const filtered = publishedOnly ? posts.filter((p) => p.published) : posts;

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBlogInput;
  try {
    body = (await request.json()) as CreateBlogInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const post: BlogPost = {
    id: body.id ?? slugify(body.title),
    slug: slugify(body.title),
    title: body.title,
    excerpt: body.excerpt ?? body.content.slice(0, 160),
    content: body.content,
    category: body.category ?? "",
    image: body.image ?? "",
    author: body.author ?? "Neha",
    published: body.published ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveBlogPost(post);
  try {
    revalidatePath("/resources/blogs");
    revalidatePath("/resources");
    revalidatePath("/", "layout");
  } catch (revErr) {
    console.error("Revalidation error:", revErr);
  }
  return NextResponse.json(saved, { status: 201 });
}
