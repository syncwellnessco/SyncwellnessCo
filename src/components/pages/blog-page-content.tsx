"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

const ITEMS_PER_PAGE = 15;

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
          {/* Sleeker 3-column blog grid with 15 items (5 rows of 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedPosts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden bg-[#FAF8F5] border border-[#EBE3DB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <Link href={`/resources/blogs/${post.slug || post.id}`} className="group flex-1 flex flex-col">
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
                  <div className="p-3 sm:p-4 flex flex-1 flex-col items-center justify-between text-center min-h-[110px] sm:min-h-[130px]">
                    <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-charcoal leading-snug line-clamp-3 group-hover:text-[#8C6D40] transition-colors">
                      {post.title}
                    </h3>
                    {post.category && (
                      <span className="font-display italic text-[#8C6D40] text-sm sm:text-base font-semibold mt-2.5">
                        {post.category}
                      </span>
                    )}
                  </div>
                </Link>
                <Link 
                  href={`/resources/blogs/${post.slug || post.id}`} 
                  className="block w-full bg-[#8C6D40] py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B8955F]"
                >
                  Read More
                </Link>
              </article>
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
