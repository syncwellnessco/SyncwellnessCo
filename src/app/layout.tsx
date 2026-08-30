import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteLoader } from "@/components/layout/site-loader";
import { siteConfig } from "@/data/site";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "react-hot-toast";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Hormone Balance, Gut Health & Weight Loss Coaching`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Certified Women's Health Coach helping busy women balance hormones, heal their gut, and lose weight naturally. Sustainable, biology-based wellness programs.",
  keywords: siteConfig.seoKeywords,
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Hormone Balance, Gut Health & Weight Loss Coaching`,
    description:
      "Helping women balance hormones, heal their gut & lose weight naturally without extreme dieting.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Hormone & Weight Loss Coaching`,
    description:
      "Sustainable hormone, gut health, and fat loss coaching programs for women.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${openSans.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen bg-cream font-sans text-sage-800 antialiased" suppressHydrationWarning>
        <GoogleAnalytics />
        <AuthProvider>
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#FAF8F5',
                color: '#333333',
                border: '1px solid #EBE3DB',
                borderRadius: '2px',
                fontSize: '13px',
                fontFamily: 'var(--font-open-sans)',
                letterSpacing: '0.05em'
              },
              success: {
                iconTheme: {
                  primary: '#8C6D40',
                  secondary: '#fff',
                },
              },
            }}
          />
          <SiteLoader>{children}</SiteLoader>
        </AuthProvider>
      </body>
    </html>
  );
}
