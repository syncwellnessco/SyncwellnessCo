import { NextRequest, NextResponse } from "next/server";
import { verifyApiSecret } from "@/lib/api-auth";
import { getBlogPosts, saveBlogPost } from "@/lib/content-store";
import type { BlogPost, CreateBlogInput } from "@/types/blog";

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
    category: body.category ?? "Wellness",
    image: body.image ?? "",
    author: body.author ?? "Neha",
    published: body.published ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveBlogPost(post);
  return NextResponse.json(saved, { status: 201 });
}
