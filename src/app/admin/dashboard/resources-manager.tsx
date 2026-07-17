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
import { CldUploadWidget } from 'next-cloudinary';
import { deleteCloudinaryFile } from "@/lib/cloudinary-utils";
import dynamic from 'next/dynamic';

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

export function ResourcesManager() {
  const [resources, setResources] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<SubTab>("blogs");
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
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

  const closeModal = async () => {
    if (uploadedImageId) {
      await deleteCloudinaryFile(uploadedImageId, 'image');
      setUploadedImageId(null);
    }
    setIsEditing(false);
    setFormData({});
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

  const handleEdit = (resource: Blog) => {
    setFormData(resource);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    if (subTab === "blogs") {
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
    } else {
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

  const generateSlug = (title: string, prefix: string) => {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
    return `${prefix}-${cleanTitle}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
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
        toast.success("Resource updated!");
      } else {
        // Create
        const { error } = await supabase.from('blogs').insert([submitData]);
        if (error) throw error;
        toast.success("Resource published!");
      }
      
      setUploadedImageId(null);
      setIsEditing(false);
      fetchResources();
    } catch (e) {
      toast.error((e as Error)?.message || "Failed to save resource");
      if (uploadedImageId) {
        await deleteCloudinaryFile(uploadedImageId, 'image');
        setUploadedImageId(null);
        setFormData(prev => ({ ...prev, image_url: '' }));
      }
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-charcoal">Resources Manager</h2>
        <Button onClick={handleCreateNew} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[11px] uppercase tracking-widest px-6 h-10">
          <Plus className="h-4 w-4 mr-2" /> Add {subTab === "blogs" ? "Blog" : subTab === "podcasts" ? "Podcast" : "Media Link"}
        </Button>
      </div>

      {/* Sub-tab selector */}
      <div className="flex gap-2 border-b border-[#EBE3DB] mb-8">
        <button 
          onClick={() => { setSubTab("blogs"); setIsEditing(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${subTab === "blogs" ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
        >
          <BookOpen className="h-4 w-4" />
          Blogs
        </button>
        <button 
          onClick={() => { setSubTab("podcasts"); setIsEditing(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${subTab === "podcasts" ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
        >
          <Video className="h-4 w-4" />
          Podcasts
        </button>
        <button 
          onClick={() => { setSubTab("media"); setIsEditing(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${subTab === "media" ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
        >
          <Newspaper className="h-4 w-4" />
          Media & Press
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-lg bg-white">
            No items found. Click &quot;Add&quot; to create one.
          </div>
        ) : (
          currentList.map((resource) => (
            <div key={resource.id} className="bg-white border border-[#EBE3DB] rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              <div className="relative h-40 w-full bg-[#FAF8F5] border-b border-[#EBE3DB]">
                {resource.image_url ? (
                  <img src={resource.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-charcoal/30">
                    {subTab === "podcasts" ? <Video className="h-8 w-8 mb-2" /> : subTab === "media" ? <Newspaper className="h-8 w-8 mb-2" /> : <ImageIcon className="h-8 w-8 mb-2" />}
                    <span className="text-[10px] uppercase tracking-wider font-bold">No Image</span>
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-[9px] px-2.5 py-1 uppercase tracking-wider font-bold rounded-sm shadow-sm backdrop-blur-md ${resource.published ? 'bg-green-100/90 text-green-700' : 'bg-yellow-100/90 text-yellow-700'}`}>
                  {resource.published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[10px] text-[#8C6D40] font-bold uppercase tracking-wider mb-2">
                  {subTab === "blogs" ? (resource.category || 'General') : subTab === "podcasts" ? 'Podcast' : (resource.author || 'Press')}
                </div>
                <h3 className="font-display text-lg text-charcoal font-bold leading-tight mb-2 line-clamp-2">{resource.title}</h3>
                
                {subTab === "blogs" ? (
                  <div className="text-[10px] text-charcoal/40 font-mono mb-3 truncate bg-charcoal/5 px-2 py-1 rounded-sm w-fit">/{resource.slug}</div>
                ) : (
                  <div className="text-[10px] text-charcoal/40 font-mono mb-3 truncate flex items-center gap-1 bg-charcoal/5 px-2 py-1 rounded-sm w-fit">
                    <ExternalLink className="h-2.5 w-2.5" />
                    {resource.content ? new URL(resource.content).hostname : "no-link"}
                  </div>
                )}
                <p className="text-xs text-charcoal/70 line-clamp-3 mt-auto">{resource.excerpt || 'No description provided.'}</p>
              </div>

              <div className="bg-[#FAF8F5] border-t border-[#EBE3DB] flex items-stretch h-10">
                <button 
                  onClick={() => handleEdit(resource)} 
                  className="flex items-center justify-center text-charcoal/60 hover:text-[#8C6D40] flex-1 hover:bg-[#8C6D40]/5 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <div className="w-px bg-[#EBE3DB]"></div>
                <button 
                  onClick={() => handleDelete(resource.id)} 
                  className="flex items-center justify-center text-red-400 hover:text-red-600 flex-1 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-4xl shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="p-8">
              <h3 className="font-display text-2xl text-charcoal mb-6 border-b pb-4">
                {formData.id ? "Edit" : "Create"} {subTab === "blogs" ? "Blog" : subTab === "podcasts" ? "Podcast" : "Media Article"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side: Cover Image */}
                  {subTab !== "podcasts" && (
                    <div className={`w-full ${subTab === "media" ? "lg:w-[180px] lg:shrink-0" : "lg:w-1/3"} space-y-2`}>
                      <div className="flex flex-col space-y-0.5">
                        <Label className="text-sm font-medium">Cover Image / Logo</Label>
                        <span className="text-[10px] text-charcoal/50 font-medium">
                          {subTab === "media" ? "Aspect ratio: 4:5 portrait" : "Aspect ratio: 3:2 landscape"}
                        </span>
                      </div>
                      <CldUploadWidget 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_BLOGS || "syncwellness_blogs"}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onSuccess={(result: any) => {
                          setFormData(prev => ({ ...prev, image_url: result.info.secure_url }));
                          setUploadedImageId(result.info.public_id);
                          document.body.style.overflow = '';
                        }}
                      >
                        {({ open }) => (
                          <div className={`w-full ${subTab === "media" ? "max-w-[160px] aspect-[4/5]" : "aspect-[3/2]"} max-h-[260px]`}>
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
                                <span className="font-medium text-sm">Upload Image</span>
                                <span className="text-[10px] text-charcoal/40 mt-1">
                                  {subTab === "media" ? "4:5 portrait recommended" : "3:2 landscape recommended"}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </CldUploadWidget>
                    </div>
                  )}

                  {/* Right Side: Inputs */}
                  <div className={`w-full ${subTab === "podcasts" ? "lg:w-full" : subTab === "media" ? "lg:flex-1" : "lg:w-2/3"} space-y-5`}>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={formData.title || ""}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        className="text-lg font-medium h-12 border-[#EBE3DB] focus:border-[#8C6D40]"
                        placeholder={`Enter ${subTab === "blogs" ? "blog" : subTab === "podcasts" ? "podcast" : "article"} title...`}
                      />
                    </div>

                    {subTab === "blogs" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input 
                            value={formData.category || ""}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            placeholder="e.g. Wellness"
                            className="border-[#EBE3DB] focus:border-[#8C6D40]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tags (Comma separated)</Label>
                          <Input 
                            value={formData.tags || ""}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
                            placeholder="e.g. fitness, hormones, diet"
                            className="border-[#EBE3DB] focus:border-[#8C6D40]"
                          />
                        </div>
                      </div>
                    )}

                    {subTab === "podcasts" && (
                      <div className="space-y-2">
                        <Label>Podcast Episode Link</Label>
                        <Input 
                          value={formData.content || ""}
                          onChange={async (e) => {
                            const url = e.target.value;
                            setFormData(prev => ({ ...prev, content: url }));
                            
                            const metadata = await fetchPodcastMetadata(url);
                            if (metadata) {
                              setFormData(prev => ({
                                ...prev,
                                title: prev.title || metadata.title,
                                image_url: prev.image_url || metadata.thumbnailUrl,
                                excerpt: prev.excerpt || metadata.excerpt
                              }));
                            }
                          }}
                          required
                          placeholder="Enter YouTube, Spotify, or Apple Podcast link..."
                          className="border-[#EBE3DB] focus:border-[#8C6D40]"
                        />
                      </div>
                    )}

                    {subTab === "media" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label>Article Link (URL)</Label>
                          <Input 
                            value={formData.content || ""}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                            placeholder="https://vogue.com/article/..."
                            className="border-[#EBE3DB] focus:border-[#8C6D40]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Source / Publisher</Label>
                          <Input 
                            value={formData.author || ""}
                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                            required
                            placeholder="e.g. Vogue, Daily Mail, etc."
                            className="border-[#EBE3DB] focus:border-[#8C6D40]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Short Description / Excerpt</Label>
                      <Textarea 
                        rows={3}
                        value={formData.excerpt || ""}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        placeholder="A brief 1-2 sentence description..."
                        className="border-[#EBE3DB] focus:border-[#8C6D40]"
                      />
                    </div>
                  </div>
                </div>

                {subTab === "blogs" && (
                  <div className="space-y-2">
                    <Label>Blog Content (Tiptap)</Label>
                    <Editor 
                      data={formData.content || ""} 
                      onChange={(val) => setFormData({...formData, content: val})} 
                    />
                  </div>
                )}

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
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#8C6D40] hover:bg-[#B8955F] text-white">
                    {formData.published !== false ? (formData.id ? "Update" : "Publish") : "Draft"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
