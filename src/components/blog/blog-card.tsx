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
      {/* Mobile View: Clean YouTube-Style List Card (Entire Card Clickable, Sharp Edges, No Read More Button) */}
      <article className="block sm:hidden bg-[#FAF8F5] border border-[#EBE3DB] rounded-none transition-all duration-200 shadow-xs hover:border-[#8C6D40]/50 active:scale-[0.99] w-full cursor-pointer overflow-hidden">
        <Link href={href} className="group flex gap-3.5 items-start p-3 w-full">
          {/* Left Column: Full Aspect Image Preview (Sharp Edges) */}
          <div className="relative w-[38%] max-w-[140px] shrink-0 rounded-none overflow-hidden bg-sage-50 border border-[#EBE3DB] aspect-[16/11]">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-[#EBE3DB]/60 p-2 text-center">
                <span className="font-display text-xs font-semibold text-[#8C6D40]">Sync</span>
                <span className="text-[9px] text-charcoal/50 uppercase tracking-wider font-medium">Wellness</span>
              </div>
            )}
          </div>

          {/* Right Column: Blog Content Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              {/* Category & Date */}
              <div className="flex items-center justify-between text-[10px] tracking-wider uppercase font-semibold mb-1.5 flex-wrap gap-1">
                <span className="bg-[#8C6D40]/10 text-[#8C6D40] px-2 py-0.5 rounded-none text-[9px] whitespace-normal">
                  {categoryLabel}
                </span>
                {formattedDate && (
                  <span className="text-charcoal/70 font-semibold normal-case text-[9px]">
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-display text-xs sm:text-sm font-bold text-charcoal leading-snug group-hover:text-[#8C6D40] transition-colors line-clamp-2 italic">
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-[11px] text-charcoal/75 line-clamp-2 mt-1 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </Link>
      </article>

      {/* Desktop/Tablet View: Polished Grid Card (Entire Card Clickable, Sharp Edges, No Read More Button) */}
      <article className="hidden sm:flex flex-col overflow-hidden rounded-none bg-[#FAF8F5] border border-[#EBE3DB] shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#8C6D40]/40 w-full h-full cursor-pointer">
        <Link href={href} className="group flex-1 flex flex-col">
          {post.image ? (
            <div className="relative aspect-[16/9] overflow-hidden border-b border-[#EBE3DB] rounded-none">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="relative aspect-[16/9] bg-sage-50 border-b border-[#EBE3DB] rounded-none flex items-center justify-center text-charcoal/30 font-display text-sm">
              Sync Wellness
            </div>
          )}
          <div className="p-4 flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider mb-2 gap-1 flex-wrap">
                <span className="text-[#8C6D40] bg-[#8C6D40]/10 px-2 py-0.5 rounded-none text-[9.5px] whitespace-normal">
                  {categoryLabel}
                </span>
                {formattedDate && (
                  <span className="text-charcoal/70 font-semibold normal-case text-[10px]">
                    {formattedDate}
                  </span>
                )}
              </div>
              <h3 className="font-display text-base md:text-lg font-bold text-charcoal leading-snug line-clamp-2 group-hover:text-[#8C6D40] transition-colors mb-2 italic">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-charcoal/70 line-clamp-3 leading-relaxed">
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
