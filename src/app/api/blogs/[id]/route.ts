import { NextRequest, NextResponse } from "next/server";
import { verifyApiSecret } from "@/lib/api-auth";
import {
  deleteBlogPost,
  getBlogPosts,
  saveBlogPost,
} from "@/lib/content-store";
import type { UpdateBlogInput } from "@/types/blog";

type RouteContext = { params: Promise<{ id: string }> };

async function findPost(id: string) {
  const posts = await getBlogPosts();
  return posts.find((p) => p.id === id);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const post = await findPost(id);

  if (!post) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!verifyApiSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findPost(id);

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
    id,
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

  const { id } = await context.params;
  const existing = await findPost(id);

  if (!existing) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  const deleted = await deleteBlogPost(id);
  if (!deleted) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}
