"use client";

import { useState } from "react";
import { MessageSquare, Video } from "lucide-react";
import { ReviewsManager } from "./reviews-manager";
import { VideoTestimonialsManager } from "./video-testimonials-manager";

type SubTab = "written" | "videos";

export function TestimonialsManager() {
  const [subTab, setSubTab] = useState<SubTab>("written");

  return (
    <div className="space-y-6">
      {/* Sub-tab selector */}
      <div className="flex gap-2 border-b border-[#EBE3DB] mb-6">
        <button 
          onClick={() => setSubTab("written")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${
            subTab === "written" 
              ? "border-[#8C6D40] text-[#8C6D40]" 
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Written Reviews
        </button>
        <button 
          onClick={() => setSubTab("videos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${
            subTab === "videos" 
              ? "border-[#8C6D40] text-[#8C6D40]" 
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <Video className="h-4 w-4" />
          Video Testimonials
        </button>
      </div>

      <div>
        {subTab === "written" ? <ReviewsManager /> : <VideoTestimonialsManager />}
      </div>
    </div>
  );
}
