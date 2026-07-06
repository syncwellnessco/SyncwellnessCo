import { NextRequest, NextResponse } from "next/server";
import { verifyApiSecret } from "@/lib/api-auth";
import {
  deleteBlogPost,
  getBlogPosts,
  saveBlogPost,
} from "@/lib/content-store";
import type { UpdateBlogInput } from "@/types/blog";

type RouteContext = { params: Promise<{ slug: string }> };

async function findPost(slugOrId: string) {
  const posts = await getBlogPosts();
  return posts.find((p) => (p.slug || p.id) === slugOrId || p.id === slugOrId);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const post = await findPost(slug);

  if (!post) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const existing = await findPost(slug);

  if (!existing) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  let body: UpdateBlogInput;
  try {
    body = (await request.json()) as UpdateBlogInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = {
    ...existing,
    ...body,
    id: existing.id,
    slug: existing.slug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveBlogPost(updated);
  return NextResponse.json(saved);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const existing = await findPost(slug);

  if (!existing) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  const deleted = await deleteBlogPost(existing.id);
  if (!deleted) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}
