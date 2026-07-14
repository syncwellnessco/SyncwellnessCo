"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Smile, 
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookingButton } from "@/components/ui/booking-button";
import { QUESTIONS, BRISTOL_TYPES, quizIntro, calculateQuizScore } from "@/data/quiz";

interface ProgramQuizProps {
  programId: string;
  programSlug: string;
  programTitle: string;
}

export function ProgramQuiz({ programId, programSlug, programTitle }: ProgramQuizProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = Intro, 1 to N = Questions, N+1 = Contact Form, N+2 = Results
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [score, setScore] = useState(0);
  const [transitionTimeoutId, setTransitionTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // User auth state and navigation
  const { user } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

    // Contact details form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+61");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Listen for openQuiz parameter in URL (e.g. after login redirect)
  useEffect(() => {
    const openQuizParam = searchParams.get("openQuiz");
    if (openQuizParam === "true") {
      if (user) {
        setIsOpen(true);
        // Clean up URL parameters to keep URL clean
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else if (user === null) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath + "?openQuiz=true")}`);
      }
    }
  }, [searchParams, user, router]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleStart = () => {
    if (user === undefined) return; // Wait for auth store to initialize

    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath + "?openQuiz=true")}`);
      return;
    }

    if (transitionTimeoutId) {
      clearTimeout(transitionTimeoutId);
      setTransitionTimeoutId(null);
    }
    setIsOpen(true);
    setStep(0);
    setAnswers({});
    setScore(0);
    setName("");
    setEmail("");
    setPhoneNumber("");
    setSubmitError(null);
  };

  const handleClose = () => {
    if (transitionTimeoutId) {
      clearTimeout(transitionTimeoutId);
      setTransitionTimeoutId(null);
    }
    setIsOpen(false);
    setStep(0);
  };

  const selectAnswer = (questionId: number, val: any) => {
    const currentQuestion = QUESTIONS[step - 1];
    if (!currentQuestion || currentQuestion.id !== questionId) return;

    const newAnswers = { ...answers, [questionId]: val };
    setAnswers(newAnswers);

    // If it's yes_no, scale, bristol, or options, we can auto-advance safely
    if (currentQuestion.type !== "text") {
      if (transitionTimeoutId) {
        clearTimeout(transitionTimeoutId);
      }
      const id = setTimeout(() => {
        setStep((currentStep) => {
          if (currentStep === step) {
            if (currentStep === QUESTIONS.length) {
              const { score: calculatedScore } = calculateQuizScore(newAnswers);
              setScore(calculatedScore);
              return QUESTIONS.length + 1; // Go to contact details step
            }
            return currentStep + 1;
          }
          return currentStep;
        });
      }, 250);
      setTransitionTimeoutId(id);
    }
  };

  const handleNext = () => {
    if (transitionTimeoutId) {
      clearTimeout(transitionTimeoutId);
      setTransitionTimeoutId(null);
    }

    setStep((currentStep) => {
      if (currentStep === QUESTIONS.length) {
        const { score: calculatedScore } = calculateQuizScore(answers);
        setScore(calculatedScore);
        return QUESTIONS.length + 1; // Go to contact details step
      }
      return currentStep + 1;
    });
  };

  const handlePrev = () => {
    if (transitionTimeoutId) {
      clearTimeout(transitionTimeoutId);
      setTransitionTimeoutId(null);
    }

    setStep((currentStep) => {
      if (currentStep > 0) {
        return currentStep - 1;
      }
      return currentStep;
    });
  };

  const isStepValid = () => {
    const qIndex = step - 1;
    const q = QUESTIONS[qIndex];
    if (!q) return false;
    
    // Text questions are optional (can submit empty), others need an answer
    if (q.type === "text") return true;
    return answers[q.id] !== undefined;
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setSubmitError("Please fill out both Name and Email.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { score: calculatedScore, result } = calculateQuizScore(answers);
      const res = await fetch("/api/quiz-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phoneNumber: phoneNumber ? `${countryCode}${phoneNumber}` : null,
          countryCode,
          answers,
          score: calculatedScore,
          classification: result.categoryTitle,
          programId,
          programTitle
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit quiz results.");
      }

      setStep(QUESTIONS.length + 2);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    const qIndex = step - 1;
    const q = QUESTIONS[qIndex];
    if (!q) return null;

    return (
      <div className="flex flex-col flex-1 justify-center max-w-2xl mx-auto w-full py-4">
        <span className="text-xs uppercase tracking-widest text-[#8C6D40] font-bold mb-3 block">
          Question {step} of {QUESTIONS.length}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl text-charcoal mb-4 leading-snug">
          {q.text}
        </h2>
        {q.helper && (
          <p className="text-charcoal/60 text-xs sm:text-sm mb-8 leading-relaxed italic">
            {q.helper}
          </p>
        )}

        {/* YES/NO Question Type */}
        {q.type === "yes_no" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {q.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => selectAnswer(q.id, opt)}
                className={cn(
                  "p-5 text-left border rounded-sm transition-all text-sm font-medium tracking-wide flex items-center justify-between",
                  answers[q.id] === opt
                    ? "border-[#8C6D40] bg-[#FAF8F5] text-charcoal shadow-sm"
                    : "border-[#EBE3DB] bg-white text-charcoal/80 hover:bg-[#FAF8F5] hover:border-charcoal/20"
                )}
              >
                <span>{opt}</span>
                {answers[q.id] === opt && <Check className="w-4 h-4 text-[#8C6D40]" />}
              </button>
            ))}
          </div>
        )}

        {/* SCALE 1-5 Question Type */}
        {q.type === "scale" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => selectAnswer(q.id, val)}
                  className={cn(
                    "aspect-square rounded-sm border flex flex-col items-center justify-center transition-all",
                    answers[q.id] === val
                      ? "border-[#8C6D40] bg-[#8C6D40] text-white shadow-md scale-105"
                      : "border-[#EBE3DB] bg-white text-charcoal hover:bg-[#FAF8F5] hover:border-[#8C6D40]/30"
                  )}
                >
                  <span className="text-xl sm:text-2xl font-display font-medium">{val}</span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider opacity-60 mt-1">
                    {val === 1 ? "Mild" : val === 5 ? "Severe" : ""}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-charcoal/50 px-1">
              <span>1 - Almost Never</span>
              <span>5 - Very Severe / Daily</span>
            </div>
          </div>
        )}

        {/* BRISTOL STOOL CHART Question Type */}
        {q.type === "bristol" && (
          <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-1">
            {BRISTOL_TYPES.map((b) => (
              <button
                key={b.type}
                onClick={() => selectAnswer(q.id, b.type)}
                className={cn(
                  "p-4 text-left border rounded-sm transition-all flex items-start gap-4",
                  answers[q.id] === b.type
                    ? "border-[#8C6D40] bg-[#FAF8F5] text-charcoal shadow-sm"
                    : "border-[#EBE3DB] bg-white text-charcoal/80 hover:bg-[#FAF8F5] hover:border-charcoal/20"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full mt-1.5 shrink-0", b.color)} />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-charcoal mb-0.5">{b.label}</h4>
                  <p className="text-xs text-charcoal/60 leading-normal">{b.desc}</p>
                </div>
                {answers[q.id] === b.type && (
                  <Check className="w-4 h-4 text-[#8C6D40] shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* MULTIPLE CHOICE / OPTIONS Question Type */}
        {q.type === "options" && (
          <div className="grid gap-3">
            {q.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => selectAnswer(q.id, opt)}
                className={cn(
                  "p-4 text-left border rounded-sm transition-all text-sm font-medium tracking-wide flex items-center justify-between",
                  answers[q.id] === opt
                    ? "border-[#8C6D40] bg-[#FAF8F5] text-charcoal shadow-sm"
                    : "border-[#EBE3DB] bg-white text-charcoal/80 hover:bg-[#FAF8F5] hover:border-charcoal/20"
                )}
              >
                <span>{opt}</span>
                {answers[q.id] === opt && <Check className="w-4 h-4 text-[#8C6D40]" />}
              </button>
            ))}
          </div>
        )}

        {/* TEXT AREA Question Type */}
        {q.type === "text" && (
          <div className="flex flex-col gap-4">
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder="Type your response here..."
              rows={4}
              className="w-full bg-white border border-[#EBE3DB] p-4 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#8C6D40] text-sm sm:text-base transition-colors resize-none rounded-sm"
            />
            <p className="text-[10px] text-charcoal/40 uppercase tracking-widest text-right">
              Optional field. Click Next to continue.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContactForm = () => {
    return (
      <div className="flex flex-col flex-1 justify-center max-w-md mx-auto w-full py-4">
        <span className="text-xs uppercase tracking-widest text-[#8C6D40] font-bold mb-3 block text-center">
          Final Step
        </span>
        <h2 className="font-display text-2xl sm:text-3xl text-charcoal mb-4 leading-snug text-center">
          See Your Results
        </h2>
        <p className="text-charcoal/60 text-xs sm:text-sm mb-8 leading-relaxed text-center">
          Please enter your details to save your assessment and view your personalized gut health analysis.
        </p>

        <form onSubmit={handleSubmitDetails} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal/70 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full text-sm border border-[#EBE3DB] p-3 rounded-sm focus:outline-none focus:border-[#8C6D40] bg-white text-charcoal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal/70 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full text-sm border border-[#EBE3DB] p-3 rounded-sm focus:outline-none focus:border-[#8C6D40] bg-white text-charcoal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal/70 mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="text-sm border border-[#EBE3DB] p-3 rounded-sm focus:outline-none focus:border-[#8C6D40] bg-white text-charcoal"
              >
                <option value="+91">+91 (IN)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+1">+1 (US/CA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (AE)</option>
                <option value="+65">+65 (SG)</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                className="flex-1 text-sm border border-[#EBE3DB] p-3 rounded-sm focus:outline-none focus:border-[#8C6D40] bg-white text-charcoal"
              />
            </div>
          </div>

          {submitError && (
            <p className="text-red-600 text-xs mt-2 text-center">{submitError}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-14 rounded-none border-0 transition-colors mt-6"
          >
            {isSubmitting ? "Saving & Analyzing..." : "Get My Results"}
          </Button>
        </form>
      </div>
    );
  };

  const renderResults = () => {
    const { score: calculatedScore, result } = calculateQuizScore(answers);
    const { categoryTitle, emojiType, descriptionParagraphs, highlightBox, footerParagraphs, footerItalic } = result;

    let emoji = null;
    if (emojiType === "smile") {
      emoji = <Smile className="w-12 h-12 text-emerald-600 mb-2" />;
    } else if (emojiType === "alert-warning") {
      emoji = <AlertTriangle className="w-12 h-12 text-amber-600 mb-2" />;
    } else {
      emoji = <AlertCircle className="w-12 h-12 text-red-600 mb-2" />;
    }

    const isMedicalWarning = answers[2] === "Yes";

    return (
      <div className="flex flex-col flex-1 justify-center max-w-2xl mx-auto w-full py-4">
        <div className="text-center mb-6 flex flex-col items-center">
          {emoji}
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C6D40] mb-2">Quiz Results</span>
          <h2 className="font-display text-2xl sm:text-3xl text-charcoal leading-tight mb-3">
            Your Gut Health Analysis
          </h2>
          
          <div className="flex items-center gap-6 mt-3 bg-white p-5 border border-[#EBE3DB] shadow-sm">
            <div className="text-center border-r border-[#EBE3DB] pr-6">
              <span className="block text-2xl sm:text-3xl font-display font-medium text-charcoal">{calculatedScore}</span>
              <span className="text-[9px] uppercase tracking-wider text-charcoal/50">Total Score</span>
            </div>
            <div className="text-left">
              <span className="text-xs uppercase tracking-wider text-charcoal/50 font-semibold block mb-0.5">Classification</span>
              <span className="font-display text-[14px] sm:text-base text-[#8C6D40] font-medium leading-tight">{categoryTitle}</span>
            </div>
          </div>
        </div>

        {isMedicalWarning && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-none flex gap-3 text-sm leading-relaxed items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Medical Consideration Note</span>
              You indicated that you are Diabetic, Pregnant/Lactating, Renal, or a Cancer patient. 
              <strong> Please notify Coach Neha Arora prior to starting the program</strong> so we can ensure the protocol is safe or appropriately customized for you.
            </div>
          </div>
        )}

        <div className="text-charcoal/80 text-sm leading-relaxed space-y-4">
          {descriptionParagraphs.map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
          ))}

          {highlightBox && (
            <div className={`bg-white p-5 border-l-4 ${highlightBox.borderColor} shadow-sm rounded-none my-4 space-y-3 text-[14px] leading-relaxed`}>
              <p className="font-semibold text-charcoal">{highlightBox.title}</p>
              {highlightBox.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {footerParagraphs && footerParagraphs.map((para, i) => (
            <p key={i} className="text-charcoal/80 text-[14px] leading-relaxed">{para}</p>
          ))}

          {footerItalic && (
            <p className="font-display text-lg text-[#8C6D40] italic text-center py-2">
              {footerItalic}
            </p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[#EBE3DB] flex flex-row items-center justify-between gap-4 w-full">
          <BookingButton
            programId={programId}
            programSlug={programSlug}
            programName={programTitle}
            showMemberStatus={false}
            className="flex-1 bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.15em] text-[11px] font-bold h-14 px-4 rounded-none border-0 transition-colors"
          >
            Enroll in Cleanse Program
          </BookingButton>
          
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white uppercase tracking-[0.15em] text-[11px] font-semibold h-14 px-4 rounded-none transition-colors"
          >
            Back to Program
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Quiz Section Trigger Card */}
      <section className="py-16 bg-[#FAF8F5] border-t border-[#EBE3DB] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#8C6D40]/5 mix-blend-multiply pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
          <span className="mb-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C6D40]">
            <Sparkles className="w-3.5 h-3.5" /> {quizIntro.triggerBadge}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal mb-4">
            {quizIntro.triggerTitle}
          </h2>
          <p className="text-charcoal/70 text-[15px] sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            {quizIntro.triggerDescription}
          </p>
          <Button
            onClick={handleStart}
            className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-14 px-10 rounded-none border-0 transition-all shadow-sm"
          >
            Start Gut Health Assessment
          </Button>
        </div>
      </section>

      {/* Pop-up modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-charcoal/70 backdrop-blur-sm p-4 sm:p-6"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-3xl bg-cream border border-[#EBE3DB] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header bar (sticky at top) */}
              <div className="w-full px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#EBE3DB]/40 bg-cream shrink-0">
                <span className="font-display text-base tracking-widest text-[#8C6D40] uppercase font-bold">
                  SyncWellnessCo
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Close <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stepper progress */}
              {step > 0 && step <= QUESTIONS.length + 1 && (
                <div className="w-full bg-[#EBE3DB]/30 h-1 shrink-0">
                  <div 
                    className="bg-[#8C6D40] h-full transition-all duration-300"
                    style={{ width: `${(step / (QUESTIONS.length + 1)) * 100}%` }}
                  />
                </div>
              )}

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-cream">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col justify-center min-h-[30vh]"
                  >
                    
                    {/* INTRO STEP */}
                    {step === 0 && (
                      <div className="text-center max-w-xl mx-auto py-8 flex flex-col items-center justify-center flex-1">
                        <div className="w-16 h-16 rounded-full bg-[#8C6D40]/10 flex items-center justify-center mb-6 text-[#8C6D40]">
                          <HelpCircle className="w-8 h-8" />
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl text-charcoal mb-4 leading-tight">
                          {quizIntro.introTitle}
                        </h2>
                        <p className="text-charcoal/70 text-sm sm:text-[15px] leading-relaxed mb-10">
                          {quizIntro.introDescription}
                        </p>
                        <Button
                          onClick={() => setStep(1)}
                          className="bg-[#8C6D40] text-white hover:bg-charcoal uppercase tracking-[0.2em] text-[11px] font-bold h-14 px-12 rounded-none border-0 transition-colors w-full sm:w-auto"
                        >
                          Begin Assessment
                        </Button>
                      </div>
                    )}

                    {/* QUESTIONS STEPS */}
                    {step > 0 && step <= QUESTIONS.length && renderQuestion()}

                    {/* CONTACT DETAILS FORM STEP */}
                    {step === QUESTIONS.length + 1 && renderContactForm()}

                    {/* RESULTS STEP */}
                    {step === QUESTIONS.length + 2 && renderResults()}

                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Stepper Footer Nav (sticky at bottom) */}
              {step > 0 && step <= QUESTIONS.length + 1 && (
                <div className="w-full px-6 sm:px-8 py-5 flex items-center justify-between border-t border-[#EBE3DB]/40 bg-cream shrink-0">
                  <button
                    onClick={handlePrev}
                    disabled={step === 1}
                    className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal disabled:opacity-0 text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {step <= QUESTIONS.length ? (
                    <button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="flex items-center gap-2 text-charcoal/60 hover:text-[#8C6D40] disabled:opacity-30 disabled:hover:text-charcoal/60 text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-4" />
                  )}
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
