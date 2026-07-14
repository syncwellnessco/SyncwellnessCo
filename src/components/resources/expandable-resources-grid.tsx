"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Video, ExternalLink } from "lucide-react";

type ResourceItem = {
  id: string;
  title: string;
  category: string;
  content: string; // URL
  image?: string | null;
  author?: string | null;
  excerpt?: string | null;
  slug?: string | null;
};

type ExpandableGridProps = {
  items: ResourceItem[];
  type: "podcast" | "media" | "blog";
};

export function ExpandableGrid({ items, type }: ExpandableGridProps) {
  const [visibleCount, setVisibleCount] = useState(type === "blog" ? 8 : 4); // Default to 8 blogs (2 rows of 4) or 4 podcasts/press (2 rows of 2 on mobile)

  const showMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  if (type === "blog") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {visibleItems.map(blog => (
            <Link 
              key={blog.id} 
              href={`/resources/blogs/${blog.slug || blog.id}`}
              className="group flex flex-col bg-white border border-[#EBE3DB] hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {blog.image ? (
                <div className="relative aspect-[4/3] overflow-hidden border-b border-[#EBE3DB]">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] bg-sage-50 border-b border-[#EBE3DB]" />
              )}
              <div className="p-3 md:p-5 flex flex-col flex-1 space-y-2">
                <span className="text-[#8C6D40] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em]">
                  {blog.category}
                </span>
                <h3 className="font-display text-xs sm:text-sm md:text-base text-charcoal leading-snug line-clamp-2 group-hover:text-[#8C6D40] transition-colors">
                  {blog.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button 
              onClick={showMore}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#8C6D40] text-[#8C6D40] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#8C6D40] hover:text-white transition-all duration-300"
            >
              Show More Articles <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === "podcast") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {visibleItems.map(podcast => {
            const videoId = getYouTubeId(podcast.content);
            return (
              <div 
                key={podcast.id} 
                className="flex flex-col bg-white border border-[#EBE3DB] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-video bg-charcoal overflow-hidden border-b border-[#EBE3DB]">
                  {videoId ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${videoId}`} 
                      title={podcast.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : podcast.image ? (
                    <img 
                      src={podcast.image} 
                      alt={podcast.title} 
                      className="w-full h-full object-cover opacity-95"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center text-charcoal/20">
                      <Video className="w-8 h-8 md:w-12 md:h-12" />
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-5 flex flex-col flex-1 space-y-2 md:space-y-3">
                  <span className="text-[#8C6D40] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em]">
                    YouTube Episode
                  </span>
                  <h3 className="font-display text-xs sm:text-sm md:text-lg text-charcoal leading-snug line-clamp-2">
                    {podcast.title}
                  </h3>
                  {podcast.excerpt && (
                    <p className="text-charcoal/70 text-[10px] sm:text-xs md:text-sm line-clamp-2 leading-relaxed flex-1">
                      {podcast.excerpt}
                    </p>
                  )}
                  <a 
                    href={podcast.content} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 text-[#8C6D40] text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] hover:text-[#B8955F] transition-colors pt-1 border-t border-[#FAF8F5] w-fit"
                  >
                    Watch <ExternalLink className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button 
              onClick={showMore}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#8C6D40] text-[#8C6D40] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#8C6D40] hover:text-white transition-all duration-300"
            >
              Show More Podcasts <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {visibleItems.map(article => (
          <a 
            key={article.id} 
            href={article.content} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex flex-col bg-[#FAF8F5] border border-[#EBE3DB] p-3 md:p-5 hover:shadow-md hover:bg-white transition-all duration-300 relative w-full"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <span className="font-display text-[10px] sm:text-xs md:text-base font-bold tracking-widest text-[#8C6D40] uppercase truncate max-w-[80%]">
                {article.author || "Press"}
              </span>
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white flex items-center justify-center border border-[#EBE3DB] text-charcoal/40 group-hover:text-[#8C6D40] group-hover:border-[#8C6D40] transition-colors shadow-sm">
                <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </div>
            </div>
            {article.image && (
              <div className="w-full aspect-[4/5] mb-3 md:mb-4 overflow-hidden rounded-sm border border-[#EBE3DB]/60 bg-white">
                <img 
                  src={article.image} 
                  alt={article.author || ""} 
                  className="w-full h-full object-cover opacity-95 group-hover:scale-102 transition-transform duration-300"
                />
              </div>
            )}
            <h3 className="font-display text-xs sm:text-sm md:text-lg text-charcoal leading-snug mb-2 group-hover:text-[#8C6D40] transition-colors line-clamp-2">
              "{article.title}"
            </h3>
            {article.excerpt && (
              <p className="text-charcoal/70 text-[10px] sm:text-xs md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed border-t border-[#EBE3DB] pt-2 md:pt-3 mt-auto">
                {article.excerpt}
              </p>
            )}
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={showMore}
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#8C6D40] text-[#8C6D40] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#8C6D40] hover:text-white transition-all duration-300"
          >
            Show More Press <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
