"use client";

import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Eye, Star, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CldUploadWidget } from "next-cloudinary";
import { optimizeCloudinaryUrl, deleteCloudinaryFile } from "@/lib/cloudinary-utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface Review {
  id: string;
  program_id: string;
  name: string;
  testimonial: string;
  before_image: string | null;
  after_image: string | null;
  rating: number;
  status: string;
  featured_on_home: boolean;
  created_at: string;
}

const SingleImageUploader = memo(({ label, value, onUpload, onRemove, id }: { label: string, value: string, onUpload: (url: string, pId: string) => void, onRemove: () => void, id: string }) => {
  const options = useMemo(() => ({
    folder: 'syncwellness/reviews',
    multiple: false,
    tags: [id],
    cropping: true,
    croppingAspectRatio: 0.8, // 4:5 vertical aspect ratio
    showSkipCropButton: false
  }), [id]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-charcoal/80">{label}</span>
        <span className="text-[10px] text-charcoal/50 font-medium">Aspect ratio: 4:5 vertical</span>
      </div>
      {!value ? (
        <CldUploadWidget 
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_REVIEWS || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "syncwellness"}
          options={options}
          onSuccess={(res: any) => {
            if (res?.info?.secure_url) {
              const optimizedUrl = optimizeCloudinaryUrl(res.info.secure_url);
              onUpload(optimizedUrl, res.info.public_id);
            }
          }}
        >
          {({ open }) => (
            <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full aspect-[4/5] border-2 border-dashed border-[#EBE3DB] rounded-md flex flex-col items-center justify-center text-charcoal/50 hover:bg-[#FAF8F5] hover:border-[#8C6D40] transition-colors bg-[#FAF8F5]">
              <Upload className="h-6 w-6 mb-2" />
              <span className="text-xs">Click to upload</span>
              <span className="text-[10px] text-charcoal/40 mt-1">4:5 vertical format only</span>
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden border border-[#EBE3DB]">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button type="button" onClick={(e) => { e.preventDefault(); onRemove(); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors z-10">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});
SingleImageUploader.displayName = "SingleImageUploader";

export function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewReview, setViewReview] = useState<Review | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Add Form
  const [form, setForm] = useState({ name: "", testimonial: "", programId: "", beforeImage: "", beforePublicId: "", afterImage: "", afterPublicId: "", rating: 5, published: true });
  const [submitting, setSubmitting] = useState(false);
  const uploadTargetRef = useRef<'before' | 'after' | null>(null);

  const fetchReviews = () => {
    fetch("/api/reviews").then(res => res.json()).then(data => setReviews(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/reviews").then(res => res.json()),
      fetch("/api/programs").then(res => res.json())
    ]).then(([revData, progData]) => {
      setReviews(Array.isArray(revData) ? revData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
      setLoading(false);
    });
  }, []);

  // NOTE: these hooks were previously declared AFTER the `if (loading) return ...`
  // early-return below. That's a Rules-of-Hooks violation: while `loading` is
  // true, React never calls these four useCallback hooks, then the instant
  // `loading` flips to false, React suddenly sees 4 new hooks it didn't see
  // before and throws a hook-count-mismatch error. That error is what was
  // tearing down and remounting the whole component (wiping `form`,
  // `editingId`, upload state, etc). Moving them above the early return fixes it.
  const handleBeforeUpload = useCallback((url: string, pId: string) => {
    setForm(prev => ({...prev, beforeImage: url, beforePublicId: pId}));
  }, []);

  const handleBeforeRemove = useCallback(async () => {
    if (form.beforePublicId) await deleteCloudinaryFile(form.beforePublicId, 'image');
    setForm(prev => ({...prev, beforeImage: "", beforePublicId: ""}));
  }, [form.beforePublicId]);

  const handleAfterUpload = useCallback((url: string, pId: string) => {
    setForm(prev => ({...prev, afterImage: url, afterPublicId: pId}));
  }, []);

  const handleAfterRemove = useCallback(async () => {
    if (form.afterPublicId) await deleteCloudinaryFile(form.afterPublicId, 'image');
    setForm(prev => ({...prev, afterImage: "", afterPublicId: ""}));
  }, [form.afterPublicId]);

  const getProgramName = (id: string) => {
    const p = programs.find(x => x.id === id);
    return p ? p.title : "Unknown Program";
  };

  const updateStatus = async (id: string, updates: Partial<Review>) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(`Review updated`);
        setReviews(reviews.map(r => r.id === id ? { ...r, ...updates } : r));
        if (viewReview && viewReview.id === id) {
          setViewReview({ ...viewReview, ...updates });
        }
      } else {
        toast.error("Failed to update");
      }
    } catch (e) {
      toast.error("Error updating");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`/api/reviews/${deleteConfirmId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Review deleted");
        setReviews(reviews.filter(r => r.id !== deleteConfirmId));
        if (viewReview?.id === deleteConfirmId) setViewReview(null);
      }
    } catch (e) {
      toast.error("Error deleting review");
    }
  };

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const executeCancel = async () => {
    if (!editingId) {
      if (form.beforePublicId) await deleteCloudinaryFile(form.beforePublicId, 'image');
      if (form.afterPublicId) await deleteCloudinaryFile(form.afterPublicId, 'image');
    }
    setForm({ name: "", testimonial: "", programId: "", beforeImage: "", beforePublicId: "", afterImage: "", afterPublicId: "", rating: 5, published: true });
    setIsAddModalOpen(false);
    setEditingId(null);
    setShowCancelConfirm(false);
  };

  const handleSaveWithStatus = async (publish: boolean) => {
    if (!form.name || !form.testimonial || !form.programId) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const isEditing = !!editingId;
      // Convert camelCase to snake_case for PATCH body to match DB schema
      const payload = isEditing ? {
        name: form.name,
        testimonial: form.testimonial,
        program_id: form.programId,
        before_image: form.beforeImage,
        after_image: form.afterImage,
        rating: form.rating,
        status: publish ? 'published' : 'pending'
      } : {
        programId: form.programId,
        name: form.name,
        testimonial: form.testimonial,
        beforeImage: form.beforeImage,
        afterImage: form.afterImage,
        rating: form.rating,
        status: publish ? 'published' : 'pending'
      };

      const res = await fetch(isEditing ? `/api/reviews/${editingId}` : "/api/reviews", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(isEditing ? (publish ? "Review updated & published!" : "Review saved as draft!") : (publish ? "Review published!" : "Review saved as draft!"));
        setIsAddModalOpen(false);
        setEditingId(null);
        setForm({ name: "", testimonial: "", programId: "", beforeImage: "", beforePublicId: "", afterImage: "", afterPublicId: "", rating: 5, published: true });
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error || "Unknown"}`);
        if (!isEditing && form.beforePublicId) await deleteCloudinaryFile(form.beforePublicId, 'image');
        if (!isEditing && form.afterPublicId) await deleteCloudinaryFile(form.afterPublicId, 'image');
      }
    } catch {
      toast.error("Error saving review");
      if (!editingId && form.beforePublicId) await deleteCloudinaryFile(form.beforePublicId, 'image');
      if (!editingId && form.afterPublicId) await deleteCloudinaryFile(form.afterPublicId, 'image');
    }
    setSubmitting(false);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveWithStatus(true);
  };

  const openEditModal = (review: Review) => {
    setForm({
      name: review.name || "",
      testimonial: review.testimonial || "",
      programId: review.program_id || "",
      beforeImage: review.before_image || "",
      beforePublicId: "", // Optional since we don't have it
      afterImage: review.after_image || "",
      afterPublicId: "",
      rating: review.rating || 5,
      published: review.status === 'published'
    });
    setEditingId(review.id);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    if (form.beforePublicId) deleteCloudinaryFile(form.beforePublicId, 'image');
    if (form.afterPublicId) deleteCloudinaryFile(form.afterPublicId, 'image');
    setIsAddModalOpen(false);
    setEditingId(null);
    setForm({ name: "", testimonial: "", programId: "", beforeImage: "", beforePublicId: "", afterImage: "", afterPublicId: "", rating: 5, published: true });
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display text-charcoal">Reviews</h2>
          <p className="text-sm text-charcoal/60 mt-1">Manage user reviews and publish them to program pages.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setIsAddModalOpen(true); }} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white">
          Add Review Manually
        </Button>
      </div>
      
      <div className="overflow-x-auto border border-[#EBE3DB] rounded-md shadow-sm bg-white">
        <table className="w-full text-left text-sm text-charcoal">
          <thead className="bg-[#FAF8F5] text-charcoal/60 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">User & Images</th>
              <th className="px-4 py-3 font-semibold">Program</th>
              <th className="px-4 py-3 font-semibold">Testimonial</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {reviews.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-charcoal/50">No reviews found.</td></tr>
            ) : (
              reviews.map(review => (
                <tr key={review.id} className="hover:bg-[#FAF8F5]/50">
                  <td className="px-4 py-4">
                    <div className="font-medium">{review.name}</div>
                    <div className="text-[10px] text-charcoal/50 mb-2">{new Date(review.created_at).toLocaleDateString()}</div>
                    <div className="flex gap-2">
                      {review.before_image && (
                         <a href={review.before_image} target="_blank" rel="noreferrer" className="block text-[10px] text-[#8C6D40] hover:underline border border-[#8C6D40]/20 rounded px-1">Before</a>
                      )}
                      {review.after_image && (
                         <a href={review.after_image} target="_blank" rel="noreferrer" className="block text-[10px] text-[#8C6D40] hover:underline border border-[#8C6D40]/20 rounded px-1">After</a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-charcoal/80 text-xs">{getProgramName(review.program_id)}</td>
                  <td className="px-4 py-4 max-w-xs truncate text-xs" title={review.testimonial}>
                    <div className="flex items-center gap-1 mb-1 text-gold">
                      {[...Array(review.rating || 5)].map((_, i) => <Star key={i} className="h-2 w-2 fill-current" />)}
                    </div>
                    {review.testimonial}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-max text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm ${review.status === 'published' ? 'bg-green-100 text-green-700' : review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.status}
                      </span>
                      {review.featured_on_home && <span className="w-max text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm bg-blue-100 text-blue-700">Home Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => setViewReview(review)} variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-charcoal hover:bg-[#EBE3DB]" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => openEditModal(review)} variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-charcoal hover:bg-[#EBE3DB]" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-4xl shadow-xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowCancelConfirm(true)} 
              className="absolute top-4 right-4 z-30 rounded-none border border-[#EBE3DB] bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-charcoal/80 transition-colors shadow-sm h-8"
            >
              Cancel
            </Button>
            <div className="p-8 overflow-y-auto flex-1">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">{editingId ? 'Edit' : 'Add Manual'} Review</h3>
              <form onSubmit={handleAddReview} className="flex flex-col md:flex-row gap-8">
                
                {/* Left Side: Images */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[#EBE3DB] pr-8">
                  <SingleImageUploader
                    label="Before Image"
                    id="beforeImageUpload"
                    value={form.beforeImage}
                    onUpload={handleBeforeUpload}
                    onRemove={handleBeforeRemove}
                  />
                  <SingleImageUploader
                    label="After Image"
                    id="afterImageUpload"
                    value={form.afterImage}
                    onUpload={handleAfterUpload}
                    onRemove={handleAfterRemove}
                  />
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-2/3 space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Program</label>
                    <select value={form.programId} onChange={e => setForm(prev => ({...prev, programId: e.target.value}))} required className="w-full p-2.5 border border-[#EBE3DB] rounded bg-white">
                      <option value="">-- Choose Program --</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(prev => ({...prev, name: e.target.value}))} required className="w-full p-2.5 border border-[#EBE3DB] rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm(prev => ({...prev, rating: star}))}
                          className={`transition-colors ${star <= form.rating ? 'text-gold' : 'text-gray-300 hover:text-gold/50'}`}
                        >
                          <Star className="h-8 w-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Review Text</label>
                    <textarea value={form.testimonial} onChange={e => setForm(prev => ({...prev, testimonial: e.target.value}))} required rows={6} className="w-full p-2.5 border border-[#EBE3DB] rounded resize-none" />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="review-published" 
                      checked={form.published !== false} 
                      onChange={(e) => setForm(prev => ({...prev, published: e.target.checked}))}
                      className="h-4 w-4 rounded-none border-[#EBE3DB] text-[#8C6D40] focus:ring-[#8C6D40] cursor-pointer"
                    />
                    <label htmlFor="review-published" className="text-sm font-medium text-charcoal cursor-pointer">Publish immediately</label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EBE3DB]">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCancelConfirm(true)}
                      className="rounded-none border border-[#EBE3DB] hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-charcoal/80 text-xs uppercase tracking-wider font-semibold h-11 px-5"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      disabled={submitting}
                      onClick={() => handleSaveWithStatus(form.published !== false)} 
                      className={`rounded-none text-xs uppercase tracking-wider font-semibold h-11 px-6 ${
                        form.published !== false 
                          ? "bg-[#8C6D40] hover:bg-[#B8955F] text-white" 
                          : "bg-charcoal hover:bg-charcoal/80 text-white"
                      }`}
                    >
                      {submitting ? "Saving..." : (form.published !== false ? "Publish Immediately" : "Save Draft")}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-2xl shadow-xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <button 
              onClick={() => setViewReview(null)} 
              className="absolute top-4 right-4 z-30 p-1.5 rounded-full text-charcoal/60 hover:text-charcoal bg-white/80 hover:bg-white backdrop-blur-md transition-all shadow-sm border border-[#EBE3DB]"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">Review Details</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-charcoal/50 mb-1">Program</h4>
                  <p className="font-medium">{getProgramName(viewReview.program_id)}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-charcoal/50 mb-1">User & Rating</h4>
                  <p className="font-medium flex items-center gap-2">
                    {viewReview.name}
                    <span className="flex text-gold">
                      {[...Array(viewReview.rating || 5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-charcoal/50 mb-1">Testimonial</h4>
                  <p className="text-charcoal/90 italic bg-[#FAF8F5] p-4 rounded border border-[#EBE3DB]">"{viewReview.testimonial}"</p>
                </div>
                
                {(viewReview.before_image || viewReview.after_image) && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-charcoal/50 mb-2">Images</h4>
                    <div className="flex gap-4">
                      {viewReview.before_image && (
                        <div className="w-40 aspect-[4/5] rounded overflow-hidden border relative bg-charcoal/5">
                          <img src={viewReview.before_image} alt="Before" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1">Before</div>
                        </div>
                      )}
                      {viewReview.after_image && (
                        <div className="w-40 aspect-[4/5] rounded overflow-hidden border relative bg-charcoal/5">
                          <img src={viewReview.after_image} alt="After" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1">After</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-[#FAF8F5] p-5 rounded-lg border border-[#EBE3DB] space-y-5">
                  <h4 className="font-semibold text-charcoal text-[11px] uppercase tracking-widest">Moderation Actions</h4>
                  <div className="flex items-center gap-3">
                    {viewReview.status !== 'published' && (
                      <Button onClick={() => updateStatus(viewReview.id, { status: 'published' })} className="h-9 px-5 rounded-full bg-charcoal text-white hover:bg-charcoal/90 text-[11px] font-bold tracking-wider uppercase transition-colors">
                        Show / Publish
                      </Button>
                    )}
                    {viewReview.status === 'published' && (
                      <Button onClick={() => updateStatus(viewReview.id, { status: 'rejected' })} variant="outline" className="h-9 px-5 rounded-full border-charcoal/20 text-charcoal hover:bg-charcoal/5 text-[11px] font-bold tracking-wider uppercase transition-colors">
                        Hide Review
                      </Button>
                    )}
                    <Button onClick={() => setDeleteConfirmId(viewReview.id)} variant="ghost" className="h-9 px-4 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold tracking-wider uppercase transition-colors ml-auto">
                      Delete
                    </Button>
                  </div>
                  
                  {viewReview.status === 'published' && (
                    <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-between gap-3">
                      <span className="font-medium text-charcoal text-sm">
                        Feature this review on the Home Page
                      </span>
                      <button
                        type="button"
                        onClick={() => updateStatus(viewReview.id, { featured_on_home: !viewReview.featured_on_home })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          viewReview.featured_on_home ? "bg-[#8C6D40]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            viewReview.featured_on_home ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={executeCancel}
        title="Are you sure you want to cancel?"
        message="Any unsaved changes will be discarded. Are you sure you want to exit?"
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
      />

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />
    </div>
  );
}