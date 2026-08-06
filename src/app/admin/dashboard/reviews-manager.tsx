"use client";

import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Eye, Star, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/ui/skeleton";
import { uploadFileToCloudinary } from "@/lib/cloudinary-utils";
import { MediaUploader } from "@/components/ui/media-uploader";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toggle } from "@/components/ui/toggle";

interface Review {
  id: string;
  program_id: string;
  program_ids?: string[];
  name: string;
  testimonial: string;
  before_image: string | null;
  after_image: string | null;
  rating: number;
  status: string;
  featured_on_home: boolean;
  created_at: string;
}

const SingleImageUploader = memo(({ label, value, progress, onSelectFile, onRemove }: { label: string, value: string | File | null, progress?: number | null, onSelectFile: (file: File) => void, onRemove: () => void }) => {
  return (
    <MediaUploader
      label={label}
      labelPosition="bottom"
      value={value}
      accept="image/*"
      aspectRatioClass="aspect-[4/5]"
      progress={progress}
      onSelectFile={onSelectFile}
      onRemove={onRemove}
    />
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
  const [form, setForm] = useState<{
    name: string;
    testimonial: string;
    programIds: string[];
    beforeImage: string;
    afterImage: string;
    rating: number;
    published: boolean;
  }>({ name: "", testimonial: "", programIds: [], beforeImage: "", afterImage: "", rating: 5, published: true });
  const [submitting, setSubmitting] = useState(false);
  const [beforeProgress, setBeforeProgress] = useState<number | null>(null);
  const [afterProgress, setAfterProgress] = useState<number | null>(null);

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

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const handleBeforeSelect = useCallback((file: File) => {
    setBeforeFile(file);
  }, []);

  const handleBeforeRemove = useCallback(() => {
    setBeforeFile(null);
    setBeforeProgress(null);
    setForm(prev => ({ ...prev, beforeImage: "" }));
  }, []);

  const handleAfterSelect = useCallback((file: File) => {
    setAfterFile(file);
  }, []);

  const handleAfterRemove = useCallback(() => {
    setAfterFile(null);
    setAfterProgress(null);
    setForm(prev => ({ ...prev, afterImage: "" }));
  }, []);

  const getProgramNames = (review: Review) => {
    const ids = Array.isArray(review.program_ids) && review.program_ids.length > 0
      ? review.program_ids
      : (typeof review.program_id === 'string' ? review.program_id.split(',').map(s => s.trim()).filter(Boolean) : []);
    if (ids.length === 0) return ["General / All Programs"];
    return ids.map(id => {
      const p = programs.find(x => x.id === id);
      return p ? p.title : id;
    });
  };

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const updateStatus = async (id: string, updates: Partial<Review>) => {
    setUpdatingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(`Review updated`);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        if (viewReview && viewReview.id === id) {
          setViewReview(prev => prev ? { ...prev, ...updates } : null);
        }
      } else {
        toast.error("Failed to update");
        throw new Error("Failed to update");
      }
    } catch (e) {
      toast.error("Error updating");
      throw e;
    } finally {
      setUpdatingIds(prev => ({ ...prev, [id]: false }));
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

  const executeCancel = () => {
    setBeforeFile(null);
    setAfterFile(null);
    setBeforeProgress(null);
    setAfterProgress(null);
    setForm({ name: "", testimonial: "", programIds: [], beforeImage: "", afterImage: "", rating: 5, published: true });
    setIsAddModalOpen(false);
    setEditingId(null);
    setShowCancelConfirm(false);
  };

  const handleSaveWithStatus = async (publish: boolean) => {
    if (!form.name || !form.testimonial || form.programIds.length === 0) {
      toast.error("Please fill all required fields and select at least one program");
      return;
    }
    setSubmitting(true);
    setBeforeProgress(null);
    setAfterProgress(null);
    try {
      let finalBeforeUrl = form.beforeImage;
      let finalAfterUrl = form.afterImage;

      if (beforeFile || afterFile) {
        toast.loading("Uploading transformation photos...", { id: "uploading-reviews" });
        const uploadPromises: Promise<any>[] = [];
        if (beforeFile) {
          setBeforeProgress(0);
          uploadPromises.push(
            uploadFileToCloudinary(
              beforeFile,
              process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_REVIEWS || "syncwellness",
              (p) => setBeforeProgress(p)
            ).then(res => finalBeforeUrl = res.url)
          );
        }
        if (afterFile) {
          setAfterProgress(0);
          uploadPromises.push(
            uploadFileToCloudinary(
              afterFile,
              process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_REVIEWS || "syncwellness",
              (p) => setAfterProgress(p)
            ).then(res => finalAfterUrl = res.url)
          );
        }
        await Promise.all(uploadPromises);
        toast.dismiss("uploading-reviews");
      }

      const isEditing = !!editingId;
      const payload = {
        name: form.name,
        testimonial: form.testimonial,
        program_ids: form.programIds,
        before_image: finalBeforeUrl,
        after_image: finalAfterUrl,
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
        setBeforeFile(null);
        setAfterFile(null);
        setBeforeProgress(null);
        setAfterProgress(null);
        setForm({ name: "", testimonial: "", programIds: [], beforeImage: "", afterImage: "", rating: 5, published: true });
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error || "Unknown"}`);
      }
    } catch (e: any) {
      toast.dismiss("uploading-reviews");
      toast.error(e.message || "Error saving review");
    } finally {
      setSubmitting(false);
      setBeforeProgress(null);
      setAfterProgress(null);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveWithStatus(true);
  };

  const openEditModal = (review: Review) => {
    const existingProgramIds = Array.isArray(review.program_ids) && review.program_ids.length > 0
      ? review.program_ids
      : (typeof review.program_id === 'string' ? review.program_id.split(',').map(s => s.trim()).filter(Boolean) : []);

    setForm({
      name: review.name || "",
      testimonial: review.testimonial || "",
      programIds: existingProgramIds,
      beforeImage: review.before_image || "",
      afterImage: review.after_image || "",
      rating: review.rating || 5,
      published: review.status === 'published'
    });
    setEditingId(review.id);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    executeCancel();
  };

  if (loading) return <TableSkeleton rows={5} columns={5} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display text-charcoal">Reviews</h2>
          <p className="text-sm text-charcoal/60 mt-1">Manage user reviews and publish them to program pages.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: "", testimonial: "", programIds: [], beforeImage: "", afterImage: "", rating: 5, published: true }); setIsAddModalOpen(true); }} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white rounded-none">
          Add Review Manually
        </Button>
      </div>
      
      <div className="overflow-x-auto border border-[#EBE3DB] rounded-md shadow-sm bg-white">
        <table className="w-full text-left text-sm text-charcoal">
          <thead className="bg-[#FAF8F5] text-charcoal/60 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">User & Images</th>
              <th className="px-4 py-3 font-semibold">Programs</th>
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
                  <td className="px-4 py-4 font-medium text-charcoal/80 text-xs">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {getProgramNames(review).map((pName, idx) => (
                        <span key={idx} className="inline-block bg-[#FAF8F5] border border-[#EBE3DB] text-[#8C6D40] px-2 py-0.5 rounded text-[11px] font-medium">
                          {pName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-xs truncate text-xs" title={review.testimonial}>
                    <div className="flex items-center gap-1 mb-1 text-gold">
                      {[...Array(review.rating || 5)].map((_, i) => <Star key={i} className="h-2 w-2 fill-current" />)}
                    </div>
                    {review.testimonial}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`w-max text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold rounded-sm ${review.status === 'published' ? 'bg-green-100 text-green-700' : (review.status === 'archived' || review.status === 'rejected') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.status}
                      </span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Toggle
                          size="sm"
                          checked={!!review.featured_on_home}
                          loading={!!updatingIds[review.id]}
                          onChange={() => updateStatus(review.id, { featured_on_home: !review.featured_on_home })}
                          label={<span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70">Home Featured</span>}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => setViewReview(review)} variant="ghost" size="sm" className="h-8 w-8 rounded-none p-0 text-charcoal hover:bg-[#EBE3DB]" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => openEditModal(review)} variant="ghost" size="sm" className="h-8 w-8 rounded-none p-0 text-charcoal hover:bg-[#EBE3DB]" title="Edit">
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
            <button 
              type="button" 
              onClick={() => setShowCancelConfirm(true)} 
              className="absolute top-4 right-4 z-30 p-1.5 rounded-full text-charcoal/60 hover:text-charcoal bg-white/80 hover:bg-white backdrop-blur-md transition-all shadow-sm border border-[#EBE3DB] cursor-pointer"
              aria-label="Close modal"
              title="Close"
            >
              <X className="h-5 w-5 text-charcoal/60" />
            </button>
            <div className="p-8 overflow-y-auto flex-1">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">{editingId ? 'Edit' : 'Add Manual'} Review</h3>
              <form onSubmit={handleAddReview} className="flex flex-col md:flex-row gap-8">
                
                {/* Left Side: Images */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[#EBE3DB] pr-8">
                  <SingleImageUploader
                    label="Before Image"
                    value={beforeFile || form.beforeImage}
                    progress={beforeProgress}
                    onSelectFile={handleBeforeSelect}
                    onRemove={handleBeforeRemove}
                  />
                  <SingleImageUploader
                    label="After Image"
                    value={afterFile || form.afterImage}
                    progress={afterProgress}
                    onSelectFile={handleAfterSelect}
                    onRemove={handleAfterRemove}
                  />
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-2/3 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-charcoal">
                        Select Programs <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-charcoal/60">{form.programIds.length} program(s) selected</span>
                    </div>
                    <div className="border border-[#EBE3DB] rounded-md p-2.5 max-h-48 overflow-y-auto space-y-1 bg-white">
                      {programs.length === 0 ? (
                        <p className="text-xs text-charcoal/50 italic p-1">No programs available</p>
                      ) : (
                        programs.map(p => {
                          const isSelected = form.programIds.includes(p.id);
                          return (
                            <label 
                              key={p.id} 
                              className={`flex items-center gap-3 px-2.5 py-2 rounded transition-colors cursor-pointer text-xs font-medium select-none ${
                                isSelected 
                                  ? "bg-[#8C6D40]/10 text-charcoal" 
                                  : "text-charcoal/80 hover:bg-[#FAF8F5]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setForm(prev => ({
                                    ...prev,
                                    programIds: checked 
                                      ? [...prev.programIds, p.id] 
                                      : prev.programIds.filter(id => id !== p.id)
                                  }));
                                }}
                                className="h-4 w-4 rounded border-[#EBE3DB] text-[#8C6D40] focus:ring-[#8C6D40] accent-[#8C6D40]"
                              />
                              <span className="flex-1">{p.title}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
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
                          className={`transition-colors cursor-pointer ${star <= form.rating ? 'text-gold' : 'text-gray-300 hover:text-gold/50'}`}
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
                    <Toggle 
                      id="review-published"
                      size="md"
                      checked={form.published !== false} 
                      onChange={(checked) => setForm(prev => ({...prev, published: checked}))}
                      label="Publish immediately"
                    />
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
                      isLoading={submitting}
                      disabled={submitting}
                      onClick={() => handleSaveWithStatus(form.published !== false)} 
                      className={`rounded-none text-xs uppercase tracking-wider font-semibold h-11 px-6 ${
                        form.published !== false 
                          ? "bg-[#8C6D40] hover:bg-[#B8955F] text-white" 
                          : "bg-charcoal hover:bg-charcoal/80 text-white"
                      }`}
                    >
                      {form.published !== false ? "Publish Immediately" : "Save Draft"}
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
              className="absolute top-4 right-4 z-30 p-1.5 rounded-full text-charcoal/60 hover:text-charcoal bg-white/80 hover:bg-white backdrop-blur-md transition-all shadow-sm border border-[#EBE3DB] cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">Review Details</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-charcoal/50 mb-1">Programs</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getProgramNames(viewReview).map((name, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#FAF8F5] border border-[#EBE3DB] text-[#8C6D40] rounded text-xs font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
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
                      <Button onClick={() => updateStatus(viewReview.id, { status: 'published' })} className="h-9 px-5 rounded-none bg-charcoal text-white hover:bg-charcoal/90 text-[11px] font-bold tracking-wider uppercase transition-colors">
                        Show / Publish
                      </Button>
                    )}
                    {viewReview.status === 'published' && (
                      <Button onClick={() => updateStatus(viewReview.id, { status: 'archived' })} variant="outline" className="h-9 px-5 rounded-none border-charcoal/20 text-charcoal hover:bg-charcoal/5 text-[11px] font-bold tracking-wider uppercase transition-colors">
                        Hide Review
                      </Button>
                    )}
                    <Button onClick={() => setDeleteConfirmId(viewReview.id)} variant="ghost" className="h-9 px-4 rounded-none text-red-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold tracking-wider uppercase transition-colors ml-auto">
                      Delete
                    </Button>
                  </div>
                  
                  {viewReview.status === 'published' && (
                    <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-between gap-3">
                      <span className="font-medium text-charcoal text-sm">
                        Feature this review on the Home Page
                      </span>
                      <Toggle
                        size="md"
                        checked={!!viewReview.featured_on_home}
                        loading={!!updatingIds[viewReview.id]}
                        onChange={() => updateStatus(viewReview.id, { featured_on_home: !viewReview.featured_on_home })}
                      />
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