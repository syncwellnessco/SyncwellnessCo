"use client";

import { useState, useRef } from "react";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "@/components/blog/blog-card";

const ITEMS_PER_PAGE = 9;

type BlogPageContentProps = {
  initialPosts?: BlogPost[];
};

export function BlogPageContent({ initialPosts = [] }: BlogPageContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const posts = initialPosts;
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);

  const paginatedPosts = posts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <article className="bg-cream">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-3 text-center">
          <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
            Blog
          </span>
          <h1 className="font-display text-3xl lg:text-5xl font-normal text-charcoal mb-3 leading-tight">
            Wellness Insights & <span className="italic text-[#8C6D40]">Tips.</span>
          </h1>
          <p className="mx-auto text-sm lg:text-base leading-relaxed text-charcoal/80 max-w-2xl">
            Practical reads on hormones, nutrition, and living well, curated for women like you.
          </p>
        </section>
      </article>

      <section ref={gridRef} className="pb-12 sm:pb-16 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Responsive Blog List (Mobile) / Grid (PC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-sm border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-8 w-8 rounded-sm text-xs font-semibold transition-colors ${
                    page === currentPage
                      ? "bg-[#8C6D40] text-white shadow-sm"
                      : "bg-white border border-[#EBE3DB] text-charcoal hover:bg-[#8C6D40]/10 hover:text-[#8C6D40]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-sm border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}



