"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Video, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CldUploadWidget } from "next-cloudinary";
import { optimizeCloudinaryUrl, deleteCloudinaryFile } from "@/lib/cloudinary-utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface VideoTestimonial {
  id: string;
  video_url: string;
  caption: string;
  name: string;
  program_id: string;
  featured_on_home: boolean;
  created_at: string;
}

const CloudinaryVideoBtn = ({ onUpload, onRemove, value }: { onUpload: (u: string, pId: string) => void, onRemove: () => void, value: string }) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-charcoal/80">Video File</span>
    {value ? (
      <div className="relative w-full aspect-[9/16] max-h-96 rounded-md overflow-hidden border border-[#EBE3DB] bg-black">
        <video src={value} controls className="w-full h-full object-contain" />
        <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors z-10">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <CldUploadWidget 
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_VIDEOS || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "syncwellness"}
        options={{ clientAllowedFormats: ["mp4", "mov", "webm", "avi"], folder: 'syncwellness/videos' }}
        onSuccess={(res: any) => {
          if (res?.info?.secure_url) {
             const optimizedUrl = optimizeCloudinaryUrl(res.info.secure_url);
             onUpload(optimizedUrl, res.info.public_id);
          }
        }}
      >
        {({ open }) => (
          <button type="button" onClick={() => open()} className="w-full aspect-[9/16] max-h-96 border-2 border-dashed border-[#EBE3DB] rounded-md flex flex-col items-center justify-center text-charcoal/50 hover:bg-[#FAF8F5] hover:border-[#8C6D40] transition-colors">
            <Upload className="h-6 w-6 mb-2" />
            <span className="text-xs">Click to upload video</span>
          </button>
        )}
      </CldUploadWidget>
    )}
  </div>
);

export function VideoTestimonialsManager() {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ video_url: "", public_id: "", caption: "", name: "", program_id: "", featured_on_home: true });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.video_url) {
      toast.error("Please upload a video");
      return;
    }
    setSubmitting(true);
    try {
      const isEditing = !!editingId;
      const payload = { ...form };
      delete (payload as any).public_id; // Remove public_id since it's not in the DB schema

      const res = await fetch(isEditing ? `/api/videos/${editingId}` : "/api/videos", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(isEditing ? "Video testimonial updated" : "Video testimonial added");
        closeModal();
        fetchVideos();
      } else {
        const errorData = await res.json();
        toast.error(`Database error: ${errorData.error || "Unknown error"}`);
        // DB upload failed! Clean up the video from Cloudinary ONLY IF NEW
        if (!isEditing && form.public_id) {
          await deleteCloudinaryFile(form.public_id, 'video');
        }
      }
    } catch {
      toast.error("Error saving video");
      if (!editingId && form.public_id) {
        await deleteCloudinaryFile(form.public_id, 'video');
      }
    }
    setSubmitting(false);
  };

  const openEditModal = (video: VideoTestimonial) => {
    setForm({
      video_url: video.video_url || "",
      public_id: "", // We don't have the original public_id saved in DB currently, it's fine
      caption: video.caption || "",
      name: video.name || "",
      program_id: video.program_id || "",
      featured_on_home: video.featured_on_home || false
    });
    setEditingId(video.id);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setForm({ video_url: "", public_id: "", caption: "", name: "", program_id: "", featured_on_home: true });
  };

  const handleRemoveVideo = async () => {
    if (form.public_id) {
      await deleteCloudinaryFile(form.public_id, 'video');
    }
    setForm({...form, video_url: "", public_id: ""});
  };

  const updateStatus = async (id: string, updates: Partial<VideoTestimonial>) => {
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(`Video updated`);
        setVideos(videos.map(v => v.id === id ? { ...v, ...updates } : v));
      }
    } catch (e) {
      toast.error("Error updating");
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
        <Button onClick={() => { setEditingId(null); setIsAddModalOpen(true); }} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white">
          Add Video Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-md">
            No video testimonials found.
          </div>
        ) : (
          videos.map(video => (
            <div key={video.id} className="bg-white border border-[#EBE3DB] rounded-lg overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-[9/16] bg-black relative">
                <video src={`${video.video_url}#t=0.001`} className="w-full h-full object-cover" controls preload="metadata" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-charcoal">{video.name}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-[#8C6D40] mb-2">{getProgramName(video.program_id)}</p>
                  <p className="text-sm font-medium text-charcoal/80 mb-2 line-clamp-2" title={video.caption}>{video.caption || "No caption"}</p>
                  <p className="text-[10px] text-charcoal/50 mb-4">{new Date(video.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#EBE3DB] pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                    <input 
                      type="checkbox" 
                      checked={video.featured_on_home}
                      onChange={e => updateStatus(video.id, { featured_on_home: e.target.checked })}
                      className="rounded text-[#8C6D40] focus:ring-[#8C6D40]"
                    />
                    Feature on Home
                  </label>
                  <div className="flex items-center gap-1 justify-end">
                    <Button onClick={() => openEditModal(video)} variant="ghost" size="sm" className="h-8 w-8 rounded-md p-0 text-charcoal hover:bg-[#EBE3DB]" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </Button>
                    <Button onClick={() => setDeleteConfirmId(video.id)} variant="ghost" size="sm" className="h-8 w-8 rounded-md p-0 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal"><X className="h-5 w-5" /></button>
            <div className="p-8">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">{editingId ? 'Edit' : 'Upload'} Video Testimonial</h3>
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-8">
                <div className="w-full sm:w-1/2 flex flex-col gap-6 pr-0 sm:pr-8 sm:border-r border-[#EBE3DB]">
                  <CloudinaryVideoBtn 
                    value={form.video_url} 
                    onUpload={(u, pId) => setForm({...form, video_url: u, public_id: pId})} 
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
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-charcoal">
                      <input 
                        type="checkbox" 
                        checked={form.featured_on_home}
                        onChange={e => setForm({...form, featured_on_home: e.target.checked})}
                        className="rounded text-[#8C6D40] focus:ring-[#8C6D40]"
                      />
                      Feature on Home Page instantly
                    </label>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={submitting} className="w-full h-12 bg-[#8C6D40] hover:bg-[#B8955F] text-white">
                      {submitting ? "Uploading..." : "Save Video"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
