"use client";

import { useState, useEffect } from "react";
import { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Plus, RefreshCw, X, Save, PlusCircle, MinusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CldUploadWidget } from "next-cloudinary";
import { optimizeCloudinaryUrl, deleteCloudinaryFile } from "@/lib/cloudinary-utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const CloudinaryUploader = ({ onUpload, label }: { onUpload: (url: string) => void, label: string }) => {
  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PROGRAMS || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "syncwellness"}
      options={{ folder: 'syncwellness/programs' }}
      onSuccess={(result: any) => {
        if (result?.info?.secure_url) {
          const optimizedUrl = optimizeCloudinaryUrl(result.info.secure_url);
          onUpload(optimizedUrl);
        }
      }}
    >
      {({ open }) => (
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={(e) => { e.preventDefault(); open(); }}
          className="w-full border-dashed border-[#8C6D40] text-[#8C6D40] hover:bg-[#8C6D40]/10 mt-1"
        >
          {label}
        </Button>
      )}
    </CldUploadWidget>
  );
};

const DataDisplay = ({ data }: { data: any }) => {
  if (!data) return <span className="text-gray-400 italic">None</span>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-400 italic">Empty</span>;
    return (
      <ul className="list-disc pl-4 space-y-2">
        {data.map((item, i) => (
          <li key={i} className="text-sm text-charcoal/80">
            {typeof item === 'object' ? <DataDisplay data={item} /> : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof data === 'object') {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([k, v]) => {
          if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) return null;
          return (
            <div key={k} className="bg-white p-3 rounded border border-[#EBE3DB] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#8C6D40] block mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
              {typeof v === 'object' ? <DataDisplay data={v} /> : (
                String(v).startsWith('http') ? (
                  <a href={String(v)} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all text-xs">{String(v)}</a>
                ) : (
                  <span className="text-sm text-charcoal/80">{String(v)}</span>
                )
              )}
            </div>
          )
        })}
      </div>
    );
  }
  return <span className="text-sm text-charcoal/80">{String(data)}</span>;
};

const ArrayMediaEditor = ({ label, value, onChange }: { label: string, value: string[], onChange: (val: string[]) => void }) => {
  return (
    <div>
      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">{label}</label>
      <div className="space-y-2 mb-2">
        {(value || []).map((url, i) => (
          <div key={i} className="flex gap-2 items-center text-xs bg-[#FAF8F5] p-2 rounded border border-[#EBE3DB]">
            <span className="truncate flex-1">{url}</span>
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><MinusCircle className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <CloudinaryUploader label={`Upload ${label}`} onUpload={(url) => onChange([...(value || []), url])} />
    </div>
  )
};

const ObjectArrayEditor = ({ 
  title, items, fields, onChange 
}: { 
  title: string; 
  items: any[]; 
  fields: {key: string, label: string, type?: 'text'|'textarea'|'image'}[]; 
  onChange: (val: any[]) => void 
}) => {
  const add = () => {
    const newItem: any = {};
    fields.forEach(f => newItem[f.key] = '');
    onChange([...(items || []), newItem]);
  };
  const update = (i: number, key: string, val: string) => {
    const copy = [...(items || [])];
    copy[i] = { ...copy[i], [key]: val };
    onChange(copy);
  };
  const remove = (i: number) => onChange((items || []).filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">{title}</label>
        <Button type="button" onClick={add} variant="outline" size="sm" className="h-7 text-xs"><PlusCircle className="h-3 w-3 mr-1"/> Add</Button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} className="flex gap-4 items-start border border-[#EBE3DB] p-4 rounded-sm bg-[#FAF8F5] relative">
           <div className="flex-1 space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] uppercase text-charcoal/60 mb-1 font-semibold">{f.label}</label>
                  {f.type === 'textarea' ? (
                     <textarea value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2 rounded-sm focus:border-[#8C6D40] focus:outline-none min-h-[80px]" />
                  ) : f.type === 'image' ? (
                     <div className="space-y-2">
                       {item[f.key] ? (
                         <div className="flex gap-2 items-center text-xs bg-[#FAF8F5] p-2 rounded border border-[#EBE3DB]">
                           <span className="truncate flex-1">{item[f.key]}</span>
                           <button type="button" onClick={() => update(i, f.key, '')} className="text-red-500"><MinusCircle className="w-4 h-4" /></button>
                         </div>
                       ) : (
                         <CloudinaryUploader label={`Upload ${f.label}`} onUpload={(url) => update(i, f.key, url)} />
                       )}
                     </div>
                  ) : (
                     <input value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2 rounded-sm focus:border-[#8C6D40] focus:outline-none" />
                  )}
                </div>
              ))}
           </div>
           <button type="button" onClick={() => remove(i)} className="text-red-500 mt-6 hover:bg-red-50 p-1 rounded transition-colors"><MinusCircle className="h-5 w-5" /></button>
        </div>
      ))}
    </div>
  )
};

