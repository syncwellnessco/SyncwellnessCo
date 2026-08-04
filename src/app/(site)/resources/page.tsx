import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { getAllBlogPosts } from "@/lib/blogs";
import { ExpandableGrid } from "@/components/resources/expandable-resources-grid";
import { EventsCarousel } from "@/components/resources/events-carousel";

import { IMAGES } from "@/data/media";

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
  const eventImages = allPosts.filter(p => p.category === "Event Image");
  const latestBlogs = allPosts.filter(p => p.category !== "Podcast" && p.category !== "News Article" && p.category !== "Event Image");

  return (
    <PageShell noPadding>
      {/* 1. TOP ANNOUNCEMENT BAR (Brand Charcoal & Gold Accent) */}
      <div className="bg-charcoal text-cream py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] border-b border-beige-200/20">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#b38c50]" />
          <span>CURATED GUIDES • EBOOKS & WELLNESS VAULT FOR WOMEN</span>
          <Sparkles className="w-3.5 h-3.5 text-[#b38c50] hidden sm:inline" />
        </div>
      </div>

      {/* 2. HERO WIDE BANNER (Brand Aesthetic with Dark Faded Bottom Gradient) */}
      <section className="relative w-full bg-background overflow-hidden border-b border-beige-200">
        {/* Landscape Hero Image Frame */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] lg:aspect-[21/6] min-h-[380px] max-h-[500px] bg-charcoal overflow-hidden">
          <img
            src={IMAGES.resourcesPageHero}
            alt="Syncwellness resources and wellness vault"
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />

          {/* Dark Faded Color Gradient Emerging From Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/65 via-45% to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-transparent to-transparent pointer-events-none" />
          
          {/* Banner Text Content Layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto w-full z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b896] mb-2 drop-shadow-sm">
                Syncwellness Vault
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#f2ece4] leading-tight drop-shadow-md mb-3">
                Empowering Resources, <br />
                <span className="italic text-[#d4b896]">Hormonal Harmony.</span>
              </h1>
              <p className="text-[#efe8df]/85 font-sans text-xs sm:text-base font-normal max-w-xl leading-relaxed drop-shadow-sm hidden sm:block">
                A curated collection of free ebooks, video masterclasses, downloadable guides, and press features designed to support your natural healing journey.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Stats / Feature Bar (All 4 in 1 row on mobile & desktop) */}
        <div className="bg-beige-100/70 border-t border-b border-beige-200 py-4 sm:py-8">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-1 sm:gap-6 text-center divide-x divide-beige-200">
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">100%</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Free Access</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">50+</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Guides & Articles</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">10k+</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Ebook Downloads</p>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl text-charcoal font-normal">Expert</h3>
                <p className="text-[8px] sm:text-[11px] uppercase tracking-wider text-charcoal/70 font-semibold mt-0.5 sm:mt-1 leading-tight">Backed Protocols</p>
              </div>
            </div>
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

      {/* Featured in Events Carousel Section */}
      <EventsCarousel items={eventImages} />

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
    </PageShell>
  );
}
