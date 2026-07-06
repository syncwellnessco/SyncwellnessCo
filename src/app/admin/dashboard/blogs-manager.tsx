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
              <Label className="text-sm font-medium">Cover Image</Label>
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
      
      <div className="overflow-x-auto border border-[#EBE3DB] rounded-md shadow-sm">
        <table className="w-full text-left text-sm text-charcoal">
          <thead className="bg-[#FAF8F5] text-charcoal/60 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">Blog Details</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-charcoal/50 bg-white">
                  No blogs found. Click "New Blog" to create one.
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-[#FAF8F5]/50 transition-colors bg-white">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {blog.image_url ? (
                        <img src={blog.image_url} alt="" className="h-12 w-16 object-cover rounded-sm border border-[#EBE3DB]" />
                      ) : (
                        <div className="h-12 w-16 bg-[#FAF8F5] flex items-center justify-center rounded-sm border border-[#EBE3DB]">
                          <ImageIcon className="h-4 w-4 text-charcoal/30" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-charcoal mb-1">{blog.title}</div>
                        <div className="text-xs text-charcoal/60 font-mono">/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-charcoal/80 text-xs">
                    {blog.category || 'General'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm ${blog.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(blog)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(blog.id)}>
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
