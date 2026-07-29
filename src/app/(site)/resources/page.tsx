import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getAllBlogPosts } from "@/lib/blogs";
import { ExpandableGrid } from "@/components/resources/expandable-resources-grid";

import { IMAGES } from "@/data/images";

export const metadata: Metadata = {
  title: "Resources | SyncwellnessCo",
  description: "Free resources, Ebooks, and diet plans to help balance your hormones naturally.",
};

export const revalidate = 0;

export default async function ResourcesHubPage() {
  const allPosts = await getAllBlogPosts({ publishedOnly: true });

  // Categorize resources
  const podcasts = allPosts.filter(p => p.category === "Podcast");
  const mediaArticles = allPosts.filter(p => p.category === "News Article");
  const latestBlogs = allPosts.filter(p => p.category !== "Podcast" && p.category !== "News Article");

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFE9] via-[#FAF8F5] to-cream pt-[96px] lg:pt-28 pb-10 border-b border-[#EBE3DB]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(140,109,64,0.06),transparent_45%)]"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[#8C6D40] text-xs font-bold uppercase tracking-[0.3em] block mb-3">
              Wellness Vault
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal mb-4 leading-[1.15]">
              Empowering Resources for <span className="italic font-normal text-[#8C6D40]">Hormonal Harmony</span>
            </h1>
            <div className="w-16 h-[1.5px] bg-[#8C6D40] mx-auto mb-4"></div>
            <p className="text-charcoal/80 text-[15px] sm:text-base leading-relaxed max-w-2xl mx-auto">
              A curated collection of guides, video episodes, articles, and press features designed to support you on your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Spotlight eBook Section */}
      <section className="py-12 bg-cream relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white border border-[#EBE3DB] p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-shadow duration-500 rounded-none overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(140,109,64,0.04),transparent_60%)] -mr-32 -mt-32"></div>
            
            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* eBook Mockup Column */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative max-w-[280px] w-full aspect-[3/4] bg-[#FAF8F5] p-4 border border-[#EBE3DB] shadow-md group-hover:-translate-y-1 transition-transform duration-500 flex items-center justify-center">
                  <img 
                    src={IMAGES.ebookMockup} 
                    alt="Hormone Balance Ebook" 
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Content Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#8C6D40]/5 border border-[#8C6D40]/10 rounded-sm">
                  <BookOpen className="w-3.5 h-3.5 text-[#8C6D40]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C6D40]">Featured Ebook</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-charcoal leading-tight">
                  The Hormone Balance Guide
                </h2>
                <p className="text-charcoal/80 text-sm leading-relaxed">
                  Discover a simple, protein-focused blueprint designed to naturally reset your hormones, curb cravings, and jumpstart healthy weight management, completely free of calorie restriction or exhausting workouts.
                </p>
                <div className="pt-2">
                  <Link 
                    href="/resources/ebook" 
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#8C6D40] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#B8955F] transition-all duration-300 shadow-sm group"
                  >
                    Get Free Access 
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Podcasts Section */}
      {podcasts.length > 0 && (
        <section className="py-12 bg-[#FAF8F5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8 text-center sm:text-left">
              <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
                Podcast & Video
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light text-charcoal">
                Watch <span className="italic font-normal text-[#8C6D40]">The Podcast</span>
              </h2>
            </div>

            <ExpandableGrid items={podcasts} type="podcast" />
          </div>
        </section>
      )}

      {/* Media & Press Section */}
      {mediaArticles.length > 0 && (
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8 text-center sm:text-left">
              <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
                In The News
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light text-charcoal">
                Featured In & <span className="italic font-normal text-[#8C6D40]">Press</span>
              </h2>
            </div>

            <ExpandableGrid items={mediaArticles} type="media" />
          </div>
        </section>
      )}

      {/* Latest Blogs Section */}
      <section className="py-12 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
              Wellness Journal
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-light text-charcoal">
              Latest <span className="italic font-normal text-[#8C6D40]">Articles</span>
            </h2>
          </div>

          <ExpandableGrid items={latestBlogs} type="blog" />

          <div className="mt-10 text-center">
            <Link 
              href="/resources/blogs" 
              className="inline-flex items-center gap-2 text-charcoal hover:text-[#8C6D40] text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 group"
            >
              View All Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
