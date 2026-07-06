import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getAllBlogPosts } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Resources | SyncwellnessCo",
  description: "Free resources, eBooks, and diet plans to help balance your hormones naturally.",
};

export const dynamic = 'force-dynamic';

export default async function ResourcesHubPage() {
  const blogs = await getAllBlogPosts({ publishedOnly: true });
  const latestBlogs = blogs.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-32 pb-24 border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl lg:text-5xl font-normal text-charcoal mb-4">
              Free Resources
            </h1>
            <p className="text-charcoal/70 text-[15px] leading-relaxed">
              Explore our library of free guides, eBooks, and tools designed to help you on your journey to hormonal balance and vibrant health.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* The Hormone Balance eBook Card */}
            <Link href="/resources/ebook" className="group flex flex-col bg-white border border-[#EBE3DB] rounded-sm overflow-hidden hover:shadow-md transition-all">
              <div className="bg-[#FAF8F5] aspect-[4/3] flex items-center justify-center p-8 border-b border-[#EBE3DB] relative overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/daw1tscqr/image/upload/e_trim/v1783333186/NehaEbookMockup_3pjf7_1280_ip08ks.png" 
                  alt="Hormone Balance eBook" 
                  className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#8C6D40]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D40]">eBook</span>
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-3">The Hormone Balance Guide</h3>
                <p className="text-charcoal/70 text-sm mb-6 flex-1">
                  A simple, protein-based reset that helps balance hormones, control hunger, and kickstart fat loss without dieting or intense workouts.
                </p>
                <div className="text-[#8C6D40] text-[11px] font-semibold uppercase tracking-[0.15em] flex items-center gap-2">
                  Get Access Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Future Resources Placeholder */}
            <div className="flex flex-col bg-[#FAF8F5] border border-dashed border-[#DCD3C6] rounded-sm p-8 items-center justify-center text-center opacity-70">
              <div className="w-12 h-12 rounded-full bg-[#EBE3DB] flex items-center justify-center mb-4">
                <span className="text-charcoal text-xl">✨</span>
              </div>
              <h3 className="font-display text-xl text-charcoal mb-2">More Coming Soon</h3>
              <p className="text-charcoal/60 text-sm">
                Diet plans, meal templates, and wellness checklists are in the works!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Latest Blogs Section */}
      <section className="py-20 bg-white border-t border-[#EBE3DB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">
                Wellness Journal
              </span>
              <h2 className="font-display text-3xl lg:text-4xl text-charcoal">Latest Articles</h2>
            </div>
            <Link 
              href="/resources/blogs" 
              className="hidden sm:flex items-center gap-2 text-charcoal text-[11px] font-semibold uppercase tracking-[0.15em] hover:text-[#8C6D40] transition-colors"
            >
              View More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestBlogs.map(blog => (
              <Link 
                key={blog.id} 
                href={`/resources/blogs/${blog.id}`}
                className="group flex flex-col bg-[#FAF8F5] border border-[#EBE3DB] rounded-sm overflow-hidden hover:-translate-y-1 transition-transform"
              >
                {blog.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] bg-sage-50 border-b border-[#EBE3DB]" />
                )}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                    {blog.category}
                  </span>
                  <h3 className="font-display text-lg text-charcoal leading-tight line-clamp-2">
                    {blog.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 sm:hidden flex justify-center">
            <Link 
              href="/resources/blogs" 
              className="flex items-center gap-2 text-charcoal text-[11px] font-semibold uppercase tracking-[0.15em] border border-charcoal/20 px-6 py-3 rounded-sm hover:border-charcoal hover:bg-charcoal hover:text-white transition-all"
            >
              View All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
