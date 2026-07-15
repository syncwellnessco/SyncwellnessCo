"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Video, ExternalLink, Play } from "lucide-react";

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
  const [visibleCount, setVisibleCount] = useState(4); // Default to 4 items (1 row of 4 for blogs, or 4 for podcasts/press)

  const showMore = () => {
    setVisibleCount(prev => prev + 4);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map(podcast => {
            const videoId = getYouTubeId(podcast.content);
            const thumbnailUrl = videoId 
              ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
              : podcast.image || null;

            return (
              <a 
                key={podcast.id} 
                href={podcast.content}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white border border-[#EBE3DB] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden max-w-md mx-auto sm:max-w-none w-full"
              >
                <div className="relative aspect-video bg-charcoal overflow-hidden border-b border-[#EBE3DB]">
                  {thumbnailUrl ? (
                    <>
                      <img 
                        src={thumbnailUrl} 
                        alt={podcast.title} 
                        className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-colors">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition-transform group-hover:scale-110 duration-300">
                          <Play className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 fill-white text-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center text-charcoal/20">
                      <Video className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-5 flex flex-col flex-1 space-y-3">
                  <span className="text-[#8C6D40] text-[10px] font-bold uppercase tracking-[0.15em]">
                    YouTube Episode
                  </span>
                  <h3 className="font-display text-base sm:text-lg text-charcoal leading-snug line-clamp-2 group-hover:text-[#8C6D40] transition-colors">
                    {podcast.title}
                  </h3>
                  {podcast.excerpt && (
                    <p className="text-charcoal/70 text-xs sm:text-sm line-clamp-2 leading-relaxed flex-1">
                      {podcast.excerpt}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1.5 text-[#8C6D40] text-[11px] font-bold uppercase tracking-[0.15em] group-hover:text-[#B8955F] transition-colors pt-1 border-t border-[#FAF8F5] w-fit">
                    Watch <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
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
