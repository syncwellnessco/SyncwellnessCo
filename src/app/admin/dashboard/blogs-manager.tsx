"use client";

import { useState, useEffect } from "react";
import { Blog } from "@/types/dashboard";
import { Plus, Edit, Trash, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase-client";
import { CldUploadWidget } from 'next-cloudinary';
import { deleteCloudinaryFile } from "@/lib/cloudinary-utils";
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/admin/editor'), { ssr: false });

export function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Blog>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchBlogs();
  }, []);

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
      category: "Wellness",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!submitData.slug) {
        submitData.slug = generateSlug(submitData.title || "untitled");
      }

      if (formData.id) {
        // Update
        const { error } = await supabase.from('blogs').update(submitData).eq('id', formData.id);
        if (error) throw error;
        toast.success("Blog updated!");
      } else {
        // Create
        const { error } = await supabase.from('blogs').insert([submitData]);
        if (error) throw error;
        toast.success("Blog published!");
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
    }
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

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-md border border-[#EBE3DB] shadow-sm">
        <h2 className="text-2xl font-display text-charcoal mb-6">{formData.id ? "Edit Blog" : "Create New Blog"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  setFormData(prev => ({ ...prev, image_url: result.info.secure_url }));
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
                          <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); open(); }} variant="secondary">
                            Change
                          </Button>
                          <Button 
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
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
                  className="text-lg font-medium h-12"
                  placeholder="Enter an engaging blog title..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={formData.category || ""}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Wellness"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (Comma separated)</Label>
                  <Input 
                    value={formData.tags || ""}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
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
                  placeholder="A brief 1-2 sentence summary of the article..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Blog Content (Tiptap)</Label>
            <Editor 
              data={formData.content || ""} 
              onChange={(val) => setFormData({...formData, content: val})} 
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="published" 
              checked={formData.published !== false} 
              onChange={(e) => setFormData({...formData, published: e.target.checked})}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-[#EBE3DB]">
            <Button type="button" variant="outline" onClick={async () => {
              if (uploadedImageId) {
                await deleteCloudinaryFile(uploadedImageId, 'image');
                setUploadedImageId(null);
              }
              setIsEditing(false);
            }}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#8C6D40] hover:bg-[#B8955F] text-white">
              {formData.id ? "Update Blog" : "Publish Blog"}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-charcoal">Blog Manager</h2>
        <Button onClick={handleCreateNew} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[11px] uppercase tracking-widest px-6 h-10">
          <Plus className="h-4 w-4 mr-2" /> New Blog
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-lg bg-white">
            No blogs found. Click "New Blog" to create one.
          </div>
        ) : (
          blogs.map((blog) => (
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
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[10px] text-[#8C6D40] font-bold uppercase tracking-wider mb-2">{blog.category || 'General'}</div>
                <h3 className="font-display text-lg text-charcoal font-bold leading-tight mb-2 line-clamp-2">{blog.title}</h3>
                <div className="text-[10px] text-charcoal/40 font-mono mb-3 truncate bg-charcoal/5 px-2 py-1 rounded-sm w-fit">/{blog.slug}</div>
                <p className="text-xs text-charcoal/70 line-clamp-3 mt-auto">{blog.excerpt || 'No excerpt provided for this blog.'}</p>
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
    </div>
  );
}
