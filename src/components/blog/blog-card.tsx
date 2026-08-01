"use client";

import Link from "next/link";
import type { BlogPost } from "@/types/blog";

type BlogCardProps = {
  post: BlogPost;
  className?: string;
};

function formatDate(dateString?: string) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function BlogCard({ post, className = "" }: BlogCardProps) {
  const formattedDate = formatDate(post.createdAt);
  const href = `/resources/blogs/${post.slug || post.id}`;
  const categoryLabel = post.category || "Journal";

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile View: Minimal list item — image, title, date, category. No card borders/shadows. */}
      <article className="block sm:hidden w-full border-b border-[#EBE3DB] last:border-b-0">
        <Link href={href} className="group flex gap-3.5 items-start py-4">
          {/* Thumbnail */}
          <div className="relative w-[38%] max-w-[160px] shrink-0 overflow-hidden rounded-sm bg-[#F1EAE0]" style={{ aspectRatio: "16 / 9" }}>
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-[#EBE3DB]/60 text-center">
                <span className="font-display text-[10px] font-semibold text-[#8C6D40]">Sync</span>
                <span className="text-[8px] text-charcoal/50 uppercase tracking-wider font-medium">Wellness</span>
              </div>
            )}
          </div>

          {/* Title, date, category */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
            <h3 className="font-display text-sm font-bold text-charcoal leading-snug line-clamp-2 group-hover:text-[#8C6D40] transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {formattedDate && (
                <span className="text-[11px] text-charcoal/50">
                  {formattedDate}
                </span>
              )}
              <span className="bg-[#8C6D40]/10 text-[#8C6D40] px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[140px]">
                {categoryLabel}
              </span>
            </div>
          </div>
        </Link>
      </article>

      {/* Desktop/Tablet View: Grid Card (unchanged) */}
      <article className="hidden sm:flex flex-col overflow-hidden rounded-sm bg-[#FAF8F5] border border-[#EBE3DB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md w-full h-full">
        <Link href={href} className="group flex-1 flex flex-col">
          {post.image ? (
            <div className="relative overflow-hidden border-b border-[#EBE3DB]" style={{ aspectRatio: "16 / 9" }}>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="relative bg-sage-50 border-b border-[#EBE3DB]" style={{ aspectRatio: "16 / 9" }} />
          )}
          <div className="p-4 flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider mb-2">
                <span className="text-[#8C6D40] bg-[#8C6D40]/10 px-2 py-0.5 rounded-sm">
                  {categoryLabel}
                </span>
                {formattedDate && (
                  <span className="text-charcoal/50 font-normal normal-case text-[11px]">
                    {formattedDate}
                  </span>
                )}
              </div>
              <h3 className="font-display text-base md:text-lg font-bold text-charcoal leading-snug line-clamp-2 group-hover:text-[#8C6D40] transition-colors mb-2 italic">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}
