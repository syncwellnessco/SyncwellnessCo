"use client";

import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { IMAGES } from "@/data/media";

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
      {/* 1. TOP ANNOUNCEMENT BAR (Brand Charcoal & Gold Accent) */}
      <div className="bg-charcoal text-cream py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] border-b border-beige-200/20">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#b38c50]" />
          <span>HEALTH INSIGHTS • EVIDENCE-BASED HORMONAL WELLNESS ARTICLES</span>
          <Sparkles className="w-3.5 h-3.5 text-[#b38c50] hidden sm:inline" />
        </div>
      </div>

      {/* 2. HERO WIDE BANNER (Brand Aesthetic with Dark Faded Bottom Gradient) */}
      <section className="relative w-full bg-background overflow-hidden border-b border-beige-200">
        {/* Landscape Hero Image Frame */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] lg:aspect-[21/6] min-h-[380px] max-h-[500px] bg-charcoal overflow-hidden">
          <img
            src={IMAGES.blogPageHero}
            alt="Syncwellness blog and wellness insights"
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />

          {/* Dark Faded Color Gradient Emerging From Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/65 via-45% to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-transparent to-transparent pointer-events-none" />
          
          {/* Banner Text Content Layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto w-full z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b896] mb-2 drop-shadow-sm">
                Syncwellness Journal
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#f2ece4] leading-tight drop-shadow-md mb-3">
                Wellness Insights & <br />
                <span className="italic text-[#d4b896]">Hormonal Health Tips.</span>
              </h1>
              <p className="text-[#efe8df]/85 font-sans text-xs sm:text-base font-normal max-w-xl leading-relaxed drop-shadow-sm hidden sm:block">
                Practical, evidence-backed articles on hormone balance, gut health, sustainable nutrition, and lifestyle optimization curated for women like you.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Stats Bar (All 4 in 1 row on mobile & desktop) */}
        <div className="bg-beige-100/70 border-t border-b border-beige-200 py-4 sm:py-8">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-1 sm:gap-6 text-center divide-x divide-beige-200">
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">100%</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Evidence Based</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">50+</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Expert Articles</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">Weekly</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">New Insights</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">Women's</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Hormone Focus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={gridRef} className="pb-12 sm:pb-16 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Responsive Blog List (Mobile) / Grid (PC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-6">
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



