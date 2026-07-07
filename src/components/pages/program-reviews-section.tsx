"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Upload, Loader2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import { optimizeCloudinaryUrl, deleteCloudinaryFile } from "@/lib/cloudinary-utils";
import useEmblaCarousel from "embla-carousel-react";

interface Review {
  id: string;
  name: string;
  testimonial: string;
  before_image: string | null;
  after_image: string | null;
  rating: number;
  created_at: string;
}

const CloudinaryBtn = ({ label, onUpload, onRemove, value }: { label: string, onUpload: (u: string, pId: string) => void, onRemove: () => void, value: string }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-baseline">
      <span className="text-sm font-medium text-charcoal/80">{label}</span>
      {!value && <span className="text-[10px] text-charcoal/50 font-medium">Aspect ratio: 4:5 vertical</span>}
    </div>
    {value ? (
      <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden border border-[#EBE3DB]">
        <img src={value} alt="Preview" className="w-full h-full object-cover" />
        <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <CldUploadWidget 
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_REVIEWS || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "syncwellness"}
        options={{ 
          folder: 'syncwellness/reviews',
          multiple: false,
          cropping: true,
          croppingAspectRatio: 0.8,
          showSkipCropButton: false
        }}
        onSuccess={(res: any) => {
          if (res?.info?.secure_url) {
            const optimizedUrl = optimizeCloudinaryUrl(res.info.secure_url);
            onUpload(optimizedUrl, res.info.public_id);
          }
        }}
      >
        {({ open }) => (
          <button type="button" onClick={() => open()} className="w-full aspect-[4/5] border-2 border-dashed border-[#EBE3DB] rounded-md flex flex-col items-center justify-center text-charcoal/50 hover:bg-[#FAF8F5] hover:border-[#8C6D40] transition-colors">
            <Upload className="h-6 w-6 mb-2" />
            <span className="text-xs">Click to upload</span>
            <span className="text-[10px] text-charcoal/40 mt-1">4:5 vertical format only</span>
          </button>
        )}
      </CldUploadWidget>
    )}
  </div>
);

