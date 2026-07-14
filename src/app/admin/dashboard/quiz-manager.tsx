"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, ClipboardList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTIONS } from "@/data/quiz";

interface QuizResponseItem {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  country_code: string | null;
  answers: Record<string, any>;
  score: number;
  classification: string;
  program_id: string | null;
  program_title: string | null;
  createdAt: string;
}

export function QuizManager() {
  const [responses, setResponses] = useState<QuizResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<QuizResponseItem | null>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/quiz-responses");
      const data = await res.json();
      if (Array.isArray(data)) setResponses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStoolTypeDescription = (typeNum: any) => {
    const num = Number(typeNum);
    switch (num) {
      case 1: return "Type 1: Separate hard lumps (Severe constipation)";
      case 2: return "Type 2: Sausage-shaped but lumpy (Mild constipation)";
      case 3: return "Type 3: Like sausage with surface cracks (Normal/Dry)";
      case 4: return "Type 4: Smooth/soft snake-like (Perfect/Healthy)";
      case 5: return "Type 5: Soft blobs with clear-cut edges (Lack of fiber)";
      case 6: return "Type 6: Fluffy mushy pieces (Borderline diarrhea/inflammation)";
      case 7: return "Type 7: Watery, entire liquid (Diarrhea/severe irritation)";
      default: return `Type ${typeNum}`;
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-display text-charcoal mb-6">Quiz Responses</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display text-charcoal mb-6">Quiz Responses</h2>
      
      <div className="overflow-x-auto border border-[#EBE3DB] rounded-md shadow-sm">
        <table className="w-full text-left text-sm text-charcoal">
          <thead className="bg-[#FAF8F5] text-charcoal/60 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">User Details</th>
              <th className="px-4 py-3 font-semibold">Classification</th>
              <th className="px-4 py-3 font-semibold">Score</th>
              <th className="px-4 py-3 font-semibold">Context</th>
              <th className="px-4 py-3 font-semibold">Submitted At</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {responses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-charcoal/50 bg-white">
                  No quiz responses found.
                </td>
              </tr>
            ) : (
              responses.map((resp) => (
                <tr key={resp.id} className="hover:bg-[#FAF8F5]/50 transition-colors bg-white">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-charcoal mb-0.5">{resp.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-charcoal/75 mb-0.5">
                      <Mail className="h-3.5 w-3.5 text-charcoal/40" /> 
                      <span>{resp.email}</span>
                    </div>
                    {resp.phone_number && (
                      <div className="flex items-center gap-1.5 text-xs text-charcoal/60">
                        <Phone className="h-3.5 w-3.5 text-charcoal/40" />
                        <span className="font-mono">{resp.country_code || ""} {resp.phone_number}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold rounded-sm ${
                      resp.classification.includes("Healthy") ? "bg-emerald-100 text-emerald-800" :
                      resp.classification.includes("Category 1") ? "bg-amber-100 text-amber-800" :
                      resp.classification.includes("Category 2") ? "bg-orange-100 text-orange-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {resp.classification}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-display font-medium text-base text-charcoal">
                    {resp.score} <span className="text-[10px] text-charcoal/40 uppercase tracking-widest font-sans font-normal">pts</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-charcoal/70">
                    {resp.program_title || "General Assessment"}
                  </td>
                  <td className="px-4 py-4 text-charcoal/60 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-charcoal/30" />
                      <span>{new Date(resp.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] text-charcoal/40 mt-0.5">{new Date(resp.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button 
                      onClick={() => setSelectedResponse(resp)}
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-7 px-3 uppercase tracking-wider flex items-center gap-1 bg-[#8C6D40]/5 border-[#8C6D40]/25 text-[#8C6D40] hover:bg-[#8C6D40] hover:text-white rounded-none"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Slide-Over/Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#FAF8F5] h-screen shadow-2xl flex flex-col border-l border-[#EBE3DB]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#EBE3DB] bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C6D40]">Submission Details</span>
                <h3 className="text-xl font-display text-charcoal mt-1">{selectedResponse.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedResponse(null)}
                className="p-2 hover:bg-[#FAF8F5] rounded-full transition-colors text-charcoal/60 hover:text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="bg-white p-5 border border-[#EBE3DB] shadow-sm grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block mb-1">Email Address</span>
                  <a href={`mailto:${selectedResponse.email}`} className="font-semibold text-charcoal hover:underline">{selectedResponse.email}</a>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block mb-1">Phone Number</span>
                  <span className="font-semibold text-charcoal">
                    {selectedResponse.phone_number ? `${selectedResponse.country_code || ""} ${selectedResponse.phone_number}` : "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block mb-1">Total Score & Classification</span>
                  <span className="font-semibold text-[#8C6D40]">{selectedResponse.score} pts ({selectedResponse.classification})</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block mb-1">Origin Program</span>
                  <span className="font-semibold text-charcoal">{selectedResponse.program_title || "General Site"}</span>
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold tracking-[0.15em] text-[#8C6D40]">Submitted Responses</h4>
                
                <div className="space-y-3">
                  {QUESTIONS.map((q) => {
                    const ans = selectedResponse.answers[q.id];
                    return (
                      <div key={q.id} className="bg-white p-4 border border-[#EBE3DB] shadow-sm rounded-sm">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-xs font-semibold text-charcoal/50 uppercase tracking-wide">Q{q.id}</span>
                          <span className="text-[10px] uppercase tracking-widest bg-[#FAF8F5] text-charcoal/50 px-2 py-0.5 border border-[#EBE3DB]/50">
                            {q.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-charcoal mb-2 leading-relaxed">{q.text}</p>
                        
                        <div className="bg-[#FAF8F5] p-3 border-l-2 border-[#8C6D40] text-sm text-charcoal">
                          {ans === undefined || ans === null ? (
                            <span className="italic text-charcoal/40">Not Answered / Skipped</span>
                          ) : q.type === "scale" ? (
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-base text-[#8C6D40]">{ans}</span>
                              <span className="text-xs text-charcoal/60">
                                {ans === 1 ? "(1 - Almost Never)" : ans === 5 ? "(5 - Very Severe / Daily)" : ""}
                              </span>
                            </div>
                          ) : q.type === "bristol" ? (
                            <span>{getStoolTypeDescription(ans)}</span>
                          ) : (
                            <span className="whitespace-pre-wrap">{String(ans)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#EBE3DB] bg-white text-right">
              <Button onClick={() => setSelectedResponse(null)} className="bg-charcoal text-white hover:bg-charcoal/95 uppercase tracking-wider text-[10px]">
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
