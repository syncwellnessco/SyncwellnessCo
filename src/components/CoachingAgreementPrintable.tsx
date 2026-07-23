"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, ShieldCheck } from "lucide-react";

interface CoachingAgreementPrintableProps {
  name: string;
  programTitle: string;
  programDuration: string;
  programIncluded: any[];
  purchaseDate: string;
  status: string;
  acceptedAt?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  onClose: () => void;
}

export function CoachingAgreementPrintable({
  name,
  programTitle,
  programDuration,
  programIncluded,
  purchaseDate,
  status,
  acceptedAt,
  ip,
  userAgent,
  onClose,
}: CoachingAgreementPrintableProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = acceptedAt
    ? new Date(acceptedAt).toLocaleString()
    : new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      id="printable-agreement-area-wrapper" 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4 overflow-y-auto no-print-overlay"
    >
      {/* Dynamic Print CSS styles injection to print ONLY this container */}
      <style jsx global>{`
        @media print {
          /* Hide all other direct children of body during print */
          body > *:not(#printable-agreement-area-wrapper) {
            display: none !important;
          }
          
          /* Style printable agreement container for full page print */
          #printable-agreement-area-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: block !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }

          #printable-agreement-area {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
            position: relative !important;
            width: 100% !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Document Card Modal */}
      <div
        id="printable-agreement-area"
        className="bg-white border border-[#EBE3DB] shadow-2xl rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-[#FAF8F5] border-b border-[#EBE3DB] p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D40]">Agreement Document</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8C6D40] hover:bg-[#1F2937] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#EBE3DB]/40 text-charcoal/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-8 sm:p-12 space-y-8 text-xs text-charcoal/80 leading-relaxed font-serif bg-white flex-1">
          <div className="text-center pb-6 border-b border-[#EBE3DB]/60">
            <h1 className="text-[11px] font-bold uppercase tracking-widest text-[#8C6D40] mb-2 font-sans">
              Health Coaching Programme
            </h1>
            <h2 className="text-xl sm:text-2xl font-normal text-charcoal font-sans">
              CLIENT COMMITMENT & AGREEMENT
            </h2>
          </div>

          <p className="italic text-[13px] leading-relaxed">
            The Client Commitment & Agreement for Personal Coaching by Neha Arora outlines the expectations, commitments, and responsibilities for both the client and coach.
          </p>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 border-b border-[#EBE3DB]/40 pb-1 font-sans">
              Client's Commitment
            </h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Sign the agreement before the first session.</li>
              <li>Attend coaching calls on time and be present.</li>
              <li>Be honest, open, and authentic, and communicate any challenges.</li>
              <li>Take responsibility for personal results, seek support when needed, and try new things.</li>
              <li>Celebrate wins and be patient with progress.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 border-b border-[#EBE3DB]/40 pb-1 font-sans">
              Coach’s Commitment
            </h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Believe in the client’s potential and provide support, accountability, and actionable information.</li>
              <li>Offer customized guidance and help overcome challenges.</li>
              <li>Maintain honesty, kindness, and integrity throughout the coaching relationship.</li>
              <li>All client information will be kept strictly confidential. Any use of images, testimonials, or related content will only be shared with prior consent.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 border-b border-[#EBE3DB]/40 pb-1 font-sans">
              What’s Included in the Program ({programTitle})
            </h3>
            <ul className="list-disc pl-4 space-y-2">
              {programIncluded && programIncluded.length > 0 ? (
                programIncluded.map((item: any, idx: number) => (
                  <li key={idx}>{item.title}</li>
                ))
              ) : (
                <>
                  <li>12 Weekly, One-on-One Coaching Sessions.</li>
                  <li>Emergency WhatsApp Support between sessions.</li>
                  <li>Customized Materials like checklists, meal plans, and bonuses discussed.</li>
                  <li>Access to the Online platform, valid until enrolled.</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 border-b border-[#EBE3DB]/40 pb-1 font-sans">
              Program Details
            </h3>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>Duration:</strong> {programDuration}.</li>
              <li>Sessions are 30-45 minutes, with 60 minutes blocked for potential overruns.</li>
              <li><strong>Cancellation Policy:</strong> Allows one emergency reschedule; other cancellations with less than 48 hours’ notice are forfeited.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 border-b border-[#EBE3DB]/40 pb-1 font-sans">
              Investment & Refund Policy
            </h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Program cost is paid at the beginning of the month/program and is non-refundable. In case of any emergency or illness, the duration of the program can be extended.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 border-b border-[#EBE3DB]/40 pb-1 font-sans">
              Disclaimer & Legal Terms
            </h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Coaching is not medical or nutritional advice and doesn’t replace licensed health professionals.</li>
              <li>The client assumes full responsibility for their decisions and well-being.</li>
              <li>Agreement terms cannot be modified without mutual consent and supersede all prior agreements.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#EBE3DB]/60 space-y-6">
            <p className="font-bold text-charcoal/90 font-sans">
              IN WITNESS WHEREOF, Client and Coach agree to the terms and conditions set forth in and have duly executed this Client Commitment & Agreement.
            </p>
            
            {/* Signature Block */}
            <div className="border border-[#EBE3DB] bg-[#FAF8F5] p-6 max-w-md rounded-sm font-sans space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50 border-b border-[#EBE3DB]/60 pb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#8C6D40]" /> Signature Verification
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-charcoal/50 block text-[9px] uppercase font-bold tracking-wider">Client</span>
                  <span className="font-semibold text-charcoal text-sm">{name}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[9px] uppercase font-bold tracking-wider">Status</span>
                  <span className="font-semibold text-charcoal text-sm">{status === "Accepted" ? "🟢 Signed & Accepted" : "🟠 Pending Signature"}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[9px] uppercase font-bold tracking-wider">Verification Date</span>
                  <span className="font-semibold text-charcoal text-sm">{formattedDate}</span>
                </div>
                {ip && (
                  <div>
                    <span className="text-charcoal/50 block text-[9px] uppercase font-bold tracking-wider">IP Address</span>
                    <span className="font-mono text-charcoal text-[11px] font-semibold">{ip}</span>
                  </div>
                )}
                {userAgent && (
                  <div>
                    <span className="text-charcoal/50 block text-[9px] uppercase font-bold tracking-wider">User Agent</span>
                    <span className="font-mono text-charcoal/80 text-[10px] line-clamp-1">{userAgent}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#EBE3DB]/60">
                  <span className="text-charcoal/50 block text-[9px] uppercase font-bold tracking-wider">Coach</span>
                  <span className="font-semibold text-charcoal text-sm">Neha Arora</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-[#EBE3DB]/40">
            <p className="text-[10px] font-bold tracking-widest text-[#8C6D40] uppercase font-sans">
              CONGRATULATIONS & WELCOME TO PERSONAL COACHING!!
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
