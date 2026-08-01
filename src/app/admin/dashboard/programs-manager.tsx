"use client";

import { useState, useEffect } from "react";
import { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Plus, RefreshCw, X, Save, PlusCircle, MinusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadFileToCloudinary } from "@/lib/cloudinary-utils";
import { MediaUploader } from "@/components/ui/media-uploader";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toggle } from "@/components/ui/toggle";

const CloudinaryUploader = ({ onUpload, label }: { onUpload: (val: string | File) => void, label: string }) => {
  const isVideoLabel = label.toLowerCase().includes("video");
  return (
    <MediaUploader
      label={label}
      accept={isVideoLabel ? "video/*" : "image/*,video/*"}
      aspectRatioClass="aspect-video max-h-48"
      onUpload={(val) => onUpload(val)}
    />
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
                  String(v).match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || String(v).includes('res.cloudinary.com/daw1tscqr/image') ? (
                    <img src={String(v)} alt="" className="w-full max-w-[200px] rounded-sm border border-[#EBE3DB]" />
                  ) : (
                    <a href={String(v)} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all text-xs">{String(v)}</a>
                  )
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

const ArrayMediaEditor = ({ label, value, onChange }: { label: string, value: (string | File)[], onChange: (val: (string | File)[]) => void }) => {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">{label}</label>
        <span className="text-[9px] text-charcoal/50">Aspect ratio: 16:9 landscape recommended</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
        {(value || []).map((url, i) => (
          <MediaUploader
            key={i}
            value={url}
            aspectRatioClass="aspect-video"
            onUpload={(newUrl) => {
              const copy = [...(value || [])];
              copy[i] = newUrl;
              onChange(copy);
            }}
            onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
          />
        ))}
      </div>
      <MediaUploader
        label={`Upload ${label}`}
        helperText="16:9 landscape recommended"
        accept="image/*,video/*"
        aspectRatioClass="aspect-video max-h-32"
        onUpload={(url) => onChange([...(value || []), url])}
      />
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
  const update = (i: number, key: string, val: string | File) => {
    const copy = [...(items || [])];
    copy[i] = { ...copy[i], [key]: val };
    onChange(copy);
  };
  const remove = (i: number) => onChange((items || []).filter((_, idx) => idx !== i));

  const getButtonText = () => {
    const lower = title.toLowerCase();
    if (lower.includes("included")) return "Add Included Item";
    if (lower.includes("bonus")) return "Add Bonus";
    if (lower.includes("faq")) return "Add More FAQs";
    return `Add ${title}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase font-bold tracking-widest text-[#8C6D40]">{title}</label>
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
                     <MediaUploader
                       label={f.label}
                       helperText="16:9 landscape recommended"
                       value={item[f.key] || ''}
                       accept="image/*"
                       aspectRatioClass="aspect-video max-h-36"
                       onUpload={(url) => update(i, f.key, url)}
                       onRemove={() => update(i, f.key, '')}
                     />
                  ) : (
                     <input value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2 rounded-sm focus:border-[#8C6D40] focus:outline-none" />
                  )}
                </div>
              ))}
           </div>
           <button type="button" onClick={() => remove(i)} className="text-red-500 mt-6 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"><MinusCircle className="h-5 w-5" /></button>
        </div>
      ))}
      <div className="flex justify-start pt-2">
        <button 
          type="button" 
          onClick={add} 
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D40] hover:text-[#B8955F] transition-colors focus:outline-none py-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {getButtonText()}
        </button>
      </div>
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'hero', label: 'Hero' },
    { id: 'audience', label: 'Audience & Outcomes' },
    { id: 'structure', label: 'Structure & Method' },
    { id: 'content', label: 'Included & FAQs' },
    { id: 'media', label: 'SEO & Enrollment' },
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((prog: Program) => ({
          ...prog,
          pricing: prog.pricing ? { ...prog.pricing, currency: "AUD" } : { price: 0, currency: "AUD", paymentType: "one-time" as const, installmentAvailable: false }
        }));
        setPrograms(normalized);
      }
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

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const toggleProgramFeatured = async (prog: any) => {
    setUpdatingIds(prev => ({ ...prev, [`feat-${prog.id}`]: true }));
    try {
      const nextFeatured = !prog.featured;
      const updates = {
        featured: nextFeatured,
        showOnHome: nextFeatured ? true : prog.showOnHome
      };
      const res = await fetch(`/api/programs/${prog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(nextFeatured ? "Program featured on home!" : "Program unfeatured");
        setPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, ...updates } : p));
      } else {
        toast.error("Failed to update program");
        throw new Error("Failed to update program");
      }
    } catch (e) {
      toast.error("Error updating program");
      throw e;
    } finally {
      setUpdatingIds(prev => ({ ...prev, [`feat-${prog.id}`]: false }));
    }
  };

  const handleEditClick = () => {
    setEditForm(selectedProgram || {});
    setIsEditing(true);
    setIsNew(false);
  };

  const handleAddClick = () => {
    const newProg: Partial<Program> = {
      title: "", slug: "", shortDescription: "", description: "", duration: "", format: "", category: "", status: "published", featured_rank: 1,
      featured: false, showOnHome: false,
      pricing: { price: 0, currency: "AUD", paymentType: "one-time", installmentAvailable: false, requireConsultant: false },
      hero: { bannerImage: "" },
      audience: { designedFor: [], notFor: [], idealClient: [] },
      problemsSolved: [],
      outcomes: { summary: "", physical: [], mental: [], lifestyle: [], wellness: [] },
      included: [{ title: "" }], 
      bonuses: [{ title: "" }],
      structure: { weeks: [{ week: "Week 1", title: "", description: "" }], coachingSchedule: "", sessionFrequency: "", supportStructure: "" },
      methodology: { framework: "", process: "", whyItWorks: "", scientificBasis: "" },
      faqs: [], enrollment: { startDates: [], process: "", applicationProcess: "", paymentPlans: "" },
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

  const [stagedBannerFile, setStagedBannerFile] = useState<File | null>(null);
  const [stagedIntroVideoFile, setStagedIntroVideoFile] = useState<File | null>(null);
  const [bannerProgress, setBannerProgress] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);

  const uploadAllStagedFiles = async (obj: any, preset: string): Promise<any> => {
    if (!obj) return obj;
    if (obj instanceof File) {
      const { url } = await uploadFileToCloudinary(obj, preset);
      return url;
    }
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => uploadAllStagedFiles(item, preset)));
    }
    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, val] of Object.entries(obj)) {
        newObj[key] = await uploadAllStagedFiles(val, preset);
      }
      return newObj;
    }
    return obj;
  };

  const handleSaveWithStatus = async (statusVal: 'published' | 'draft') => {
    if (editForm.featured && editForm.featured_rank) {
      const existing = programs.find(p => p.featured && p.featured_rank === editForm.featured_rank && p.id !== (isNew ? null : selectedProgram?.id) && !(p as any).isSeed);
      if (existing) {
        toast.error(`Rank ${editForm.featured_rank} is already assigned to "${existing.title}". Please choose a different rank.`);
        return;
      }
    }

    setIsSaving(true);
    setBannerProgress(null);
    setVideoProgress(null);
    try {
      const isActuallyNew = isNew || (selectedProgram as any)?.isSeed;
      const url = isActuallyNew ? '/api/programs' : `/api/programs/${selectedProgram?.id}`;
      const method = isActuallyNew ? 'POST' : 'PUT';

      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PROGRAMS || "syncwellness";
      let bannerUrl = editForm.hero?.bannerImage || '';
      let introVideoUrl = editForm.hero?.introVideo || '';

      if (stagedBannerFile || stagedIntroVideoFile) {
        toast.loading("Uploading program hero media...", { id: "uploading-program-hero" });
        const uploadPromises: Promise<any>[] = [];
        if (stagedBannerFile) {
          setBannerProgress(0);
          uploadPromises.push(
            uploadFileToCloudinary(stagedBannerFile, preset, (p) => setBannerProgress(p))
              .then(res => bannerUrl = res.url)
          );
        }
        if (stagedIntroVideoFile) {
          setVideoProgress(0);
          uploadPromises.push(
            uploadFileToCloudinary(stagedIntroVideoFile, preset, (p) => setVideoProgress(p))
              .then(res => introVideoUrl = res.url)
          );
        }
        await Promise.all(uploadPromises);
        toast.dismiss("uploading-program-hero");
      }

      // Process any nested staged File objects in editForm (such as in included, bonuses, etc.)
      const resolvedEditForm = await uploadAllStagedFiles(editForm, preset);

      const updatedHero = {
        ...(resolvedEditForm.hero || {}),
        bannerImage: bannerUrl,
        introVideo: introVideoUrl,
      };

      const payload = {
        ...resolvedEditForm,
        hero: updatedHero,
        status: statusVal,
        pricing: resolvedEditForm.pricing ? { ...resolvedEditForm.pricing, currency: "AUD" } : { price: 0, currency: "AUD", paymentType: "one-time", installmentAvailable: false }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(isNew ? (statusVal === 'published' ? "Program created & published!" : "Program saved as draft!") : (statusVal === 'published' ? "Program published!" : "Program saved as draft!"));
        setIsEditing(false);
        setSelectedProgram(null);
        setStagedBannerFile(null);
        setStagedIntroVideoFile(null);
        setBannerProgress(null);
        setVideoProgress(null);
        fetchPrograms();
      } else {
        const err = await res.json();
        toast.error(`Failed to save: ${err.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      toast.dismiss("uploading-program-hero");
      toast.error(e.message || "An error occurred while saving.");
      console.error(e);
    } finally {
      setIsSaving(false);
      setBannerProgress(null);
      setVideoProgress(null);
    }
  };

  const handleSave = () => handleSaveWithStatus(editForm.status === 'published' ? 'published' : 'draft');

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
          <Button onClick={handleAddClick} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-xs uppercase tracking-wider h-9 rounded-none">
            <Plus className="h-3 w-3 mr-2" /> New Program
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal/50 border border-dashed border-[#EBE3DB] rounded-lg bg-white">
            No programs found.
          </div>
        ) : (
          programs.map((prog) => (
            <div key={prog.id} className="bg-white border border-[#EBE3DB] rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] px-2 py-1 uppercase tracking-wider font-bold rounded-sm ${prog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/60'}`}>
                      {prog.status}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-charcoal font-bold mb-1">{prog.title}</h3>
                  <div className="text-[10px] text-charcoal/50 font-normal uppercase tracking-wider mb-3">{prog.category || "Uncategorized"} • {prog.duration || "No duration"}</div>
                  <p className="text-xs text-charcoal/70 line-clamp-2">{prog.shortDescription || 'No short description provided.'}</p>
                </div>
              </div>
              <div className="bg-[#FAF8F5] border-t border-[#EBE3DB] flex items-center justify-between px-4 py-2.5">
                <Toggle
                  size="sm"
                  checked={!!prog.featured}
                  loading={!!updatingIds[`feat-${prog.id}`]}
                  onChange={() => toggleProgramFeatured(prog)}
                  label={<span className="text-[10px] uppercase font-bold tracking-wider text-charcoal">Featured</span>}
                />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleView(prog)} 
                    className="p-1.5 text-charcoal/60 hover:text-[#8C6D40] hover:bg-[#8C6D40]/10 rounded transition-colors cursor-pointer"
                    title="Edit Program"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(prog.id)} 
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Delete Program"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-md shadow-2xl overflow-hidden h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-6 border-b border-[#EBE3DB] bg-[#FAF8F5]">
              <h3 className="font-display text-2xl text-charcoal">
                {isEditing ? (isNew ? "New Program" : "Edit Program") : selectedProgram.title}
              </h3>
              <button 
                type="button" 
                onClick={() => isEditing ? setShowCancelConfirm(true) : setSelectedProgram(null)} 
                className="p-1.5 text-charcoal/60 hover:text-charcoal hover:bg-[#EBE3DB]/50 rounded-full transition-colors focus:outline-none cursor-pointer"
                aria-label="Close modal"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-[#EBE3DB] bg-white px-6 pt-2 overflow-x-auto custom-scrollbar">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.id ? "border-[#8C6D40] text-[#8C6D40]" : "border-transparent text-charcoal/60 hover:text-charcoal"}`}
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
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <span className="block text-[10px] text-charcoal/60 uppercase">Regular Price (MRP)</span>
                          <span className="text-sm font-medium">AUD {selectedProgram.pricing?.price}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-charcoal/60 uppercase">Sale Price (Selling Price)</span>
                          <span className="text-sm font-medium text-green-700">AUD {selectedProgram.pricing?.salePrice ?? selectedProgram.pricing?.price}</span>
                        </div>
                        <div><span className="block text-[10px] text-charcoal/60 uppercase">Type</span><span className="text-sm font-medium capitalize">{selectedProgram.pricing?.paymentType}</span></div>
                        <div><span className="block text-[10px] text-charcoal/60 uppercase">Installments</span><span className="text-sm font-medium">{selectedProgram.pricing?.installmentAvailable ? "Yes" : "No"}</span></div>
                        <div><span className="block text-[10px] text-charcoal/60 uppercase">Require Consultation</span><span className="text-sm font-medium">{selectedProgram.pricing?.requireConsultant ? "Yes" : "No"}</span></div>
                      </div>

                      {/* Direct Checkout Payment Link */}
                      <div className="mt-6 pt-4 border-t border-[#EBE3DB]">
                        <span className="block text-[10px] text-[#8C6D40] uppercase font-bold tracking-wider mb-2">Direct Checkout Payment Link</span>
                        <div className="flex items-center gap-2 max-w-2xl bg-white border border-[#EBE3DB] p-2 rounded-sm">
                          <input 
                            type="text" 
                            readOnly 
                            value={typeof window !== 'undefined' ? `${window.location.origin}/checkout?programId=${selectedProgram.slug || selectedProgram.id}` : ""}
                            className="bg-transparent border-0 focus:ring-0 focus:outline-none text-xs text-charcoal/80 flex-1 min-w-0" 
                          />
                          <button 
                            onClick={() => {
                              const url = `${window.location.origin}/checkout?programId=${selectedProgram.slug || selectedProgram.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success("Checkout link copied to clipboard!");
                            }}
                            className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[10px] uppercase font-bold px-3 py-1.5 transition-colors rounded-sm shrink-0 cursor-pointer"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hero' && (
                    <div className="bg-[#FAF8F5] p-6 rounded-sm border border-[#EBE3DB] space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Banner Image</h4>
                          {selectedProgram.hero?.bannerImage ? (
                            <img src={selectedProgram.hero.bannerImage} alt="Banner" className="w-full aspect-video object-cover rounded border border-[#EBE3DB] shadow-sm" />
                          ) : <span className="text-sm text-charcoal/50">No image</span>}
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-3">Intro Video</h4>
                          {selectedProgram.hero?.introVideo ? (
                            <video src={selectedProgram.hero.introVideo} controls className="w-full aspect-video object-cover rounded border border-[#EBE3DB] shadow-sm bg-black" />
                          ) : <span className="text-sm text-charcoal/50">No video</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Headline</h4>
                          <p className="text-sm">{selectedProgram.hero?.headline || <span className="text-charcoal/50 italic">None</span>}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Subheadline</h4>
                          <p className="text-sm">{selectedProgram.hero?.subheadline || <span className="text-charcoal/50 italic">None</span>}</p>
                        </div>
                      </div>
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
                      <DataDisplay data={{ seo: selectedProgram.seo, enrollment: selectedProgram.enrollment, quiz: selectedProgram.quiz }} />
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
                        <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. The Hormone Harmony Program" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Category</label>
                        <input type="text" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. Women's Health, Fitness, Nutrition" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Duration</label>
                        <input type="text" value={editForm.duration || ''} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 12 Weeks" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Format</label>
                        <input type="text" value={editForm.format || ''} onChange={e => setEditForm({...editForm, format: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 1:1 Online Coaching" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Status</label>
                        <select value={editForm.status || 'draft'} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <Toggle
                          id="featured"
                          size="sm"
                          checked={!!editForm.featured}
                          onChange={(checked) => setEditForm({...editForm, featured: checked, showOnHome: checked ? true : editForm.showOnHome})}
                          label={<span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Featured Program</span>}
                        />
                        {editForm.featured && (
                          <div className="flex items-center gap-2">
                            <label htmlFor="featured_rank" className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Featured Rank</label>
                            <input 
                              type="number" 
                              id="featured_rank" 
                              min="1" 
                              value={editForm.featured_rank === undefined ? '' : editForm.featured_rank} 
                              onChange={e => {
                                const val = e.target.value;
                                if (val === '') {
                                  setEditForm({...editForm, featured_rank: undefined as any});
                                } else {
                                  const num = parseInt(val);
                                  if (!isNaN(num) && num >= 1) {
                                    setEditForm({...editForm, featured_rank: num});
                                  }
                                }
                              }} 
                              className="w-12 text-sm border border-[#EBE3DB] p-1.5 rounded-sm focus:outline-none focus:border-[#8C6D40] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                          </div>
                        )}
                        <Toggle
                          id="showOnHome"
                          size="sm"
                          disabled={!!editForm.featured}
                          checked={editForm.featured ? true : (editForm.showOnHome || false)}
                          onChange={(checked) => setEditForm({...editForm, showOnHome: checked})}
                          label={<span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Show on Home Page</span>}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Short Description</label>
                        <textarea value={editForm.shortDescription || ''} onChange={e => setEditForm({...editForm, shortDescription: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[80px] focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. A quick 2-sentence summary of what this program delivers." />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Full Description</label>
                        <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[120px] focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. Describe the full journey. What will they experience? Why does it matter?" />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: PRICING */}
                  {activeTab === 'pricing' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Price (AUD)</label>
                        <input type="number" value={editForm.pricing?.price === undefined ? '' : editForm.pricing.price} onChange={e => updateNested(['pricing', 'price'], e.target.value === '' ? undefined : parseFloat(e.target.value))} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 499" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Sale Price (AUD)</label>
                        <input type="number" value={editForm.pricing?.salePrice === undefined ? '' : editForm.pricing.salePrice} onChange={e => updateNested(['pricing', 'salePrice'], e.target.value === '' ? undefined : parseFloat(e.target.value))} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. 399" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Payment Type</label>
                        <select value={editForm.pricing?.paymentType || 'one-time'} onChange={e => updateNested(['pricing', 'paymentType'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]">
                          <option value="one-time">One-time</option>
                          <option value="subscription">Subscription</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="requireConsultant" checked={editForm.pricing?.requireConsultant || false} onChange={e => updateNested(['pricing', 'requireConsultant'], e.target.checked)} className="w-4 h-4 text-[#8C6D40]" />
                        <label htmlFor="requireConsultant" className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40]">Require 1:1 Consultation (Hides price, shows free booking CTA with Calendly)</label>
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

                      {/* Read-Only Checkout Link on Edit Mode */}
                      {!isNew && (
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-[#EBE3DB]">
                          <span className="block text-[10px] text-[#8C6D40] uppercase font-bold tracking-wider mb-2">Direct Checkout Payment Link (Read-Only)</span>
                          <div className="flex items-center gap-2 max-w-2xl bg-white border border-[#EBE3DB] p-2 rounded-sm">
                            <input 
                              type="text" 
                              readOnly 
                              value={typeof window !== 'undefined' ? `${window.location.origin}/checkout?programId=${editForm.slug || editForm.id}` : ""}
                              className="bg-transparent border-0 focus:ring-0 focus:outline-none text-xs text-charcoal/50 flex-1 min-w-0" 
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const url = `${window.location.origin}/checkout?programId=${editForm.slug || editForm.id}`;
                                navigator.clipboard.writeText(url);
                                toast.success("Checkout link copied to clipboard!");
                              }}
                              className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-[10px] uppercase font-bold px-3 py-1.5 transition-colors rounded-sm shrink-0 cursor-pointer"
                            >
                              Copy Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* EDIT MODE: HERO */}
                  {activeTab === 'hero' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Hero Headline</label>
                        <input type="text" value={editForm.hero?.headline || ''} onChange={e => updateNested(['hero', 'headline'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. Master Your Hormones Naturally" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Hero Subheadline</label>
                        <textarea value={editForm.hero?.subheadline || ''} onChange={e => updateNested(['hero', 'subheadline'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40] min-h-[80px]" placeholder="e.g. A 12-week comprehensive program designed to restore your energy and balance your body..." />
                      </div>
                      
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Banner Image Box */}
                        <MediaUploader
                          label="Banner Image"
                          helperText="Aspect ratio: 16:9 landscape"
                          value={stagedBannerFile || editForm.hero?.bannerImage || ''}
                          accept="image/*"
                          aspectRatioClass="aspect-video"
                          progress={bannerProgress}
                          onSelectFile={(file) => setStagedBannerFile(file)}
                          onRemove={() => {
                            setStagedBannerFile(null);
                            updateNested(['hero', 'bannerImage'], '');
                          }}
                        />

                        {/* Intro Video Box */}
                        <MediaUploader
                          label="Intro Video (Optional)"
                          helperText="Aspect ratio: 16:9 landscape"
                          value={stagedIntroVideoFile || editForm.hero?.introVideo || ''}
                          accept="video/*"
                          aspectRatioClass="aspect-video"
                          progress={videoProgress}
                          onSelectFile={(file) => setStagedIntroVideoFile(file)}
                          onRemove={() => {
                            setStagedIntroVideoFile(null);
                            updateNested(['hero', 'introVideo'], '');
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: AUDIENCE & OUTCOMES */}
                  {activeTab === 'audience' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ArrayTextEditor label="Designed For" value={editForm.audience?.designedFor || []} onChange={v => updateNested(['audience', 'designedFor'], v)} placeholder="e.g. Women struggling with low energy" />
                        <ArrayTextEditor label="Not For" value={editForm.audience?.notFor || []} onChange={v => updateNested(['audience', 'notFor'], v)} placeholder="e.g. Those looking for a quick fix" />
                        <ArrayTextEditor label="Ideal Client" value={editForm.audience?.idealClient || []} onChange={v => updateNested(['audience', 'idealClient'], v)} placeholder="e.g. Ambitious women ready to reclaim their health" />
                        <ArrayTextEditor label="Problems Solved" value={editForm.problemsSolved || []} onChange={v => setEditForm({...editForm, problemsSolved: v})} placeholder="e.g. Stubborn weight gain, brain fog, fatigue" />
                      </div>
                      <hr className="border-[#EBE3DB]" />
                      <h4 className="font-bold text-charcoal">Outcomes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Outcomes Summary</label>
                          <textarea value={editForm.outcomes?.summary || ''} onChange={e => updateNested(['outcomes', 'summary'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm min-h-[80px]" placeholder="e.g. By the end of this program, you will experience a complete transformation..." />
                        </div>
                        <ArrayTextEditor label="Physical Outcomes" value={editForm.outcomes?.physical || []} onChange={v => updateNested(['outcomes', 'physical'], v)} placeholder="e.g. Increased energy levels" />
                        <ArrayTextEditor label="Mental Outcomes" value={editForm.outcomes?.mental || []} onChange={v => updateNested(['outcomes', 'mental'], v)} placeholder="e.g. Enhanced mental clarity" />
                        <ArrayTextEditor label="Lifestyle Outcomes" value={editForm.outcomes?.lifestyle || []} onChange={v => updateNested(['outcomes', 'lifestyle'], v)} placeholder="e.g. Better sleep quality" />
                        <ArrayTextEditor label="Wellness Outcomes" value={editForm.outcomes?.wellness || []} onChange={v => updateNested(['outcomes', 'wellness'], v)} placeholder="e.g. Deep understanding of your body" />
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: STRUCTURE & METHOD */}
                  {activeTab === 'structure' && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Coaching Schedule</label>
                          <input type="text" value={editForm.structure?.coachingSchedule || ''} onChange={e => updateNested(['structure', 'coachingSchedule'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm" placeholder="e.g. Weekly calls on Tuesdays" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Session Frequency</label>
                          <input type="text" value={editForm.structure?.sessionFrequency || ''} onChange={e => updateNested(['structure', 'sessionFrequency'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm" placeholder="e.g. 1 hour per week" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Support Structure</label>
                          <input type="text" value={editForm.structure?.supportStructure || ''} onChange={e => updateNested(['structure', 'supportStructure'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm" placeholder="e.g. Unlimited text support via WhatsApp" />
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
                          <textarea value={editForm.methodology?.framework || ''} onChange={e => updateNested(['methodology', 'framework'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. The 4-Phase Sync Protocol" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Process</label>
                          <textarea value={editForm.methodology?.process || ''} onChange={e => updateNested(['methodology', 'process'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. Step 1: Assessment, Step 2: Detox..." />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Why It Works</label>
                          <textarea value={editForm.methodology?.whyItWorks || ''} onChange={e => updateNested(['methodology', 'whyItWorks'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. Addresses the root cause instead of masking symptoms." />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Scientific Basis</label>
                          <textarea value={editForm.methodology?.scientificBasis || ''} onChange={e => updateNested(['methodology', 'scientificBasis'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. Backed by functional medicine principles and gut microbiome research." />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIT MODE: CONTENT */}
                  {activeTab === 'content' && (
                    <div className="space-y-8">
                      <div className="bg-[#FAF8F5]/40 border border-[#EBE3DB] p-6 rounded-sm shadow-sm">
                        <ObjectArrayEditor 
                          title="What's Included" 
                          items={editForm.included || []} 
                          onChange={v => setEditForm({...editForm, included: v})}
                          fields={[
                            {key: 'title', label: 'Title', type: 'text'}
                          ]} 
                        />
                      </div>

                      <div className="bg-[#FAF8F5]/40 border border-[#EBE3DB] p-6 rounded-sm shadow-sm">
                        <ObjectArrayEditor 
                          title="Bonuses" 
                          items={editForm.bonuses || []} 
                          onChange={v => setEditForm({...editForm, bonuses: v})}
                          fields={[
                            {key: 'title', label: 'Title', type: 'text'}
                          ]} 
                        />
                      </div>

                      <div className="bg-[#FAF8F5]/40 border border-[#EBE3DB] p-6 rounded-sm shadow-sm">
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
                    </div>
                  )}

                  {/* EDIT MODE: SEO & ENROLLMENT */}
                  {activeTab === 'media' && (
                    <div className="space-y-8">
                      <h4 className="font-bold text-charcoal">SEO & Enrollment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Meta Title</label>
                          <input type="text" value={editForm.seo?.metaTitle || ''} onChange={e => updateNested(['seo', 'metaTitle'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. Syncwellness | The Hormone Harmony Program" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Meta Description</label>
                          <input type="text" value={editForm.seo?.metaDescription || ''} onChange={e => updateNested(['seo', 'metaDescription'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm focus:outline-none focus:border-[#8C6D40]" placeholder="e.g. Discover a 12-week program designed to balance your hormones..." />
                        </div>
                        <div className="md:col-span-2">
                           <ArrayTextEditor label="SEO Keywords" value={editForm.seo?.keywords || []} onChange={v => updateNested(['seo', 'keywords'], v)} placeholder="e.g. hormone balancing program, natural healing" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="md:col-span-2">
                           <ArrayTextEditor label="Start Dates (Enrollment)" value={editForm.enrollment?.startDates || []} onChange={v => updateNested(['enrollment', 'startDates'], v)} placeholder="e.g. October 1st, 2024" />
                        </div>
                         <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Enrollment Process</label>
                          <textarea value={editForm.enrollment?.process || ''} onChange={e => updateNested(['enrollment', 'process'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. 1. Apply, 2. Consultation, 3. Start" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Application Process</label>
                          <textarea value={editForm.enrollment?.applicationProcess || ''} onChange={e => updateNested(['enrollment', 'applicationProcess'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. Fill out the application form linked below to see if we're a good fit." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] mb-1">Payment Plans (Text)</label>
                          <textarea value={editForm.enrollment?.paymentPlans || ''} onChange={e => updateNested(['enrollment', 'paymentPlans'], e.target.value)} className="w-full text-sm border border-[#EBE3DB] p-2.5 rounded-sm h-24" placeholder="e.g. We offer flexible payment plans. Pay in full for a discount, or split it into 3 payments." />
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
                  <Button onClick={() => setSelectedProgram(null)} variant="outline" className="text-xs uppercase tracking-wider rounded-none">Close</Button>
                  <Button onClick={handleEditClick} className="bg-[#8C6D40] hover:bg-[#B8955F] text-white text-xs uppercase tracking-wider rounded-none">
                    <Edit className="h-3 w-3 mr-2" /> Edit Program
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Toggle 
                      id="program-published"
                      size="md"
                      checked={editForm.status === 'published'} 
                      onChange={(checked) => setEditForm(prev => ({ ...prev, status: checked ? 'published' : 'draft' }))}
                      label="Publish immediately"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setShowCancelConfirm(true)} 
                      variant="outline" 
                      className="rounded-none border border-[#EBE3DB] hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-charcoal/80 text-xs uppercase tracking-wider font-semibold h-10 px-5" 
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => handleSaveWithStatus(editForm.status === 'published' ? 'published' : 'draft')} 
                      disabled={isSaving} 
                      className={`rounded-none text-xs uppercase tracking-wider font-semibold h-10 px-6 ${
                        editForm.status === 'published' 
                          ? "bg-[#8C6D40] hover:bg-[#B8955F] text-white" 
                          : "bg-charcoal hover:bg-charcoal/80 text-white"
                      }`}
                    >
                      {isSaving ? "Saving..." : (editForm.status === 'published' ? "Publish Immediately" : "Save Draft")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setIsEditing(false);
          setSelectedProgram(null);
          setShowCancelConfirm(false);
        }}
        title="Are you sure you want to cancel?"
        message="Any unsaved changes will be discarded. Are you sure you want to exit?"
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
      />

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
