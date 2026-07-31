"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Loader2, Star, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { uploadFileToCloudinary } from "@/lib/cloudinary-utils";
import { MediaUploader } from "@/components/ui/media-uploader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { useReviewStore, Review } from "@/store/review-store";
import { ReviewCardSkeleton, ReviewCardSkeletonGrid } from "@/components/ui/skeleton";

const CloudinaryBtn = ({ label, onSelectFile, onRemove, value, progress }: { label: string, onSelectFile: (f: File) => void, onRemove: () => void, value: string | File | null, progress?: number | null }) => (
  <MediaUploader
    label={label}
    labelPosition="bottom"
    value={value}
    accept="image/*"
    aspectRatioClass="aspect-[4/5] h-28 sm:h-32"
    progress={progress}
    onSelectFile={onSelectFile}
    onRemove={onRemove}
  />
);

export function ProgramReviewsSection({ programId }: { programId: string }) {
  const { user } = useUserStore();
  const { submittedReviews, addReview } = useReviewStore();
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : "");
  const displayName = rawName ? rawName.trim() : "Valued Member";
  const firstName = displayName.split(' ')[0];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [testimonial, setTestimonial] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [rating, setRating] = useState(5);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforeProgress, setBeforeProgress] = useState<number | null>(null);
  const [afterProgress, setAfterProgress] = useState<number | null>(null);

  const INITIAL_REVIEW_LIMIT = 6; // 2 rows of 3 reviews
  const REVIEW_BATCH_SIZE = 6;     // batch size for load more

  // Combine database reviews with Zustand local reviews
  const combinedReviews: Review[] = [
    ...submittedReviews.filter((sr) => !programId || sr.program_id === programId),
    ...reviews.filter((r) => !submittedReviews.some((sr) => sr.id === r.id)),
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews?programId=${programId}&status=published&limit=${INITIAL_REVIEW_LIMIT}&offset=0`)
      .then((res) => res.json())
      .then((res) => {
        if (res && typeof res === "object" && "data" in res) {
          setReviews(res.data || []);
          setTotalReviews(res.total || 0);
          setHasMoreReviews(res.hasMore ?? false);
        } else {
          setReviews(Array.isArray(res) ? res : []);
          setTotalReviews(Array.isArray(res) ? res.length : 0);
          setHasMoreReviews(false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [programId]);

  useEffect(() => {
    if (activeReview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeReview]);

  const handleLoadMoreReviews = async () => {
    if (loadingMoreReviews) return;
    setLoadingMoreReviews(true);
    try {
      const currentOffset = reviews.length;
      const res = await fetch(`/api/reviews?programId=${programId}&status=published&limit=${REVIEW_BATCH_SIZE}&offset=${currentOffset}`).then((r) => r.json());
      if (res && res.data) {
        setReviews((prev) => [...prev, ...res.data]);
        setTotalReviews(res.total || totalReviews);
        setHasMoreReviews(res.hasMore ?? false);
      }
    } catch (e) {
      console.error("Error loading more reviews:", e);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonial.trim()) {
      toast.error("Please share your experience before submitting");
      return;
    }

    setSubmitting(true);
    setBeforeProgress(null);
    setAfterProgress(null);
    try {
      let finalBeforeUrl = beforeImage;
      let finalAfterUrl = afterImage;

      if (beforeFile || afterFile) {
        toast.loading("Uploading transformation photos...", { id: "uploading-review-photos" });
        const uploadPromises: Promise<any>[] = [];
        if (beforeFile) {
          setBeforeProgress(0);
          uploadPromises.push(
            uploadFileToCloudinary(
              beforeFile,
              process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_REVIEWS || "syncwellness",
              (p) => setBeforeProgress(p)
            ).then((res) => (finalBeforeUrl = res.url))
          );
        }
        if (afterFile) {
          setAfterProgress(0);
          uploadPromises.push(
            uploadFileToCloudinary(
              afterFile,
              process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_REVIEWS || "syncwellness",
              (p) => setAfterProgress(p)
            ).then((res) => (finalAfterUrl = res.url))
          );
        }
        await Promise.all(uploadPromises);
        toast.dismiss("uploading-review-photos");
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, name: displayName, testimonial, beforeImage: finalBeforeUrl, afterImage: finalAfterUrl, rating }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const newReview: Review = json?.data || {
          id: `local-${Date.now()}`,
          name: displayName,
          testimonial,
          before_image: finalBeforeUrl || null,
          after_image: finalAfterUrl || null,
          rating: rating || 5,
          featured_on_home: false,
          created_at: new Date().toISOString(),
        };

        // Immediately add to Zustand store so it shows without refresh
        addReview({
          ...newReview,
          program_id: programId,
          featured_on_home: false,
        });

        toast.success("Thank you! Your review has been submitted.");
        setIsModalOpen(false);
        setTestimonial("");
        setBeforeImage("");
        setBeforeFile(null);
        setBeforeProgress(null);
        setAfterImage("");
        setAfterFile(null);
        setAfterProgress(null);
        setRating(5);
      } else {
        toast.error("Failed to submit review");
      }
    } catch (e: any) {
      toast.dismiss("uploading-review-photos");
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
      setBeforeProgress(null);
      setAfterProgress(null);
    }
  };

  return (
    <div className="py-10 sm:py-16 mt-10 border-t border-beige-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">Program Reviews</h2>
            
            <Button onClick={() => setIsModalOpen(true)} className="bg-charcoal hover:bg-charcoal/90 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[11px] sm:text-sm h-8 sm:h-10 shrink-0">
              Write a Review
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {combinedReviews.length > 0 ? (
              <>
                <div className="flex text-[#8C6D40]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.round(combinedReviews.reduce((a, b) => a + (b.rating || 5), 0) / combinedReviews.length) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-charcoal text-xs sm:text-base">{((combinedReviews.reduce((a, b) => a + (b.rating || 5), 0) / combinedReviews.length) || 0).toFixed(1)}</span>
                <span className="text-charcoal/60 text-xs sm:text-sm">({combinedReviews.length} reviews)</span>
              </>
            ) : (
              <p className="text-charcoal/70 text-xs sm:text-sm">See what others are saying about this program.</p>
            )}
          </div>
        </div>

        {loading ? (
          /* Written Reviews Skeleton Grid Loader (6 count = 2 rows of 3) */
          <ReviewCardSkeletonGrid count={INITIAL_REVIEW_LIMIT} />
        ) : combinedReviews.length === 0 ? (
          <div className="text-center py-10 bg-[#FAF9F7] rounded-2xl border border-beige-100">
            <Star className="h-12 w-12 text-[#8C6D40]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No reviews yet</h3>
            <p className="text-charcoal/60 mb-6">Be the first to share your experience!</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="border-[#8C6D40] text-[#8C6D40] hover:bg-[#8C6D40] hover:text-white rounded-full">
              Write a Review
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {combinedReviews.map((r) => (
                <article 
                  key={r.id}
                  className="bg-white rounded-md border border-beige-200 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#8C6D40]/30 group/card flex flex-col h-full overflow-hidden text-left"
                  onClick={() => setActiveReview(r)}
                >
                  {/* Images Top Half */}
                  <div className="relative w-full aspect-[16/10] bg-charcoal/5 flex overflow-hidden border-b border-beige-100 shrink-0">
                    {r.before_image || r.after_image ? (
                      <>
                        {r.before_image && (
                          <div className={`relative h-full ${r.after_image ? "w-1/2" : "w-full"}`}>
                            <img src={r.before_image} alt="Before" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] sm:text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm backdrop-blur-sm z-10">Before</span>
                          </div>
                        )}
                        {r.after_image && (
                          <div className={`relative h-full ${r.before_image ? "w-1/2" : "w-full"}`}>
                            <img src={r.after_image} alt="After" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
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

                  {/* Content Bottom Half */}
                  <div className="p-4 sm:p-6 flex flex-col flex-1 bg-white">
                    <div className="flex-1 mb-4 sm:mb-5">
                      <p className="text-charcoal/80 text-xs sm:text-[13px] leading-relaxed italic line-clamp-4 relative z-10">
                        "{r.testimonial}"
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-beige-100 mt-auto">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#8C6D40]/10 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-sm shrink-0">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal text-xs sm:text-[13px] truncate max-w-[120px] sm:max-w-[160px]">{r.name}</h4>
                        <div className="flex text-[#8C6D40] mt-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`h-2.5 w-2.5 ${i < (r.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Skeleton Cards while loading more reviews */}
              {loadingMoreReviews &&
                [...Array(REVIEW_BATCH_SIZE)].map((_, i) => (
                  <ReviewCardSkeleton key={`review-skel-${i}`} />
                ))}
            </div>

            {/* LOAD MORE BUTTON FOR REVIEWS */}
            {hasMoreReviews && (
              <div className="flex flex-col items-center justify-center pt-8 sm:pt-12 pb-4 sm:pb-8 gap-2 text-center">
                <button
                  onClick={handleLoadMoreReviews}
                  disabled={loadingMoreReviews}
                  className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-sm bg-charcoal text-cream text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#8C6D40] disabled:opacity-60 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <span>{loadingMoreReviews ? "Loading Reviews..." : "Load More Reviews"}</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5 text-gold-light" />
                </button>
                <p className="text-[11px] text-charcoal/50">
                  Showing {combinedReviews.length} of {totalReviews || combinedReviews.length} written reviews
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-3xl lg:max-w-4xl shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto md:overflow-visible">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-charcoal/50 hover:text-charcoal p-1.5 rounded-full hover:bg-beige-100 transition-colors"
              aria-label="Close review modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-4 sm:p-6 md:p-8">
              <div className="mb-4 sm:mb-6 pr-8">
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal mb-1">Write a Review</h3>
                <p className="text-charcoal/80 text-xs sm:text-sm font-medium">
                  Hi {firstName}! How has your experience been with this program?
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
                {/* Left Column: Form Details */}
                <div className="space-y-3.5 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-charcoal/80 mb-1.5">Rating</label>
                    <div className="flex gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`transition-colors ${star <= rating ? 'text-[#8C6D40]' : 'text-gray-300 hover:text-[#8C6D40]/50'}`}
                        >
                          <Star className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-charcoal/80 mb-1">Share Your Experience</label>
                    <textarea 
                      value={testimonial} 
                      onChange={e => setTestimonial(e.target.value)} 
                      required 
                      rows={4} 
                      className="w-full px-3.5 py-2.5 text-sm rounded-md border border-beige-200 focus:border-[#8C6D40] focus:ring-1 focus:ring-[#8C6D40] outline-none transition-colors resize-none" 
                      placeholder="Tell us what you loved about this program, the transformation you experienced, or how it helped your health..." 
                    />
                  </div>
                </div>

                {/* Right Column: Images & Submit */}
                <div className="flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                        Transformation Photos <span className="text-[10px] font-normal lowercase tracking-normal text-charcoal/40 ml-0.5">(optional)</span>
                      </span>
                      <span className="text-[10px] text-charcoal/50 font-medium">Vertical 4:5 format</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <CloudinaryBtn 
                        label="Before Image" 
                        value={beforeFile || beforeImage} 
                        progress={beforeProgress}
                        onSelectFile={(f) => setBeforeFile(f)} 
                        onRemove={() => {
                          setBeforeFile(null);
                          setBeforeProgress(null);
                          setBeforeImage("");
                        }}
                      />
                      <CloudinaryBtn 
                        label="After Image" 
                        value={afterFile || afterImage} 
                        progress={afterProgress}
                        onSelectFile={(f) => setAfterFile(f)} 
                        onRemove={() => {
                          setAfterFile(null);
                          setAfterProgress(null);
                          setAfterImage("");
                        }}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full bg-[#8C6D40] hover:bg-[#B8955F] text-white h-10 sm:h-12 text-sm sm:text-base font-semibold rounded-full mt-2"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Read Modal */}
      <AnimatePresence>
        {activeReview && (() => {
          const hasBefore = !!activeReview.before_image;
          const hasAfter = !!activeReview.after_image;
          const hasImages = hasBefore || hasAfter;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto"
              onClick={() => setActiveReview(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "relative w-full overflow-hidden rounded-md bg-[#FAF9F7] shadow-2xl border border-beige-200 flex flex-col md:flex-row my-8",
                  hasImages ? "max-w-4xl" : "max-w-xl"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveReview(null)}
                  className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/10 text-charcoal hover:bg-charcoal/20 transition-colors shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Left Side: Images */}
                {hasImages && (
                  <div className="relative w-full h-[300px] md:h-auto md:w-[460px] lg:w-[500px] bg-beige-100 flex overflow-hidden md:min-h-[460px] shrink-0 border-b md:border-b-0 md:border-r border-beige-200">
                    {hasBefore && (
                      <div className={cn("relative h-full", hasAfter ? "w-1/2 border-r border-beige-200/50" : "w-full")}>
                        <img
                          src={activeReview.before_image!}
                          alt="Before"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="absolute bottom-4 left-4 bg-black/75 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-sm backdrop-blur-md z-10 shadow-sm">
                          Before
                        </span>
                      </div>
                    )}
                    {hasAfter && (
                      <div className={cn("relative h-full", hasBefore ? "w-1/2" : "w-full")}>
                        <img
                          src={activeReview.after_image!}
                          alt="After"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="absolute bottom-4 right-4 bg-black/75 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-sm backdrop-blur-md z-10 shadow-sm">
                          After
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Right Side: Content */}
                <div className="w-full md:flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-[#FAF9F7] text-charcoal">
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Star Rating */}
                    <div className="flex text-[#8C6D40] mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4.5 w-4.5 ${
                            i < (activeReview.rating || 5) ? "fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Testimonial Quote */}
                    <div className="relative mb-6">
                      <span className="absolute -top-4 -left-3 font-serif text-5xl text-[#8C6D40]/10 pointer-events-none select-none">
                        “
                      </span>
                      <p className="text-charcoal/90 text-sm sm:text-base leading-relaxed italic relative z-10 font-serif whitespace-pre-wrap">
                        "{activeReview.testimonial}"
                      </p>
                    </div>
                  </div>

                  {/* Client Profile */}
                  <div className="flex items-center gap-3 pt-5 border-t border-beige-200/60 mt-auto">
                    <div className="h-10 w-10 rounded-full bg-[#8C6D40]/10 flex items-center justify-center font-display font-semibold text-[#8C6D40] text-sm shrink-0">
                      {activeReview.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal text-sm">
                        {activeReview.name}
                      </h4>
                      <span className="text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#8C6D40]" />
                        Verified Client
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
