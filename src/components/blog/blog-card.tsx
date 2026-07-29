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
  const authorLabel = post.author || "Sync Wellness";

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile View: Detailed List Card */}
      <article className="block sm:hidden bg-[#FAF8F5] border border-[#EBE3DB] rounded-sm p-4 transition-all duration-200 shadow-sm active:scale-[0.99]">
        <Link href={href} className="group flex flex-col gap-2.5">
          {/* Top Row: Category & Date */}
          <div className="flex items-center justify-between text-[10px] tracking-wider uppercase font-semibold">
            <span className="bg-[#8C6D40]/10 text-[#8C6D40] px-2.5 py-0.5 rounded-sm">
              {categoryLabel}
            </span>
            {formattedDate && (
              <span className="text-charcoal/50 font-medium normal-case text-[11px]">
                {formattedDate}
              </span>
            )}
          </div>

          {/* Main Row: Title/Excerpt + Thumbnail */}
          <div className="flex gap-3.5 items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base font-bold text-charcoal leading-snug group-hover:text-[#8C6D40] transition-colors line-clamp-2 italic">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-charcoal/75 line-clamp-2 mt-1.5 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            {post.image ? (
              <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-sm overflow-hidden flex-shrink-0 border border-[#EBE3DB] bg-white">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-22 h-22 rounded-sm bg-sage-50 flex-shrink-0 flex items-center justify-center border border-[#EBE3DB] text-charcoal/40 font-display text-xs">
                Sync
              </div>
            )}
          </div>

          {/* Footer Row: Author & Action */}
          <div className="flex items-center justify-between text-[11px] text-charcoal/60 pt-2.5 border-t border-[#EBE3DB]/60 mt-0.5">
            <span className="truncate max-w-[180px] font-medium">
              By {authorLabel}
            </span>
            <span className="text-[#8C6D40] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
              Read Article →
            </span>
          </div>
        </Link>
      </article>

      {/* Desktop/Tablet View: Grid Card */}
      <article className="hidden sm:flex flex-col overflow-hidden rounded-sm bg-[#FAF8F5] border border-[#EBE3DB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md w-full h-full">
        <Link href={href} className="group flex-1 flex flex-col">
          {post.image ? (
            <div className="relative aspect-[16/9] overflow-hidden border-b border-[#EBE3DB]">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="relative aspect-[16/9] bg-sage-50 border-b border-[#EBE3DB]" />
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
                <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed mb-3">
                  {post.excerpt}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-charcoal/60 pt-3 border-t border-[#EBE3DB]/60 mt-2">
              <span className="font-medium truncate max-w-[140px]">
                By {authorLabel}
              </span>
              <span className="text-[#8C6D40] font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
                Read More →
              </span>
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}
