"use client";

import { useState, useEffect } from "react";
import { Blog } from "@/types/dashboard";
import { Plus, Edit, Trash, ExternalLink, Image as ImageIcon, X } from "lucide-react";
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

const ITEMS_PER_PAGE = 15;

export function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [formData, setFormData] = useState<Partial<Blog>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchBlogs();
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

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setBlogs(data || []);
    } catch (e: any) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = blogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const [stagedCoverFile, setStagedCoverFile] = useState<File | null>(null);

  const handleEdit = (blog: Blog) => {
    setFormData(blog);
    setStagedCoverFile(null);
    setUploadProgress(null);
    setIsEditing(true);
  }

  const handleCreateNew = () => {
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
    setStagedCoverFile(null);
    setUploadProgress(null);
    setIsEditing(true);
  }

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const toggleBlogPublished = async (blog: Blog) => {
    setUpdatingIds(prev => ({ ...prev, [blog.id]: true }));
    try {
      const nextPublished = !blog.published;
      const { error } = await supabase.from('blogs').update({ published: nextPublished }).eq('id', blog.id);
      if (error) throw error;
      toast.success(nextPublished ? "Blog published!" : "Blog saved as draft!");
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: nextPublished } : b));
    } catch (e: any) {
      toast.error("Failed to update blog status");
      throw e;
    } finally {
      setUpdatingIds(prev => ({ ...prev, [blog.id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      toast.success("Blog deleted");
      fetchBlogs();
    } catch (e: any) {
      toast.error("Failed to delete blog");
    }
  }

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
  };

  const handleSaveWithStatus = async (publish: boolean) => {
    setSubmitting(true);
    setUploadProgress(null);
    try {
      let finalImageUrl = formData.image_url || "";

      // Upload staged file atomically on Publish / Save
      if (stagedCoverFile) {
        toast.loading("Uploading cover image...", { id: "uploading-cover" });
        setUploadProgress(0);
        const { url } = await uploadFileToCloudinary(
          stagedCoverFile,
          process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_BLOGS || "syncwellness_blogs",
          (percent) => setUploadProgress(percent)
        );
        finalImageUrl = url;
        toast.dismiss("uploading-cover");
      }

      const submitData = { ...formData, image_url: finalImageUrl, published: publish };
      if (!submitData.slug) {
        submitData.slug = generateSlug(submitData.title || "untitled");
      }

      if (formData.id) {
        // Update
        const { error } = await supabase.from('blogs').update(submitData).eq('id', formData.id);
        if (error) throw error;
        toast.success(publish ? "Blog published!" : "Blog saved as draft!");
      } else {
        // Create
        const { error } = await supabase.from('blogs').insert([submitData]);
        if (error) throw error;
        toast.success(publish ? "Blog published!" : "Blog saved as draft!");
      }
      setIsEditing(false);
      setStagedCoverFile(null);
      setUploadProgress(null);
      fetchBlogs();
    } catch (e: any) {
      toast.dismiss("uploading-cover");
      toast.error(e.message || "Failed to save blog");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  const executeCancel = () => {
    setStagedCoverFile(null);
    setUploadProgress(null);
    setIsEditing(false);
    setShowCancelConfirm(false);
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-display text-charcoal mb-6">Blog Manager</h2>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden border border-[#EBE3DB]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBE3DB] flex items-center justify-between bg-white shrink-0">
              <h3 className="font-display text-xl sm:text-2xl text-charcoal font-semibold">
                {formData.id ? "Edit Blog" : "Create New Blog"}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCancelConfirm(true)}
                className="text-charcoal/50 hover:text-charcoal p-1.5 rounded-full hover:bg-charcoal/10 transition-colors focus:outline-none cursor-pointer"
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

                  {/* Right Side: Category, Excerpt */}
                  <div className="w-full lg:w-7/12 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Input 
                        value={formData.category || ""}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="e.g. Wellness"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-end min-h-0 pt-2">
                      <Label className="mb-1.5 inline-block">Short Excerpt</Label>
                      <Textarea 
                        value={formData.excerpt || ""}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        placeholder="A brief 1-2 sentence summary of the article..."
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
                    placeholder="Enter an engaging blog title..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <TagInput 
                    value={formData.tags || ""}
                    onChange={(tags) => setFormData({...formData, tags})}
                    placeholder="Add tag & press Enter or comma..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Blog Content</Label>
                  <Editor 
                    data={formData.content || ""} 
                    onChange={(val) => setFormData({...formData, content: val})} 
                  />
                </div>
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
        onConfirm={executeCancel}
        title="Are you sure you want to cancel?"
        message="Any unsaved changes will be discarded. Are you sure you want to exit?"
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-charcoal">Blog Manager</h2>
        <Button onClick={handleCreateNew} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[11px] uppercase tracking-widest px-6 h-10 rounded-none">
          <Plus className="h-4 w-4 mr-2" /> New Blog
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-lg bg-white">
            No blogs found. Click &quot;New Blog&quot; to create one.
          </div>
        ) : (
          paginatedBlogs.map((blog) => (
            <div key={blog.id} className="bg-white border border-[#EBE3DB] rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              <div className="relative w-full overflow-hidden bg-[#FAF8F5] border-b border-[#EBE3DB]" style={{ aspectRatio: "16 / 9" }}>
                {blog.image_url ? (
                  <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-charcoal/30">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">No Cover Image</span>
                  </div>
                )}
              </div>
              
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#8C6D40] font-bold uppercase tracking-wider mb-1.5">{blog.category || 'General'}</div>
                  <h3 className="font-display text-base text-charcoal font-bold leading-snug line-clamp-2">{blog.title}</h3>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border-t border-[#EBE3DB] flex items-center justify-between px-4 py-2.5">
                <Toggle
                  size="sm"
                  checked={!!blog.published}
                  loading={!!updatingIds[blog.id]}
                  onChange={() => toggleBlogPublished(blog)}
                  label={<span className="text-[10px] uppercase font-bold tracking-wider text-charcoal">{blog.published ? 'Published' : 'Draft'}</span>}
                />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEdit(blog)} 
                    className="p-1.5 text-charcoal/60 hover:text-[#8C6D40] hover:bg-[#8C6D40]/10 rounded transition-colors cursor-pointer"
                    title="Edit Blog"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(blog.id)} 
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Delete Blog"
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
            className="px-3 py-1.5 rounded-none border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors cursor-pointer"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-none text-xs font-semibold transition-colors cursor-pointer ${
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
            className="px-3 py-1.5 rounded-none border border-[#EBE3DB] bg-white text-xs font-semibold uppercase tracking-wider text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8C6D40] hover:text-white transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
