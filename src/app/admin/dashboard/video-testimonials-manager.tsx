"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Video, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadFileToCloudinary } from "@/lib/cloudinary-utils";
import { MediaUploader } from "@/components/ui/media-uploader";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toggle } from "@/components/ui/toggle";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
  featured_on_home: boolean;
  created_at: string;
}

const CloudinaryVideoBtn = memo(({ onSelectFile, onRemove, value, progress }: { onSelectFile: (f: File) => void, onRemove: () => void, value: string | File | null, progress?: number | null }) => {
  return (
    <MediaUploader
      label="Video File"
      helperText="Aspect ratio: 9:16 vertical"
      value={value}
      accept="video/*"
      aspectRatioClass="aspect-[9/16] max-h-96"
      progress={progress}
      onSelectFile={onSelectFile}
      onRemove={onRemove}
    />
  );
});
CloudinaryVideoBtn.displayName = "CloudinaryVideoBtn";

const getVideoThumbnailUrl = (url: string) => {
  if (!url) return "";
  if (url.includes('/video/upload/')) {
    const baseUrl = url.split('?')[0];
    const lastDot = baseUrl.lastIndexOf('.');
    if (lastDot !== -1) {
      const jpgUrl = baseUrl.substring(0, lastDot) + '.jpg';
      return jpgUrl.replace('/video/upload/', '/video/upload/c_fill,w_300,h_533,so_1,q_auto,f_auto/');
    }
  }
  return "";
};

