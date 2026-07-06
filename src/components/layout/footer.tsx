import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { siteConfig } from "@/data/site";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/resources/blogs" },
  { label: "Resources", href: "/resources" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cream/10 bg-charcoal text-cream/75">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-x-8 gap-y-12 grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              Certified Women&apos;s Health Coach helping busy women restore
              energy, balance hormones, and feel confident through sustainable
              wellness programs.
            </p>
            <h4 className="font-display text-base text-cream mt-8 mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-cream/40 hover:bg-cream/10 hover:text-cream"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-cream/40 hover:bg-cream/10 hover:text-cream"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-cream/40 hover:bg-cream/10 hover:text-cream"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-1">
            <h4 className="font-display text-base text-cream">Navigation</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-1">
            <h4 className="font-display text-base text-cream">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-cream/60 transition-colors hover:text-cream">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-cream/60 transition-colors hover:text-cream">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-sm text-cream/60 transition-colors hover:text-cream">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-sm text-cream/60 transition-colors hover:text-cream">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-display text-base text-cream">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/60">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors hover:text-cream"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>{siteConfig.businessHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-cream/10 pt-8 lg:flex-row flex-wrap">
          <p className="text-sm text-cream/50">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>

          <p className="text-xs text-cream/40 hidden xl:block">
            {siteConfig.seoKeywords.slice(0, 4).join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
