"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Left side brand screen */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <div className="relative z-10 max-w-lg p-12">
          <Logo variant="default" className="mb-12 transform scale-110 origin-left" />
          <h2 className="font-display text-4xl font-semibold text-charcoal mb-10 leading-tight">
            Comprehensive Support for Your <span className="box-decoration-clone bg-[#EBE3DB] px-2 py-1 inline-block mt-1">Health Journey</span>
          </h2>
          
          <div className="space-y-6">
            {[
              "Hormone Health & Balance",
              "Gut Health Optimization",
              "Sustainable Fat Loss",
              "Personalized Lifestyle Protocols",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 text-charcoal/90 p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EBE3DB] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8C6D40]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center px-6 pt-24 pb-12 sm:px-12 sm:pt-24 lg:px-16 lg:py-12">
        <div className="w-full max-w-md mt-4 lg:mt-0">
          <h2 className="font-display text-3xl font-semibold text-charcoal mb-2">Sign in to your account</h2>
          <p className="text-charcoal mb-8">Access your programs and profile</p>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            isLoading={googleLoading}
            disabled={googleLoading || loading}
            className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-[#DCD3C6] rounded-none bg-transparent hover:bg-[#FAF8F5] hover:border-[#A8895C] transition-colors text-charcoal font-medium disabled:opacity-75 disabled:cursor-not-allowed min-h-[48px]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87037 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center my-8">
            <div className="flex-grow border-t border-[#DCD3C6]"></div>
            <span className="flex-shrink-0 px-4 text-xs tracking-wider uppercase font-semibold text-charcoal/50">or sign in with email</span>
            <div className="flex-grow border-t border-[#DCD3C6]"></div>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                disabled={loading || googleLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 px-3 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors disabled:opacity-60"
                placeholder="*Email Address"
              />
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading || googleLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#DCD3C6] py-3 pr-12 pl-3 text-charcoal placeholder:text-slate-400 focus:ring-0 focus:border-[#A8895C] text-[15px] transition-colors disabled:opacity-60"
                placeholder="*Password"
              />
              <button
                type="button"
                disabled={loading || googleLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal transition-all p-2 rounded-full hover:bg-beige-200/60 flex items-center justify-center cursor-pointer disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              disabled={loading || googleLoading}
              className="w-full bg-[#8C6D40] text-white hover:bg-[#B8955F] uppercase tracking-[0.15em] text-[11px] font-semibold py-4 rounded-none transition-all mt-6 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
            >
              SIGN IN
            </Button>
          </form>

          <div className="mt-8 text-center text-[13px] text-charcoal">
            Don't have an account?{" "}
            <Link href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`} className="font-semibold text-[#8C6D40] hover:text-[#B8955F] transition-colors underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Spinner /></div>}>
      <LoginContent />
    </Suspense>
  );
}