const VideoCardThumbnail = ({ url, name, onPlay }: { url: string, name: string, onPlay: () => void }) => {
  const [hasError, setHasError] = useState(false);
  const thumbnail = getVideoThumbnailUrl(url);

  return (
    <div 
      onClick={onPlay} 
      className="absolute inset-0 cursor-pointer flex items-center justify-center"
    >
      {thumbnail && !hasError ? (
        <img 
          src={thumbnail} 
          alt={name} 
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-charcoal/90 text-white/40">
          <Video className="h-6 w-6 mb-1 text-white/50" />
          <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold truncate max-w-[90%] px-1">{name}</span>
        </div>
      )}
      {/* Dark overlay with play button */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 fill-white text-white"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
  );
};

export function VideoTestimonialsManager() {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ video_url: "", public_id: "", caption: "", name: "", program_id: "", featured_on_home: true });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const fetchVideos = () => {
    fetch("/api/videos").then(res => res.json()).then(data => {
      setVideos(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/videos").then(res => res.json()),
      fetch("/api/programs").then(res => res.json())
    ]).then(([vidData, progData]) => {
      setVideos(Array.isArray(vidData) ? vidData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
      setLoading(false);
    });
  }, []);

  const getProgramName = (id: string) => {
    const p = programs.find(x => x.id === id);
    return p ? p.title : "Program";
  };

  const [stagedVideoFile, setStagedVideoFile] = useState<File | null>(null);

  const handleVideoSelect = useCallback((file: File) => {
    setStagedVideoFile(file);
  }, []);

  const handleRemoveVideo = useCallback(() => {
    setStagedVideoFile(null);
    setForm(prev => ({ ...prev, video_url: "", public_id: "" }));
  }, []);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const executeCancel = () => {
    setStagedVideoFile(null);
    setUploadProgress(null);
    setIsAddModalOpen(false);
    setEditingId(null);
    setForm({ video_url: "", public_id: "", caption: "", name: "", program_id: "", featured_on_home: true });
    setShowCancelConfirm(false);
  };

  const closeModal = () => {
    executeCancel();
  };

  const handleSaveWithStatus = async (featured: boolean) => {
    if (!stagedVideoFile && !form.video_url) {
      toast.error("Please select a video file");
      return;
    }
    setSubmitting(true);
    setUploadProgress(null);
    try {
      let finalVideoUrl = form.video_url;

      if (stagedVideoFile) {
        toast.loading("Uploading testimonial video...", { id: "uploading-testimonial-video" });
        setUploadProgress(0);
        const { url } = await uploadFileToCloudinary(
          stagedVideoFile,
          process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_VIDEOS || "syncwellness",
          (p) => setUploadProgress(p)
        );
        finalVideoUrl = url;
        toast.dismiss("uploading-testimonial-video");
      }

      const isEditing = !!editingId;
      const payload = { ...form, video_url: finalVideoUrl, featured_on_home: featured };
      delete (payload as any).public_id;

      const res = await fetch(isEditing ? `/api/videos/${editingId}` : "/api/videos", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(isEditing ? (featured ? "Video updated & featured on Home!" : "Video saved as draft!") : (featured ? "Video added & featured on Home!" : "Video saved as draft!"));
        setIsAddModalOpen(false);
        setEditingId(null);
        setStagedVideoFile(null);
        setUploadProgress(null);
        setForm({ video_url: "", public_id: "", caption: "", name: "", program_id: "", featured_on_home: true });
        fetchVideos();
      } else {
        const errorData = await res.json();
        toast.error(`Database error: ${errorData.error || "Unknown error"}`);
      }
    } catch (e: any) {
      toast.dismiss("uploading-testimonial-video");
      toast.error(e.message || "Error saving video");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveWithStatus(form.featured_on_home);
  };

  const openEditModal = (video: VideoTestimonial) => {
    setForm({
      video_url: video.video_url || "",
      public_id: "",
      caption: video.caption || "",
      name: video.name || "",
      program_id: video.program_id || "",
      featured_on_home: video.featured_on_home || false
    });
    setEditingId(video.id);
    setIsAddModalOpen(true);
  };

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const updateStatus = async (id: string, updates: Partial<VideoTestimonial>) => {
    setUpdatingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(`Video updated`);
        setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
      } else {
        toast.error("Failed to update video");
        throw new Error("Failed to update video");
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
      const res = await fetch(`/api/videos/${deleteConfirmId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Video deleted");
        setVideos(videos.filter(v => v.id !== deleteConfirmId));
      }
    } catch (e) {
      toast.error("Error deleting video");
    }
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display text-charcoal">Video Testimonials</h2>
          <p className="text-sm text-charcoal/60 mt-1">Upload and manage video testimonials for the home page.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setIsAddModalOpen(true); }} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white rounded-none">
          Add Video Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {videos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-md">
            No video testimonials found.
          </div>
        ) : (
          videos.map(video => {
            return (
              <div key={video.id} className="bg-white border border-[#EBE3DB] rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-[9/16] bg-black relative overflow-hidden group">
                  {playingVideoId === video.id ? (
                    <video 
                      src={video.video_url} 
                      className="w-full h-full object-cover" 
                      controls 
                      autoPlay 
                      preload="auto" 
                    />
                  ) : (
                    <VideoCardThumbnail 
                      url={video.video_url} 
                      name={video.name} 
                      onPlay={() => setPlayingVideoId(video.id)} 
                    />
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-charcoal text-sm truncate" title={video.name}>{video.name}</h4>
                    <p className="text-[9px] uppercase tracking-wider text-[#8C6D40] mb-1 truncate" title={getProgramName(video.program_id)}>{getProgramName(video.program_id)}</p>
                    <p className="text-xs font-medium text-charcoal/80 mb-1 line-clamp-2" title={video.caption}>{video.caption || "No caption"}</p>
                    <p className="text-[9px] text-charcoal/50 mb-2">{new Date(video.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-[#EBE3DB] pt-2">
                    <div className="flex items-center justify-between gap-1.5 text-[10px] font-semibold text-charcoal">
                      <span>Feature on Home</span>
                      <Toggle
                        size="sm"
                        checked={!!video.featured_on_home}
                        loading={!!updatingIds[video.id]}
                        onChange={() => updateStatus(video.id, { featured_on_home: !video.featured_on_home })}
                      />
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Button onClick={() => openEditModal(video)} variant="ghost" size="sm" className="h-7 w-7 rounded-md p-0 text-charcoal hover:bg-[#EBE3DB]" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </Button>
                      <Button onClick={() => setDeleteConfirmId(video.id)} variant="ghost" size="sm" className="h-7 w-7 rounded-md p-0 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-2xl shadow-xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <button 
              type="button" 
              onClick={() => setShowCancelConfirm(true)} 
              className="absolute top-4 right-4 z-30 p-1.5 rounded-full text-charcoal/60 hover:text-charcoal bg-white/80 hover:bg-white backdrop-blur-md transition-all shadow-sm border border-[#EBE3DB]"
              aria-label="Close modal"
              title="Close"
            >
              <X className="h-5 w-5 text-charcoal/60" />
            </button>
            <div className="p-8 overflow-y-auto flex-1">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">{editingId ? 'Edit' : 'Upload'} Video Testimonial</h3>
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-8">
                <div className="w-full sm:w-1/2 flex flex-col gap-6 pr-0 sm:pr-8 sm:border-r border-[#EBE3DB]">
                  <CloudinaryVideoBtn 
                    value={stagedVideoFile || form.video_url} 
                    progress={uploadProgress}
                    onSelectFile={handleVideoSelect} 
                    onRemove={handleRemoveVideo}
                  />
                </div>
                <div className="w-full sm:w-1/2 space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Program</label>
                    <select value={form.program_id} onChange={e => setForm({...form, program_id: e.target.value})} required className="w-full p-2.5 border border-[#EBE3DB] rounded bg-white">
                      <option value="">-- Choose Program --</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full p-2.5 border border-[#EBE3DB] rounded" placeholder="e.g., Sarah" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Caption</label>
                    <textarea value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} className="w-full p-2.5 border border-[#EBE3DB] rounded resize-none" rows={4} placeholder="e.g., Sarah's 3-month progress..." />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Toggle 
                      id="video-published"
                      size="md"
                      checked={form.featured_on_home !== false} 
                      onChange={(checked) => setForm({...form, featured_on_home: checked})}
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
                      disabled={submitting}
                      onClick={() => handleSaveWithStatus(form.featured_on_home !== false)} 
                      className={`rounded-none text-xs uppercase tracking-wider font-semibold h-11 px-6 ${
                        form.featured_on_home !== false 
                          ? "bg-[#8C6D40] hover:bg-[#B8955F] text-white" 
                          : "bg-charcoal hover:bg-charcoal/80 text-white"
                      }`}
                    >
                      {submitting ? "Saving..." : (form.featured_on_home !== false ? "Publish Immediately" : "Save Draft")}
                    </Button>
                  </div>
                </div>
              </form>
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
        title="Delete Video"
        message="Are you sure you want to delete this video testimonial? This action cannot be undone."
      />
    </div>
  );
}