export function ProgramReviewsSection({ programId }: { programId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [beforePublicId, setBeforePublicId] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [afterPublicId, setAfterPublicId] = useState("");
  const [rating, setRating] = useState(5);

  // Carousel hooks
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 }
    }
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetch(`/api/reviews?programId=${programId}&status=published`)
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !testimonial) {
      toast.error("Please provide your name and review");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, name, testimonial, beforeImage, afterImage, rating }),
      });

      if (res.ok) {
        toast.success("Thank you! Your review has been submitted for approval.");
        setIsModalOpen(false);
        setName("");
        setTestimonial("");
        setBeforeImage("");
        setBeforePublicId("");
        setAfterImage("");
        setAfterPublicId("");
        setRating(5);
      } else {
        toast.error("Failed to submit review");
        if (beforePublicId) await deleteCloudinaryFile(beforePublicId, 'image');
        if (afterPublicId) await deleteCloudinaryFile(afterPublicId, 'image');
      }
    } catch (e) {
      toast.error("Something went wrong");
      if (beforePublicId) await deleteCloudinaryFile(beforePublicId, 'image');
      if (afterPublicId) await deleteCloudinaryFile(afterPublicId, 'image');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 mt-16 border-t border-beige-200">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">Program Reviews</h2>
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {reviews.length > 1 && (
                <div className="flex gap-1.5 sm:gap-2">
                  <Button 
                    onClick={scrollPrev} 
                    disabled={!prevBtnEnabled} 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-beige-200 text-charcoal hover:bg-[#FAF8F5] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </Button>
                  <Button 
                    onClick={scrollNext} 
                    disabled={!nextBtnEnabled} 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-beige-200 text-charcoal hover:bg-[#FAF8F5] disabled:opacity-40"
                  >
                    <ChevronRight className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}
              <Button onClick={() => setIsModalOpen(true)} className="bg-charcoal hover:bg-charcoal/90 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[11px] sm:text-sm h-8 sm:h-10">
                Write a Review
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {reviews.length > 0 ? (
              <>
                <div className="flex text-[#8C6D40]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.round(reviews.reduce((a, b) => a + (b.rating || 5), 0) / reviews.length) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-charcoal text-xs sm:text-base">{((reviews.reduce((a, b) => a + (b.rating || 5), 0) / reviews.length) || 0).toFixed(1)}</span>
                <span className="text-charcoal/60 text-xs sm:text-sm">({reviews.length} reviews)</span>
              </>
            ) : (
              <p className="text-charcoal/70 text-xs sm:text-sm">See what others are saying about this program.</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#8C6D40]" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF9F7] rounded-2xl border border-beige-100">
            <Star className="h-12 w-12 text-[#8C6D40]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No reviews yet</h3>
            <p className="text-charcoal/60 mb-6">Be the first to share your experience!</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="border-[#8C6D40] text-[#8C6D40] hover:bg-[#8C6D40] hover:text-white rounded-full">
              Write a Review
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {reviews.map(r => (
                <div key={r.id} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] min-w-0 py-1">
                  <article 
                    className="bg-white rounded-md border border-beige-200 shadow-sm cursor-pointer flex flex-col h-full overflow-hidden text-left"
                    onClick={() => setActiveReview(r)}
                  >
                    {/* Images Top Half - Shorter aspect ratio on mobile */}
                    <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] bg-charcoal/5 flex overflow-hidden border-b border-beige-100 shrink-0">
                      {r.before_image || r.after_image ? (
                        <>
                          {r.before_image && (
                            <div className={`relative h-full ${r.after_image ? "w-1/2" : "w-full"}`}>
                              <img src={r.before_image} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">Before</span>
                            </div>
                          )}
                          {r.after_image && (
                            <div className={`relative h-full ${r.before_image ? "w-1/2" : "w-full"}`}>
                              <img src={r.after_image} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">After</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F5]">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#8C6D40]/10 flex items-center justify-center mb-2">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#8C6D40] opacity-50" />
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8C6D40] opacity-60">Verified Experience</span>
                        </div>
                      )}
                    </div>

                    {/* Content Bottom Half - Smaller padding, sizes, and line clamps on mobile */}
                    <div className="p-3.5 sm:p-6 flex flex-col flex-1 bg-white">
                      <div className="flex-1 mb-3 sm:mb-5">
                        <p className="text-charcoal/80 text-[11px] sm:text-[13px] leading-relaxed italic line-clamp-3 sm:line-clamp-4 relative z-10">
                          "{r.testimonial}"
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 pt-2.5 sm:pt-4 border-t border-beige-100 mt-auto">
                        <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-[#8C6D40]/10 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-xs sm:text-sm shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal text-[11px] sm:text-[13px] truncate max-w-[120px] sm:max-w-[160px]">{r.name}</h4>
                          <div className="flex text-[#8C6D40] mt-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-2 w-2 sm:h-2.5 sm:w-2.5 ${i < (r.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-md w-full max-w-lg shadow-2xl relative my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal">
              <X className="h-5 w-5" />
            </button>
            <div className="p-8">
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-2">Write a Review</h3>
              <p className="text-charcoal/60 text-sm mb-6">Share your transformation story to inspire others.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-1">Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-md border border-beige-200 focus:border-[#8C6D40] focus:ring-1 focus:ring-[#8C6D40] outline-none transition-colors" placeholder="e.g. Sarah J." />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-colors ${star <= rating ? 'text-[#8C6D40]' : 'text-gray-300 hover:text-[#8C6D40]/50'}`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-1">Your Experience</label>
                  <textarea value={testimonial} onChange={e => setTestimonial(e.target.value)} required rows={4} className="w-full px-4 py-3 rounded-md border border-beige-200 focus:border-[#8C6D40] focus:ring-1 focus:ring-[#8C6D40] outline-none transition-colors resize-none" placeholder="How did this program help you?" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CloudinaryBtn 
                    label="Before Image (Optional)" 
                    value={beforeImage} 
                    onUpload={(u, pId) => { setBeforeImage(u); setBeforePublicId(pId); }} 
                    onRemove={async () => {
                      if (beforePublicId) await deleteCloudinaryFile(beforePublicId, 'image');
                      setBeforeImage("");
                      setBeforePublicId("");
                    }}
                  />
                  <CloudinaryBtn 
                    label="After Image (Optional)" 
                    value={afterImage} 
                    onUpload={(u, pId) => { setAfterImage(u); setAfterPublicId(pId); }} 
                    onRemove={async () => {
                      if (afterPublicId) await deleteCloudinaryFile(afterPublicId, 'image');
                      setAfterImage("");
                      setAfterPublicId("");
                    }}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-[#8C6D40] hover:bg-[#B8955F] text-white h-12 text-base font-semibold rounded-full mt-4">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Read Modal */}
      {activeReview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm overflow-y-auto" onClick={() => setActiveReview(null)}>
          <div className="bg-white rounded-md w-full max-w-2xl shadow-2xl relative my-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveReview(null)} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal z-10 bg-white/80 rounded-full p-1">
              <X className="h-6 w-6" />
            </button>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#8C6D40]/20 flex items-center justify-center font-display font-bold text-[#8C6D40] text-xl">
                  {activeReview.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-charcoal">{activeReview.name}</h4>
                  <div className="flex text-[#8C6D40]">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < (activeReview.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />)}
                  </div>
                </div>
              </div>
              <p className="text-charcoal/90 text-base md:text-lg leading-relaxed italic mb-8 whitespace-pre-wrap">"{activeReview.testimonial}"</p>
              
              <div className="relative rounded-sm overflow-hidden w-full aspect-[1.6] flex bg-black/5 ring-1 ring-black/10">
                <div className="relative h-full w-1/2 bg-charcoal/5 flex items-center justify-center">
                  {activeReview.before_image ? (
                    <img src={activeReview.before_image} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Star className="h-8 w-8 text-charcoal/20" />
                      <span className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-md z-10">Before</span>
                </div>
                

                
                <div className="relative h-full w-1/2 bg-charcoal/5 flex items-center justify-center">
                  {activeReview.after_image ? (
                    <img src={activeReview.after_image} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Star className="h-8 w-8 text-charcoal/20" />
                      <span className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm backdrop-blur-md z-10">After</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
