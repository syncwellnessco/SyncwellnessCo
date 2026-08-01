"use client";

import { useState, useEffect } from "react";
import { Blog } from "@/types/dashboard";
import { Plus, Edit, Trash, Image as ImageIcon, Video, Newspaper, BookOpen, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase-client";
import { uploadFileToCloudinary } from "@/lib/cloudinary-utils";
import { MediaUploader } from "@/components/ui/media-uploader";
import dynamic from 'next/dynamic';
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { TagInput } from "@/components/ui/tag-input";
import { Toggle } from "@/components/ui/toggle";

const Editor = dynamic(() => import('@/components/admin/editor'), { ssr: false });

async function fetchPodcastMetadata(url: string) {
  if (!url) return null;
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return {
        title: data?.title || "",
        thumbnailUrl: data?.thumbnail_url || "",
        excerpt: `Watch this episode on YouTube.`
      };
    } catch (e) {
      console.error(e);
    }
  }
  
  if (url.includes('spotify.com')) {
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return {
        title: data?.title || "",
        thumbnailUrl: data?.thumbnail_url || "",
        excerpt: `Listen to this episode on Spotify.`
      };
    } catch (e) {
      console.error(e);
    }
  }

  if (url.includes('podcasts.apple.com')) {
    try {
      const matchId = url.match(/\/id(\d+)/);
      const episodeMatch = url.match(/[?&]i=(\d+)/);
      const lookupId = episodeMatch ? episodeMatch[1] : (matchId ? matchId[1] : null);
      
      if (lookupId) {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${lookupId}`);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          return {
            title: result.trackName || result.collectionName || "",
            thumbnailUrl: result.artworkUrl600 || result.artworkUrl100 || "",
            excerpt: `Listen to this episode on Apple Podcasts.`
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  return null;
}

type SubTab = "blogs" | "podcasts" | "media";

const ITEMS_PER_PAGE = 15;

export function ResourcesManager() {
  const [resources, setResources] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<SubTab>("blogs");
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Blog>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEditing]);

  const closeModal = () => {
    setStagedCoverFile(null);
    setUploadProgress(null);
    setIsEditing(false);
    setFormData({});
    setShowCancelConfirm(false);
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setResources(data || []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  // Filter based on selected subtab
  const blogs = resources.filter(r => r.category !== "Podcast" && r.category !== "News Article");
  const podcasts = resources.filter(r => r.category === "Podcast");
  const media = resources.filter(r => r.category === "News Article");

  const currentList = subTab === "blogs" ? blogs : subTab === "podcasts" ? podcasts : media;
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const paginatedList = currentList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const [stagedCoverFile, setStagedCoverFile] = useState<File | null>(null);

  const handleEdit = (resource: Blog) => {
    setFormData(resource);
    setStagedCoverFile(null);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setStagedCoverFile(null);
    if (subTab === "blogs") {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image_url: "",
        author: "Admin",
        category: "",
        published: true
      });
    } else if (subTab === "podcasts") {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "", // YouTube URL
        image_url: "",
        author: "Admin",
        category: "Podcast",
        published: true
      });
    } else if (subTab === "media") {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "", // Article Link
        image_url: "",
        author: "", // Source / Publisher
        category: "News Article",
        published: true
      });
    }
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      toast.success("Resource deleted");
      fetchResources();
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const toggleResourcePublished = async (resource: Blog) => {
    setUpdatingIds(prev => ({ ...prev, [resource.id]: true }));
    try {
      const nextPublished = !resource.published;
      const { error } = await supabase.from('blogs').update({ published: nextPublished }).eq('id', resource.id);
      if (error) throw error;
      toast.success(nextPublished ? "Resource published!" : "Resource saved as draft!");
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, published: nextPublished } : r));
    } catch (e: any) {
      toast.error("Failed to update status");
      throw e;
    } finally {
      setUpdatingIds(prev => ({ ...prev, [resource.id]: false }));
    }
  };

  const generateSlug = (title: string, prefix: string) => {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
    return `${prefix}-${cleanTitle}`;
  };

  const handleSaveWithStatus = async (publish: boolean) => {
    setSubmitting(true);
    setUploadProgress(null);
    try {
      let finalImageUrl = formData.image_url || "";

      // Upload staged file atomically on Publish / Save
      if (stagedCoverFile) {
        toast.loading("Uploading media...", { id: "uploading-resource-media" });
        setUploadProgress(0);
        const { url } = await uploadFileToCloudinary(
          stagedCoverFile,
          process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_BLOGS || "syncwellness_blogs",
          (percent) => setUploadProgress(percent)
        );
        finalImageUrl = url;
        toast.dismiss("uploading-resource-media");
      }

      const submitData = { ...formData, image_url: finalImageUrl, published: publish };
      
      // Auto-populate attributes for Podcasts and Media
      if (subTab === "podcasts") {
        submitData.category = "Podcast";
        submitData.author = "Admin";
        if (!submitData.slug) {
          submitData.slug = generateSlug(submitData.title || "podcast", "podcast");
        }
      } else if (subTab === "media") {
        submitData.category = "News Article";
        if (!submitData.slug) {
          submitData.slug = generateSlug(submitData.title || "media", "media");
        }
      } else {
        if (!submitData.slug) {
          submitData.slug = generateSlug(submitData.title || "blog", "blog");
        }
      }

      if (formData.id) {
        // Update
        const { error } = await supabase.from('blogs').update(submitData).eq('id', formData.id);
        if (error) throw error;
        toast.success(publish ? "Resource published!" : "Resource saved as draft!");
      } else {
        // Create
        const { error } = await supabase.from('blogs').insert([submitData]);
        if (error) throw error;
        toast.success(publish ? "Resource published!" : "Resource saved as draft!");
      }
      setIsEditing(false);
      setStagedCoverFile(null);
      setUploadProgress(null);
      fetchResources();
    } catch (e: any) {
      toast.dismiss("uploading-resource-media");
      toast.error(e.message || "Failed to save resource");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-display text-charcoal mb-6">Resources Manager</h2>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display text-charcoal">Resources Manager</h2>
          <p className="text-sm text-charcoal/60 mt-0.5">Manage blogs, podcasts, and media appearances from one place.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[11px] uppercase tracking-widest px-6 h-10 rounded-none">
          <Plus className="h-4 w-4 mr-2" /> Add {subTab === "blogs" ? "Blog" : subTab === "podcasts" ? "Podcast" : "Media Article"}
        </Button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-[#EBE3DB] mb-6">
        <button 
          onClick={() => { setSubTab("blogs"); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${
            subTab === "blogs" 
              ? "border-[#8C6D40] text-[#8C6D40]" 
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Blogs ({blogs.length})
        </button>
        <button 
          onClick={() => { setSubTab("podcasts"); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${
            subTab === "podcasts" 
              ? "border-[#8C6D40] text-[#8C6D40]" 
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <Video className="h-4 w-4" />
          Podcasts ({podcasts.length})
        </button>
        <button 
          onClick={() => { setSubTab("media"); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${
            subTab === "media" 
              ? "border-[#8C6D40] text-[#8C6D40]" 
              : "border-transparent text-charcoal/60 hover:text-charcoal"
          }`}
        >
          <Newspaper className="h-4 w-4" />
          Media Articles ({media.length})
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-lg bg-white">
            No items found. Click &quot;Add&quot; to create one.
          </div>
        ) : (
          paginatedList.map((resource) => (
            <div key={resource.id} className="bg-white border border-[#EBE3DB] rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              <div className="relative w-full overflow-hidden bg-[#FAF8F5] border-b border-[#EBE3DB]" style={{ aspectRatio: "16 / 9" }}>
                {resource.image_url ? (
                  <img src={resource.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-charcoal/30">
                    {subTab === "podcasts" ? <Video className="h-8 w-8 mb-2" /> : subTab === "media" ? <Newspaper className="h-8 w-8 mb-2" /> : <ImageIcon className="h-8 w-8 mb-2" />}
                    <span className="text-[10px] uppercase tracking-wider font-bold">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#8C6D40] font-bold uppercase tracking-wider mb-1.5">
                    {subTab === "blogs" ? (resource.category || 'General') : subTab === "podcasts" ? 'Podcast' : (resource.author || 'Press')}
                  </div>
                  <h3 className="font-display text-base text-charcoal font-bold leading-snug line-clamp-2">{resource.title}</h3>
                  
                  {subTab !== "blogs" && (
                    <div className="text-[10px] text-charcoal/40 font-mono mb-3 truncate flex items-center gap-1 bg-charcoal/5 px-2 py-1 rounded-sm w-fit">
                      <ExternalLink className="h-2.5 w-2.5" />
                      {resource.content ? new URL(resource.content).hostname : "no-link"}
                    </div>
                  )}
                  {subTab !== "blogs" && (
                    <p className="text-xs text-charcoal/70 line-clamp-3 mt-auto">{resource.excerpt || 'No description provided.'}</p>
                  )}
                </div>
              </div>

              <div className="bg-[#FAF8F5] border-t border-[#EBE3DB] flex items-center justify-between px-4 py-2.5">
                <Toggle
                  size="sm"
                  checked={!!resource.published}
                  loading={!!updatingIds[resource.id]}
                  onChange={() => toggleResourcePublished(resource)}
                  label={<span className="text-[10px] uppercase font-bold tracking-wider text-charcoal">{resource.published ? 'Published' : 'Draft'}</span>}
                />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEdit(resource)} 
                    className="p-1.5 text-charcoal/60 hover:text-[#8C6D40] hover:bg-[#8C6D40]/10 rounded transition-colors cursor-pointer"
                    title="Edit Resource"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(resource.id)} 
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-none border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-none text-xs font-semibold transition-colors ${
                page === currentPage
                  ? "bg-[#8C6D40] text-white shadow-sm"
                  : "bg-white border border-[#EBE3DB] text-charcoal hover:bg-[#8C6D40]/10 hover:text-[#8C6D40]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-none border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden border border-[#EBE3DB]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBE3DB] flex items-center justify-between bg-white shrink-0">
              <h3 className="font-display text-xl sm:text-2xl text-charcoal font-semibold">
                {formData.id ? "Edit Resource" : "Create New Resource"}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCancelConfirm(true)}
                className="text-charcoal/50 hover:text-charcoal p-1.5 rounded-full hover:bg-charcoal/10 transition-colors focus:outline-none"
                aria-label="Close modal"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveWithStatus(formData.published !== false); }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5">
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Left Side: Cover Image */}
                  <div className="w-full lg:w-5/12 flex flex-col justify-start">
                    <MediaUploader
                      label="Cover Image"
                      helperText="Aspect ratio: 16:9 landscape"
                      value={stagedCoverFile || formData.image_url}
                      accept="image/*"
                      aspectRatioClass="w-full aspect-[16/9]"
                      className="w-full"
                      progress={uploadProgress}
                      onSelectFile={(file) => setStagedCoverFile(file)}
                      onRemove={() => {
                        setStagedCoverFile(null);
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                    />
                  </div>

                  {/* Right Side: Category / Author, External Link / Excerpt */}
                  <div className="w-full lg:w-7/12 flex flex-col justify-between space-y-3.5">
                    <div>
                      {subTab === "blogs" && (
                        <div className="space-y-1.5">
                          <Label>Category</Label>
                          <Input 
                            value={formData.category || ""}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            placeholder="e.g. Wellness"
                          />
                        </div>
                      )}

                      {subTab === "media" && (
                        <div className="space-y-1.5">
                          <Label>Publication / Press Outlet Name</Label>
                          <Input 
                            value={formData.author || ""}
                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                            placeholder="e.g. Vogue, Forbes, Daily Mail"
                          />
                        </div>
                      )}

                      {subTab !== "blogs" && (
                        <div className="space-y-1.5">
                          <Label>{subTab === "podcasts" ? "Podcast Episode URL (Spotify, Apple, YouTube)" : "Article Link URL"}</Label>
                          <Input 
                            type="url"
                            value={formData.content || ""}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                            placeholder="https://..."
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-end min-h-0 pt-1">
                      <Label className="mb-1.5 inline-block">{subTab === "blogs" ? "Short Excerpt" : "Summary / Description"}</Label>
                      <Textarea 
                        value={formData.excerpt || ""}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        placeholder="Brief summary..."
                        className="flex-1 h-full min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Title (Full Width) */}
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input 
                    value={formData.title || ""}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="text-base font-medium h-11"
                    placeholder="Enter title..."
                  />
                </div>

                {subTab === "blogs" && (
                  <div className="space-y-1.5">
                    <Label>Tags</Label>
                    <TagInput 
                      value={formData.tags || ""}
                      onChange={(tags) => setFormData({...formData, tags})}
                      placeholder="Add tag & press Enter or comma..."
                    />
                  </div>
                )}

                {subTab === "blogs" && (
                  <div className="space-y-1.5">
                    <Label>Blog Content</Label>
                    <Editor 
                      data={formData.content || ""} 
                      onChange={(val) => setFormData({...formData, content: val})} 
                    />
                  </div>
                )}
              </div>

              {/* Fixed Footer at the Bottom */}
              <div className="px-6 py-4 border-t border-[#EBE3DB] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Toggle 
                    id="published"
                    size="md"
                    checked={formData.published !== false} 
                    onChange={(checked) => setFormData({...formData, published: checked})}
                    label="Publish immediately"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCancelConfirm(true)}
                    className="rounded-none border border-[#EBE3DB] hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-charcoal/80 text-xs uppercase tracking-wider font-semibold h-10 px-5 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    disabled={submitting}
                    onClick={() => handleSaveWithStatus(formData.published !== false)} 
                    className={`rounded-none text-xs uppercase tracking-wider font-semibold h-10 px-6 transition-colors ${
                      formData.published !== false 
                        ? "bg-[#8C6D40] hover:bg-[#B8955F] text-white" 
                        : "bg-charcoal hover:bg-charcoal/80 text-white"
                    }`}
                  >
                    {submitting ? "Saving..." : (formData.published !== false ? "Publish" : "Save Draft")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={closeModal}
        title="Are you sure you want to cancel?"
        message="Any unsaved changes will be discarded. Are you sure you want to exit?"
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
      />
    </div>
  );
}
