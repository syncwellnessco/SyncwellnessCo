"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Sparkles, ShieldCheck, Mail, ArrowRight, BookOpen, AlertCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { CoachingAgreementPrintable } from "@/components/CoachingAgreementPrintable";

interface AgreementFormProps {
  token: string;
  name: string;
  programTitle: string;
  programDuration: string;
  programIncluded: any[];
  purchaseDate: string;
  initialStatus: string;
  acceptedAt?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export function AgreementForm({
  token,
  name,
  programTitle,
  programDuration,
  programIncluded,
  purchaseDate,
  initialStatus,
  acceptedAt,
  ip,
  userAgent,
}: AgreementFormProps) {
  const [status, setStatus] = useState(initialStatus);
  const [acceptedDate, setAcceptedDate] = useState(acceptedAt);
  const [clientIp, setClientIp] = useState(ip);
  const [clientUa, setClientUa] = useState(userAgent);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleAccept = async () => {
    if (!checkboxChecked || isPending) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/agreement/${token}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to accept agreement. Please try again.");
          return;
        }

        toast.success("Coaching agreement accepted successfully!");
        setStatus("Accepted");
        setAcceptedDate(new Date().toISOString());
        // Reload IP/UA details dynamically if server captured them
        if (data.ip) setClientIp(data.ip);
        if (data.userAgent) setClientUa(data.userAgent);
      } catch (err) {
        console.error("Error accepting agreement:", err);
        toast.error("An error occurred. Please check your internet connection.");
      }
    });
  };

  const reviewAgreement = () => {
    setShowPrintModal(true);
  };

  if (status === "Accepted") {
    return (
      <div className="bg-white border border-[#EBE3DB] shadow-lg p-8 sm:p-12 rounded-sm text-center relative overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#8C6D40] to-[#B8955F]"></div>

        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(16,185,129,0.1)] border border-emerald-100">
          <div className="w-14 h-14 bg-[#8C6D40] rounded-full flex items-center justify-center text-white shadow-inner">
            <Check className="h-7 w-7 stroke-[3]" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#8C6D40] uppercase bg-[#8C6D40]/5 px-4 py-2 rounded-sm mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Confirmed
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-normal text-charcoal mb-4 leading-tight">
          Agreement Already Accepted
        </h1>

        <p className="text-charcoal/80 text-[15px] sm:text-[16px] leading-relaxed max-w-lg mx-auto mb-10">
          Thank you, <span className="font-semibold text-charcoal">{name}</span>. You have already reviewed and accepted the coaching agreement for <span className="font-semibold text-charcoal">{programTitle}</span>.
        </p>

        {/* Summary Block */}
        <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-6 text-left rounded-sm mb-10 max-w-md mx-auto shadow-sm text-sm space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 border-b border-[#EBE3DB]/60 pb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#8C6D40]" /> Acceptance Record
          </h3>
          <div className="space-y-2.5 text-xs text-charcoal/80">
            <div className="flex justify-between">
              <span className="text-charcoal/50 font-medium">Program:</span>
              <span className="font-semibold text-charcoal text-right">{programTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/50 font-medium">Purchase Date:</span>
              <span className="font-semibold text-charcoal">{purchaseDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/50 font-medium">Accepted Date:</span>
              <span className="font-semibold text-charcoal">
                {acceptedDate ? new Date(acceptedDate).toLocaleDateString() : "Today"}
              </span>
            </div>
            {clientIp && (
              <div className="flex justify-between">
                <span className="text-charcoal/50 font-medium">Signed from IP:</span>
                <span className="font-semibold text-charcoal font-mono text-[10px]">{clientIp}</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3.5 max-w-md mx-auto">
          <button
            onClick={reviewAgreement}
            className="w-full bg-[#FAF8F5] hover:bg-[#EBE3DB]/40 border border-[#EBE3DB] text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-sm cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#8C6D40]" /> REVIEW & PRINT SIGNED AGREEMENT (PDF)
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/profile"
              className="flex-1 bg-charcoal text-white hover:bg-[#8C6D40] uppercase tracking-[0.15em] text-[11px] font-bold py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-sm"
            >
              GO TO MY PROFILE <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/"
              className="flex-1 bg-transparent hover:bg-[#FAF8F5] border border-[#DCD3C6] text-charcoal uppercase tracking-[0.15em] text-[11px] font-bold py-4 px-6 transition-all duration-300 flex items-center justify-center rounded-sm"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
        {showPrintModal && (
          <CoachingAgreementPrintable
            name={name}
            programTitle={programTitle}
            programDuration={programDuration}
            programIncluded={programIncluded}
            purchaseDate={purchaseDate}
            status={status}
            acceptedAt={acceptedDate}
            ip={clientIp}
            userAgent={clientUa}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EBE3DB] shadow-lg p-6 sm:p-12 rounded-sm relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#8C6D40] to-[#B8955F]"></div>

      <div className="mb-8 border-b border-[#EBE3DB] pb-6">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#8C6D40] uppercase bg-[#8C6D40]/5 px-3 py-1.5 rounded-sm mb-3">
          <FileText className="h-3.5 w-3.5" /> Review Required
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal text-charcoal leading-tight">
          Coaching Agreement & Policies
        </h1>
        <p className="text-xs text-charcoal/60 mt-2">
          Please review the terms, refund policy, privacy policy, and liability disclaimer for your coaching program.
        </p>
      </div>

      {/* Summary block */}
      <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-4 text-xs rounded-sm mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-charcoal/50 uppercase font-bold tracking-wider block text-[9px] mb-1">Customer</span>
          <span className="font-semibold text-charcoal text-sm">{name}</span>
        </div>
        <div>
          <span className="text-charcoal/50 uppercase font-bold tracking-wider block text-[9px] mb-1">Program</span>
          <span className="font-semibold text-charcoal text-sm">{programTitle}</span>
        </div>
        <div>
          <span className="text-charcoal/50 uppercase font-bold tracking-wider block text-[9px] mb-1">Purchased On</span>
          <span className="font-semibold text-charcoal text-sm">{purchaseDate}</span>
        </div>
      </div>

      {/* Document Agreement Text Container */}
      <div className="border border-[#EBE3DB] bg-[#FAF8F5] p-5 sm:p-8 rounded-sm h-[420px] overflow-y-auto text-xs text-charcoal/80 space-y-6 leading-relaxed mb-8 scroll-smooth shadow-inner">
        <div className="text-center pb-4 border-b border-[#EBE3DB]/60">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C6D40] mb-1">Health Coaching Programme</h2>
          <h3 className="font-display text-lg font-semibold text-charcoal">CLIENT COMMITMENT & AGREEMENT</h3>
        </div>

        <p className="italic">
          The Client Commitment & Agreement for Personal Coaching by Neha Arora outlines the expectations, commitments, and responsibilities for both the client and coach.
        </p>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">Client's Commitment:</h4>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Sign the agreement before the first session.</li>
            <li>Attend coaching calls on time and be present.</li>
            <li>Be honest, open, and authentic, and communicate any challenges.</li>
            <li>Take responsibility for personal results, seek support when needed, and try new things.</li>
            <li>Celebrate wins and be patient with progress.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">Coach’s Commitment:</h4>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Believe in the client’s potential and provide support, accountability, and actionable information.</li>
            <li>Offer customized guidance and help overcome challenges.</li>
            <li>Maintain honesty, kindness, and integrity throughout the coaching relationship.</li>
            <li>All client information will be kept strictly confidential. Any use of images, testimonials, or related content will only be shared with prior consent.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">What’s Included in the Program ({programTitle}):</h4>
          <ul className="list-disc pl-4 space-y-1.5">
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">Program Details:</h4>
          <ul className="list-disc pl-4 space-y-1.5">
            <li><strong>Duration:</strong> {programDuration}.</li>
            <li>Sessions are 30-45 minutes, with 60 minutes blocked for potential overruns.</li>
            <li><strong>Cancellation Policy:</strong> Allows one emergency reschedule; other cancellations with less than 48 hours’ notice are forfeited.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">Investment & Refund Policy:</h4>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Program cost is paid at the beginning of the month/program and is non-refundable. In case of any emergency or illness, the duration of the program can be extended.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">Disclaimer & Legal Terms:</h4>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Coaching is not medical or nutritional advice and doesn’t replace licensed health professionals.</li>
            <li>The client assumes full responsibility for their decisions and well-being.</li>
            <li>Agreement terms cannot be modified without mutual consent and supersede all prior agreements.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#EBE3DB]/60 space-y-3">
          <p className="font-medium text-charcoal/90">
            IN WITNESS WHEREOF, Client and Coach agree to the terms and conditions set forth in and have duly executed this Client Commitment & Agreement.
          </p>
          <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-4 space-y-2 text-xs rounded-sm max-w-md">
            <div><strong>Client Name:</strong> {name}</div>
            <div><strong>Date:</strong> {purchaseDate}</div>
            <div><strong>Coach:</strong> Neha Arora</div>
          </div>
        </div>

        <div className="text-center pt-4 font-display">
          <p className="text-xs font-bold tracking-widest text-[#8C6D40] uppercase">CONGRATULATIONS & WELCOME TO PERSONAL COACHING!!</p>
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <button
          onClick={reviewAgreement}
          className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D40] hover:underline flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" /> Review Printable Document
        </button>
      </div>

      {/* Acceptance Form */}
      <div className="border-t border-[#EBE3DB] pt-6 space-y-6">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
            className="mt-1 h-4.5 w-4.5 rounded border-[#EBE3DB] text-[#8C6D40] focus:ring-[#8C6D40]"
          />
          <span className="text-xs text-charcoal/80 leading-relaxed font-medium">
            I have read the Client Commitment & Agreement and agree to all its terms. I understand this action constitutes a legally binding electronic signature.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checkboxChecked || isPending}
          className={`w-full py-4.5 px-6 uppercase tracking-[0.15em] text-[11px] font-bold text-white transition-all duration-300 rounded-sm shadow-sm flex items-center justify-center gap-2 ${
            checkboxChecked && !isPending
              ? "bg-charcoal hover:bg-[#8C6D40]"
              : "bg-charcoal/30 cursor-not-allowed text-white/70"
          }`}
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ACCEPTING AGREEMENT...
            </>
          ) : (
            <>
              ACCEPT AGREEMENT <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      {showPrintModal && (
        <CoachingAgreementPrintable
          name={name}
          programTitle={programTitle}
          programDuration={programDuration}
          programIncluded={programIncluded}
          purchaseDate={purchaseDate}
          status={status}
          acceptedAt={acceptedDate}
          ip={clientIp}
          userAgent={clientUa}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
