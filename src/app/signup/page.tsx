"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

function SignupContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  const handleGoogleSignup = async () => {
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
                  <svg className="w-4 h-4 text-[#A8895C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo variant="default" />
          </div>
          
          <h2 className="font-display text-3xl font-semibold text-charcoal mb-2">Create your account</h2>
          <p className="text-sage-600 mb-8">Join SyncWellnessCo today</p>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full h-12 rounded-xl border-beige-200 bg-white hover:bg-beige-50 text-charcoal font-medium flex items-center justify-center gap-3 mb-6"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87037 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-beige-200"></div>
            <span className="flex-shrink-0 px-4 text-sm text-sage-400">or sign up with email</span>
            <div className="flex-grow border-t border-beige-200"></div>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-beige-200 px-4 py-3 text-charcoal placeholder-sage-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-beige-200 px-4 py-3 text-charcoal placeholder-sage-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-beige-200 px-4 py-3 text-charcoal placeholder-sage-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium p-3 rounded-lg bg-red-50 border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-charcoal hover:bg-gold/90 h-12 text-base rounded-xl mt-2 border-0"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-sage-600">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="font-semibold text-charcoal hover:text-charcoal/80 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