const ArrayTextEditor = ({ label, value, onChange, placeholder }: { label: string, value: string[], onChange: (val: string[]) => void, placeholder?: string }) => {
  return (
    <div>
      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">{label} (One per line)</label>
      <textarea 
        value={(value || []).join('\n')}
        onChange={e => onChange(e.target.value.split('\n').filter(s => s.trim() !== ''))}
        className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[100px] focus:outline-none focus:border-[#8C6D40]"
        placeholder={placeholder}
      />
    </div>
  )
};

export function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [imagePublicId, setImagePublicId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Program>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'hero', label: 'Hero' },
    { id: 'audience', label: 'Audience & Outcomes' },
    { id: 'structure', label: 'Structure & Method' },
    { id: 'content', label: 'Included & FAQs' },
    { id: 'media', label: 'Media, SEO & More' },
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (Array.isArray(data)) setPrograms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (program: Program) => {
    setSelectedProgram(program);
    setIsEditing(false);
    setIsNew(false);
    setActiveTab("basic");
  };

  const handleEditClick = () => {
    setEditForm(selectedProgram || {});
    setIsEditing(true);
    setIsNew(false);
    setActiveTab("basic");
  };

  const handleAddClick = () => {
    const newProg: Partial<Program> = {
      title: "", slug: "", shortDescription: "", description: "", duration: "", format: "", category: "", status: "draft", order: 0,
      featured: false, showOnHome: false,
      pricing: { price: 0, currency: "USD", paymentType: "one-time", installmentAvailable: false },
      hero: { bannerImage: "", ctaText: "Join", ctaLink: "" },
      audience: { designedFor: [], notFor: [], idealClient: [] },
      problemsSolved: [],
      outcomes: { summary: "", physical: [], mental: [], lifestyle: [], wellness: [] },
      included: [], bonuses: [],
      structure: { weeks: [], coachingSchedule: "", sessionFrequency: "", supportStructure: "" },
      methodology: { framework: "", process: "", whyItWorks: "", scientificBasis: "" },
      faqs: [], enrollment: { startDates: [], process: "", applicationProcess: "", paymentPlans: "" },
      testimonials: [], media: { bannerImages: [], gallery: [], videos: [], pdfs: [], resources: [] },
      seo: { metaTitle: "", metaDescription: "", keywords: [] },
      quiz: { enabled: false, title: "" }
    };
    setEditForm(newProg);
    setIsEditing(true);
    setIsNew(true);
    setSelectedProgram({ id: 'new', title: 'New Program' } as any);
    setActiveTab("basic");
  };

  const updateNested = (path: string[], value: any) => {
    setEditForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let current: any = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = isNew ? '/api/programs' : `/api/programs/${selectedProgram?.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        toast.success(isNew ? "Program created successfully!" : "Program updated successfully!");
        setIsEditing(false);
        setSelectedProgram(null);
        fetchPrograms();
      } else {
        const err = await res.json();
        toast.error(`Failed to save: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      toast.error("An error occurred while saving.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`/api/programs/${deleteConfirmId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Program deleted successfully");
        fetchPrograms();
      } else {
        toast.error("Failed to delete program");
      }
    } catch (e) {
      toast.error("Failed to delete program");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between mb-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display text-charcoal">Programs</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleAddClick} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-xs uppercase tracking-wider h-9">
            <Plus className="h-3 w-3 mr-2" /> New Program
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-[#EBE3DB] rounded-md shadow-sm bg-white">
        <table className="w-full text-left text-sm text-charcoal">
          <thead className="bg-[#FAF8F5] text-charcoal/60 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">Title</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-charcoal/50">
                  No programs found.
                </td>
              </tr>
            ) : (
              programs.map((prog) => (
                <tr key={prog.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <td className="px-4 py-4 font-medium">
                    {prog.title}
                    <div className="text-[10px] text-charcoal/50 font-normal uppercase tracking-wider mt-1">{prog.category}</div>
                  </td>
                  <td className="px-4 py-4">{prog.duration}</td>
                  <td className="px-4 py-4">{prog.pricing?.price ? `${prog.pricing.currency} ${prog.pricing.price}` : "Free"}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm ${prog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/60'}`}>
                      {prog.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handleView(prog)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-charcoal/50 hover:text-blue-500">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setDeleteConfirmId(prog.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-charcoal/50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-md shadow-2xl overflow-hidden h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-6 border-b border-[#EBE3DB] bg-[#FAF8F5]">
              <h3 className="font-display text-2xl text-charcoal">
                {isEditing ? (isNew ? "New Program" : "Edit Program") : selectedProgram.title}
              </h3>
              <button onClick={() => setSelectedProgram(null)} className="text-charcoal/50 hover:text-charcoal transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-[#EBE3DB] bg-white px-6 pt-2 overflow-x-auto custom-scrollbar">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
              {!isEditing ? (
                <div className="space-y-8 pb-10">
                  {/* View Mode */}
                  {activeTab === 'basic' && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div><h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Status</h4><p className="text-sm font-medium">{selectedProgram.status}</p></div>
                        <div><h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Category</h4><p className="text-sm font-medium">{selectedProgram.category}</p></div>
                        <div><h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Duration</h4><p className="text-sm font-medium">{selectedProgram.duration}</p></div>
                        <div><h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Format</h4><p className="text-sm font-medium">{selectedProgram.format}</p></div>
                      </div>
                      <div><h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-2">Short Description</h4><p className="text-sm text-charcoal/80 leading-relaxed bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">{selectedProgram.shortDescription}</p></div>
                      <div><h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-2">Full Description</h4><p className="text-sm text-charcoal/80 leading-relaxed bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB] whitespace-pre-wrap">{selectedProgram.description}</p></div>
                    </>
                  )}

                  {activeTab === 'pricing' && (
                    <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Pricing Details</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div><span className="block text-[10px] text-charcoal/60 uppercase">Price</span><span className="text-sm font-medium">{selectedProgram.pricing?.currency} {selectedProgram.pricing?.price}</span></div>
                        <div><span className="block text-[10px] text-charcoal/60 uppercase">Type</span><span className="text-sm font-medium capitalize">{selectedProgram.pricing?.paymentType}</span></div>
                        <div><span className="block text-[10px] text-charcoal/60 uppercase">Installments</span><span className="text-sm font-medium">{selectedProgram.pricing?.installmentAvailable ? "Yes" : "No"}</span></div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hero' && (
                    <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Hero Section</h4>
                      <DataDisplay data={selectedProgram.hero} />
                    </div>
                  )}

                  {activeTab === 'audience' && (
                    <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Audience & Outcomes</h4>
                      <DataDisplay data={{ audience: selectedProgram.audience, outcomes: selectedProgram.outcomes, problemsSolved: selectedProgram.problemsSolved }} />
                    </div>
                  )}

                  {activeTab === 'structure' && (
                    <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Structure & Methodology</h4>
                      <DataDisplay data={{ structure: selectedProgram.structure, methodology: selectedProgram.methodology }} />
                    </div>
                  )}

                  {activeTab === 'content' && (
                    <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Included, Bonuses & FAQs</h4>
                      <DataDisplay data={{ included: selectedProgram.included, bonuses: selectedProgram.bonuses, faqs: selectedProgram.faqs }} />
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EBE3DB]">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Media, SEO & More</h4>
                      <DataDisplay data={{ media: selectedProgram.media, seo: selectedProgram.seo, enrollment: selectedProgram.enrollment, quiz: selectedProgram.quiz }} />
                    </div>
                  )}
                  
                  <p className="text-xs text-charcoal/50 italic mt-4">Click "Edit Program" to modify these sections.</p>
                </div>
              ) : (
                <div className="space-y-8 pb-10">
                  {/* EDIT MODE: BASIC */}
                  {activeTab === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Title</label>
                        <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Slug</label>
                        <input type="text" value={editForm.slug || ''} onChange={e => setEditForm({...editForm, slug: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. hormone-harmony" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Category</label>
                        <input type="text" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Duration</label>
                        <input type="text" value={editForm.duration || ''} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 12 Weeks" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Format</label>
                        <input type="text" value={editForm.format || ''} onChange={e => setEditForm({...editForm, format: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 1:1 Online" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Status</label>
                        <select value={editForm.status || 'draft'} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Order</label>
                        <input type="number" value={editForm.order || 0} onChange={e => setEditForm({...editForm, order: parseInt(e.target.value) || 0})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="featured" checked={editForm.featured || false} onChange={e => {
                            setEditForm({...editForm, featured: e.target.checked, showOnHome: e.target.checked ? true : editForm.showOnHome});
                          }} className="w-4 h-4 text-[#8C6D40]" />
                          <label htmlFor="featured" className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Featured Program</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="showOnHome" disabled={editForm.featured} checked={editForm.featured ? true : (editForm.showOnHome || false)} onChange={e => setEditForm({...editForm, showOnHome: e.target.checked})} className="w-4 h-4 text-[#8C6D40] disabled:opacity-50" />
                          <label htmlFor="showOnHome" className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] disabled:opacity-50">Show on Home Page</label>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Short Description</label>
                        <textarea value={editForm.shortDescription || ''} onChange={e => setEditForm({...editForm, shortDescription: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[80px] focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Full Description</label>
                        <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[120px] focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: PRICING */}
                  {activeTab === 'pricing' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Price</label>
                        <input type="number" value={editForm.pricing?.price || 0} onChange={e => updateNested(['pricing', 'price'], parseFloat(e.target.value) || 0)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Sale Price</label>
                        <input type="number" value={editForm.pricing?.salePrice || ''} onChange={e => updateNested(['pricing', 'salePrice'], parseFloat(e.target.value) || undefined)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Currency</label>
                        <input type="text" value={editForm.pricing?.currency || 'USD'} onChange={e => updateNested(['pricing', 'currency'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Payment Type</label>
                        <select value={editForm.pricing?.paymentType || 'one-time'} onChange={e => updateNested(['pricing', 'paymentType'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]">
                          <option value="one-time">One-time</option>
                          <option value="subscription">Subscription</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Payment Link (URL)</label>
                        <input type="text" value={editForm.pricing?.paymentLink || ''} onChange={e => updateNested(['pricing', 'paymentLink'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="installments" checked={editForm.pricing?.installmentAvailable || false} onChange={e => updateNested(['pricing', 'installmentAvailable'], e.target.checked)} className="w-4 h-4 text-[#8C6D40]" />
                        <label htmlFor="installments" className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Installments Available</label>
                      </div>
                      {editForm.pricing?.installmentAvailable && (
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Installment Text</label>
                          <input type="text" value={editForm.pricing?.installmentText || ''} onChange={e => updateNested(['pricing', 'installmentText'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 3 monthly payments of $400" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* EDIT MODE: HERO */}
                  {activeTab === 'hero' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Hero Headline</label>
                        <input type="text" value={editForm.hero?.headline || ''} onChange={e => updateNested(['hero', 'headline'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Hero Subheadline</label>
                        <textarea value={editForm.hero?.subheadline || ''} onChange={e => updateNested(['hero', 'subheadline'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40] min-h-[80px]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Banner Image URL</label>
                        {editForm.hero?.bannerImage ? (
                          <div className="flex gap-2 items-center text-xs bg-[#FAF8F5] p-2 rounded border border-[#EBE3DB]">
                            <span className="truncate flex-1">{editForm.hero.bannerImage}</span>
                            <button type="button" onClick={() => updateNested(['hero', 'bannerImage'], '')} className="text-red-500"><MinusCircle className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <CloudinaryUploader label="Upload Banner Image" onUpload={(url) => updateNested(['hero', 'bannerImage'], url)} />
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Intro Video URL</label>
                        {editForm.hero?.introVideo ? (
                          <div className="flex gap-2 items-center text-xs bg-[#FAF8F5] p-2 rounded border border-[#EBE3DB]">
                            <span className="truncate flex-1">{editForm.hero.introVideo}</span>
                            <button type="button" onClick={() => updateNested(['hero', 'introVideo'], '')} className="text-red-500"><MinusCircle className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <CloudinaryUploader label="Upload Intro Video" onUpload={(url) => updateNested(['hero', 'introVideo'], url)} />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">CTA Text</label>
                        <input type="text" value={editForm.hero?.ctaText || ''} onChange={e => updateNested(['hero', 'ctaText'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">CTA Link</label>
                        <input type="text" value={editForm.hero?.ctaLink || ''} onChange={e => updateNested(['hero', 'ctaLink'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: AUDIENCE & OUTCOMES */}
                  {activeTab === 'audience' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ArrayTextEditor label="Designed For" value={editForm.audience?.designedFor || []} onChange={v => updateNested(['audience', 'designedFor'], v)} />
                        <ArrayTextEditor label="Not For" value={editForm.audience?.notFor || []} onChange={v => updateNested(['audience', 'notFor'], v)} />
                        <ArrayTextEditor label="Ideal Client" value={editForm.audience?.idealClient || []} onChange={v => updateNested(['audience', 'idealClient'], v)} />
                        <ArrayTextEditor label="Problems Solved" value={editForm.problemsSolved || []} onChange={v => setEditForm({...editForm, problemsSolved: v})} />
                      </div>
                      <hr className="border-[#EBE3DB]" />
                      <h4 className="font-bold text-charcoal">Outcomes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Outcomes Summary</label>
                          <textarea value={editForm.outcomes?.summary || ''} onChange={e => updateNested(['outcomes', 'summary'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[80px]" />
                        </div>
                        <ArrayTextEditor label="Physical Outcomes" value={editForm.outcomes?.physical || []} onChange={v => updateNested(['outcomes', 'physical'], v)} />
                        <ArrayTextEditor label="Mental Outcomes" value={editForm.outcomes?.mental || []} onChange={v => updateNested(['outcomes', 'mental'], v)} />
                        <ArrayTextEditor label="Lifestyle Outcomes" value={editForm.outcomes?.lifestyle || []} onChange={v => updateNested(['outcomes', 'lifestyle'], v)} />
                        <ArrayTextEditor label="Wellness Outcomes" value={editForm.outcomes?.wellness || []} onChange={v => updateNested(['outcomes', 'wellness'], v)} />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: STRUCTURE & METHOD */}
                  {activeTab === 'structure' && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Coaching Schedule</label>
                          <input type="text" value={editForm.structure?.coachingSchedule || ''} onChange={e => updateNested(['structure', 'coachingSchedule'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Session Frequency</label>
                          <input type="text" value={editForm.structure?.sessionFrequency || ''} onChange={e => updateNested(['structure', 'sessionFrequency'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Support Structure</label>
                          <input type="text" value={editForm.structure?.supportStructure || ''} onChange={e => updateNested(['structure', 'supportStructure'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm" />
                        </div>
                      </div>

                      <ObjectArrayEditor 
                        title="Weekly Structure" 
                        items={editForm.structure?.weeks || []} 
                        onChange={v => updateNested(['structure', 'weeks'], v)}
                        fields={[
                          {key: 'week', label: 'Week Number/Name', type: 'text'},
                          {key: 'title', label: 'Title', type: 'text'},
                          {key: 'description', label: 'Description', type: 'textarea'}
                        ]} 
                      />

                      <hr className="border-[#EBE3DB]" />
                      <h4 className="font-bold text-charcoal">Methodology</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Framework</label>
                          <textarea value={editForm.methodology?.framework || ''} onChange={e => updateNested(['methodology', 'framework'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Process</label>
                          <textarea value={editForm.methodology?.process || ''} onChange={e => updateNested(['methodology', 'process'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Why It Works</label>
                          <textarea value={editForm.methodology?.whyItWorks || ''} onChange={e => updateNested(['methodology', 'whyItWorks'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Scientific Basis</label>
                          <textarea value={editForm.methodology?.scientificBasis || ''} onChange={e => updateNested(['methodology', 'scientificBasis'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: CONTENT */}
                  {activeTab === 'content' && (
                    <div className="space-y-8">
                       <ObjectArrayEditor 
                        title="What's Included" 
                        items={editForm.included || []} 
                        onChange={v => setEditForm({...editForm, included: v})}
                        fields={[
                          {key: 'title', label: 'Title', type: 'text'},
                          {key: 'description', label: 'Description', type: 'textarea'},
                          {key: 'icon', label: 'Icon (Optional)', type: 'text'}
                        ]} 
                      />

                      <hr className="border-[#EBE3DB]" />

                      <ObjectArrayEditor 
                        title="Bonuses" 
                        items={editForm.bonuses || []} 
                        onChange={v => setEditForm({...editForm, bonuses: v})}
                        fields={[
                          {key: 'title', label: 'Title', type: 'text'},
                          {key: 'description', label: 'Description', type: 'textarea'}
                        ]} 
                      />

                      <hr className="border-[#EBE3DB]" />

                      <ObjectArrayEditor 
                        title="FAQs" 
                        items={editForm.faqs || []} 
                        onChange={v => setEditForm({...editForm, faqs: v})}
                        fields={[
                          {key: 'question', label: 'Question', type: 'text'},
                          {key: 'answer', label: 'Answer', type: 'textarea'}
                        ]} 
                      />
                    </div>
                  )}

                  {/* EDIT MODE: MEDIA, SEO & TESTIMONIALS */}
                  {activeTab === 'media' && (
                    <div className="space-y-8">
                      <ObjectArrayEditor 
                        title="Testimonials" 
                        items={editForm.testimonials || []} 
                        onChange={v => setEditForm({...editForm, testimonials: v})}
                        fields={[
                          {key: 'name', label: 'Name', type: 'text'},
                          {key: 'designation', label: 'Designation (Optional)', type: 'text'},
                          {key: 'testimonial', label: 'Testimonial', type: 'textarea'},
                          {key: 'image', label: 'Image URL', type: 'image'},
                          {key: 'beforeImage', label: 'Before Image URL', type: 'image'},
                          {key: 'afterImage', label: 'After Image URL', type: 'image'},
                          {key: 'successStory', label: 'Success Story URL (Optional)', type: 'text'}
                        ]} 
                      />

                      <hr className="border-[#EBE3DB]" />
                      <h4 className="font-bold text-charcoal">Media Gallery (URLs)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ArrayMediaEditor label="Banner Images" value={editForm.media?.bannerImages || []} onChange={v => updateNested(['media', 'bannerImages'], v)} />
                        <ArrayMediaEditor label="Gallery Images" value={editForm.media?.gallery || []} onChange={v => updateNested(['media', 'gallery'], v)} />
                        <ArrayMediaEditor label="Videos" value={editForm.media?.videos || []} onChange={v => updateNested(['media', 'videos'], v)} />
                        <ArrayMediaEditor label="Resources/PDFs" value={editForm.media?.resources || []} onChange={v => updateNested(['media', 'resources'], v)} />
                        <ArrayMediaEditor label="PDFs (Legacy)" value={editForm.media?.pdfs || []} onChange={v => updateNested(['media', 'pdfs'], v)} />
                      </div>

                      <hr className="border-[#EBE3DB]" />
                      <h4 className="font-bold text-charcoal">SEO & Enrollment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Meta Title</label>
                          <input type="text" value={editForm.seo?.metaTitle || ''} onChange={e => updateNested(['seo', 'metaTitle'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Meta Description</label>
                          <input type="text" value={editForm.seo?.metaDescription || ''} onChange={e => updateNested(['seo', 'metaDescription'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                        </div>
                        <div className="md:col-span-2">
                           <ArrayTextEditor label="SEO Keywords" value={editForm.seo?.keywords || []} onChange={v => updateNested(['seo', 'keywords'], v)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="md:col-span-2">
                           <ArrayTextEditor label="Start Dates (Enrollment)" value={editForm.enrollment?.startDates || []} onChange={v => updateNested(['enrollment', 'startDates'], v)} />
                        </div>
                         <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Enrollment Process</label>
                          <textarea value={editForm.enrollment?.process || ''} onChange={e => updateNested(['enrollment', 'process'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Application Process</label>
                          <textarea value={editForm.enrollment?.applicationProcess || ''} onChange={e => updateNested(['enrollment', 'applicationProcess'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Payment Plans (Text)</label>
                          <textarea value={editForm.enrollment?.paymentPlans || ''} onChange={e => updateNested(['enrollment', 'paymentPlans'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" />
                        </div>
                      </div>

                      <hr className="border-[#EBE3DB]" />
                      <h4 className="font-bold text-charcoal">Quiz Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex items-center gap-2">
                          <input type="checkbox" id="quiz-enabled" checked={editForm.quiz?.enabled || false} onChange={e => updateNested(['quiz', 'enabled'], e.target.checked)} className="w-4 h-4 text-[#8C6D40]" />
                          <label htmlFor="quiz-enabled" className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Enable Quiz</label>
                        </div>
                        {editForm.quiz?.enabled && (
                          <>
                            <div>
                              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Quiz Title</label>
                              <input type="text" value={editForm.quiz?.title || ''} onChange={e => updateNested(['quiz', 'title'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Quiz Link</label>
                              <input type="text" value={editForm.quiz?.quizLink || ''} onChange={e => updateNested(['quiz', 'quizLink'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Quiz Description</label>
                              <textarea value={editForm.quiz?.description || ''} onChange={e => updateNested(['quiz', 'description'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" />
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#EBE3DB] bg-[#FAF8F5] flex justify-end gap-3 shrink-0">
              {!isEditing ? (
                <>
                  <Button onClick={() => setSelectedProgram(null)} variant="outline" className="text-xs uppercase tracking-wider">Close</Button>
                  <Button onClick={handleEditClick} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-xs uppercase tracking-wider">
                    <Edit className="h-3 w-3 mr-2" /> Edit Program
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setSelectedProgram(null)} variant="outline" className="text-xs uppercase tracking-wider" disabled={isSaving}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-xs uppercase tracking-wider">
                    {isSaving ? <RefreshCw className="h-3 w-3 mr-2 animate-spin" /> : <Save className="h-3 w-3 mr-2" />} 
                    {isSaving ? "Saving..." : (isNew ? "Create Program" : "Save Changes")}
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Program"
        message="Are you sure you want to delete this program? This action cannot be undone."
      />
    </div>
  );
}
