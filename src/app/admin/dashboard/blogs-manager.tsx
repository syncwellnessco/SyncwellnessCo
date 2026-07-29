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
import { CldUploadWidget } from 'next-cloudinary';
import { deleteCloudinaryFile, optimizeCloudinaryUrl } from "@/lib/cloudinary-utils";
import dynamic from 'next/dynamic';
import { ConfirmModal } from "@/components/ui/confirm-modal";

const Editor = dynamic(() => import('@/components/admin/editor'), { ssr: false });

const ITEMS_PER_PAGE = 15;

export function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const handleEdit = (blog: Blog) => {
    setFormData(blog);
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
    setIsEditing(true);
  }

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
    try {
      const submitData = { ...formData, published: publish };
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
      setUploadedImageId(null);
      setIsEditing(false);
      fetchBlogs();
    } catch (e: any) {
      toast.error(e.message || "Failed to save blog");
      if (uploadedImageId) {
        await deleteCloudinaryFile(uploadedImageId, 'image');
        setUploadedImageId(null);
        setFormData(prev => ({ ...prev, image_url: '' }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const executeCancel = async () => {
    if (uploadedImageId) {
      await deleteCloudinaryFile(uploadedImageId, 'image');
      setUploadedImageId(null);
    }
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
                className="text-charcoal/50 hover:text-charcoal p-1.5 rounded-full hover:bg-charcoal/10 transition-colors focus:outline-none"
                aria-label="Close modal"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveWithStatus(formData.published !== false); }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side: Cover Image */}
                  <div className="w-full lg:w-1/3 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <Label className="text-sm font-medium">Cover Image</Label>
                      <span className="text-[10px] text-charcoal/50 font-medium">Aspect ratio: 3:2 landscape</span>
                    </div>
                    <CldUploadWidget 
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_BLOGS || "syncwellness_blogs"}
                      onSuccess={(result: any) => {
                        const optimizedUrl = optimizeCloudinaryUrl(result.info.secure_url);
                        setFormData(prev => ({ ...prev, image_url: optimizedUrl }));
                        setUploadedImageId(result.info.public_id);
                        document.body.style.overflow = '';
                      }}
                    >
                      {({ open }) => (
                        <div className="w-full aspect-[3/2] sm:h-[220px] lg:h-full lg:min-h-[260px]">
                          {formData.image_url ? (
                            <div className="relative w-full h-full rounded-md overflow-hidden border border-[#EBE3DB] group">
                              <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); open(); }} variant="secondary" className="rounded-none">
                                  Change
                                </Button>
                                <Button 
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 rounded-none"
                                  onClick={async (e) => { 
                                    e.preventDefault(); 
                                    if (uploadedImageId) {
                                      await deleteCloudinaryFile(uploadedImageId, 'image');
                                      setUploadedImageId(null);
                                    }
                                    setFormData(prev => ({ ...prev, image_url: '' })); 
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              onClick={(e) => { e.preventDefault(); open(); }} 
                              className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#EBE3DB] rounded-md bg-[#FAF8F5] hover:bg-[#EBE3DB]/40 hover:border-[#8C6D40] transition-colors text-charcoal/50 hover:text-charcoal"
                            >
                              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                              <span className="font-medium text-sm">Upload Cover Image</span>
                              <span className="text-[10px] text-charcoal/40 mt-1">3:2 landscape recommended</span>
                            </button>
                          )}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>

                  {/* Right Side: Title, Category, Tags */}
                  <div className="w-full lg:w-2/3 space-y-5">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={formData.title || ""}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        className="text-lg font-medium h-12 rounded-none"
                        placeholder="Enter an engaging blog title..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input 
                          value={formData.category || ""}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="rounded-none"
                          placeholder="e.g. Wellness"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tags (Comma separated)</Label>
                        <Input 
                          value={formData.tags || ""}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                          className="rounded-none"
                          placeholder="e.g. fitness, hormones, diet"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Short Excerpt</Label>
                      <Textarea 
                        rows={3}
                        value={formData.excerpt || ""}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        className="rounded-none"
                        placeholder="A brief 1-2 sentence summary of the article..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
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
                  <input 
                    type="checkbox" 
                    id="published" 
                    checked={formData.published !== false} 
                    onChange={(e) => setFormData({...formData, published: e.target.checked})}
                    className="h-4 w-4 rounded-none border-[#EBE3DB] text-[#8C6D40] focus:ring-[#8C6D40] cursor-pointer"
                  />
                  <Label htmlFor="published" className="text-sm font-medium text-charcoal cursor-pointer select-none">Publish immediately</Label>
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
              <div className="relative h-40 w-full bg-[#FAF8F5] border-b border-[#EBE3DB]">
                {blog.image_url ? (
                  <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-charcoal/30">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">No Cover Image</span>
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-[9px] px-2.5 py-1 uppercase tracking-wider font-bold rounded-sm shadow-sm backdrop-blur-md ${blog.published ? 'bg-green-100/90 text-green-700' : 'bg-yellow-100/90 text-yellow-700'}`}>
                  {blog.published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#8C6D40] font-bold uppercase tracking-wider mb-2">{blog.category || 'General'}</div>
                  <h3 className="font-display text-lg text-charcoal font-bold leading-tight line-clamp-2">{blog.title}</h3>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border-t border-[#EBE3DB] flex items-stretch h-10">
                <button 
                  onClick={() => handleEdit(blog)} 
                  className="flex items-center justify-center text-charcoal/60 hover:text-[#8C6D40] flex-1 hover:bg-[#8C6D40]/5 transition-colors"
                  title="Edit Blog"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <div className="w-px bg-[#EBE3DB]"></div>
                <button 
                  onClick={() => handleDelete(blog.id)} 
                  className="flex items-center justify-center text-red-400 hover:text-red-600 flex-1 hover:bg-red-50 transition-colors"
                  title="Delete Blog"
                >
                  <Trash className="h-4 w-4" />
                </button>
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
    </div>
  );
}
