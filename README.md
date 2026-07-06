# 🌿 SyncwellnessCo

> A premium, holistic women's wellness and metabolic fat loss platform designed with a high-end, minimalist editorial aesthetic.

SyncwellnessCo is a full-stack Next.js web application built to serve as both a gorgeous, high-conversion landing page for wellness programs and a robust, custom-built Content Management System (CMS) for the business owner. 

---

## 🚀 Tech Stack

### Frontend Architecture
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom luxury color palette, heavy use of glassmorphism)
* **Animations:** Framer Motion (Scroll animations, page transitions, complex modals)
* **Icons:** Lucide React

### Backend & Database
* **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Authentication:** Supabase Auth (Session-based, protecting the Admin Dashboard)
* **API:** Next.js Route Handlers (`/api/*`) and Direct Supabase Client calls.

### CMS Integration
* **Rich Text Editor:** [Editor.js](https://editorjs.io/) (Integrated for a Notion-like blog authoring experience)
* **Media Handling:** Cloudinary (Integrated via API for robust image/video uploads)

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── admin/            # Protected Admin Dashboard & Login
│   ├── api/              # API Route Handlers (Cloudinary, Fallback endpoints)
│   ├── programs/         # Slug-based dynamic program pages ([slug])
│   ├── resources/        # Blogs ([slug]) and eBooks
│   ├── testimonials/     # Dedicated testimonial grid & video modals
│   └── page.tsx          # Main Homepage
│
├── components/           # Reusable React Components
│   ├── admin/            # CMS UI (Data tables, Forms, Editor.js instance)
│   ├── home/             # Homepage sections (Hero, Marquees, Features)
│   ├── layout/           # Global layout (Navbar, Footer, PageShell wrappers)
│   ├── pages/            # Page-specific content wrappers
│   └── ui/               # Primitive UI components (Buttons, Inputs, Headings)
│
├── lib/                  # Utility Functions & Configuration
│   ├── supabase-client.ts# Client-side Supabase initialization
│   ├── utils.ts          # Tailwind merge & clsx utilities (cn)
│   └── blogs.ts          # Blog data fetching logic
│
└── types/                # TypeScript Interfaces & Definitions
    └── blog.ts           # Shared types across frontend and backend
```

---

## 🎨 Design Philosophy & UI/UX

This project heavily leans into a **"Premium Editorial"** aesthetic. Future developers should adhere to the following design constraints to maintain brand identity:
1. **Color Palette:** Avoid harsh primary colors. Use the brand's custom config:
   * **Charcoal** (`#1A1A1A`) for high-contrast dark modes and primary text.
   * **Cream/Beige** (`#FAF8F5`, `#EBE3DB`) for warm, inviting backgrounds.
   * **Gold Accents** (`#8C6D40`, `#D4AF37`) for primary actions, badges, and highlights.
2. **Typography:** Rely on modern, elegant sans-serif and serif pairings. Avoid heavy, clunky weights unless used for specific editorial headers.
3. **Glassmorphism:** Overlays (like video modals, badges, and sticky headers) should use `bg-white/20` or `bg-black/40` paired with `backdrop-blur-md` and subtle borders (`border-white/10`) to create a "frosted glass" look rather than flat opaque colors.
4. **Minimal Padding:** Use negative space intentionally. Elements like badges should be sleek (`rounded-sm` instead of full pill shapes where applicable) and push towards the edges to maximize visual real estate for media.

---

## ⚙️ Core Workflows

### 1. Slug-Based Routing
All major dynamic content (Programs and Blogs) utilizes SEO-friendly URL slugs (e.g., `/programs/metabolic-kickstarter`) rather than raw UUIDs.
* **Routing:** Handled via Next.js dynamic folders (`[slug]`).
* **Database Queries:** The `getBlogPost` and `getProgramBySlug` helpers intelligently query the database using `.eq('slug', slug)` to resolve data seamlessly.

### 2. The Custom Admin Dashboard (`/admin/dashboard`)
The platform includes a deeply integrated CMS accessible only to authenticated admins. It features a tabbed interface managing:
* **Programs Manager:** Create, update, and manage pricing/details for wellness programs.
* **Blogs Manager:** Author rich-text articles using Editor.js. Handles dynamic slug generation and Cloudinary image uploads.
* **Reviews & Video Testimonials:** Upload embedded videos and written client stories that instantly sync to the homepage and `/testimonials` page.
* **Leads (Enquiries & eBooks):** View data submitted through public forms on the site.

*Note: The Dashboard relies on Supabase Session authentication. If you are developing locally, you must log in via the `/login` route first to access the dashboard data.*

---

## 💻 Local Development Guide

### Prerequisites
* Node.js (v18 or higher)
* A Supabase project
* A Cloudinary account

### 1. Environment Variables
Create a `.env.local` file in the root directory and populate it with your specific keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary (For Admin Image/Video Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# (Optional) Local Static API Fallback
API_SECRET_KEY=your_secure_string
```

### 2. Installation & Running

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Database Schema
Ensure your Supabase PostgreSQL instance has the correct tables set up (`programs`, `blogs`, `reviews`, `video_testimonials`, `enquiries`, `ebook_requests`). The primary keys should be `UUID` types defaulting to `gen_random_uuid()`. 

---

## 🛠 Next Developer Notes & Gotchas

* **Routing Caching:** Next.js App Router heavily caches dynamic routes. If you change a folder structure (like renaming `[id]` to `[slug]`), you **must** kill and restart the local `npm run dev` server for Next.js to register the new paths.
* **UUID vs Slug:** Some older APIs or components might still expect an `id`. The database queries have been updated to gracefully handle both (e.g., checking if a string is a UUID format before querying the `id` column to prevent PostgreSQL syntax errors). Always prefer `slug` for frontend URLs.
* **Editor.js SSR Issues:** Editor.js interacts with the DOM heavily. It must be dynamically imported with `ssr: false` in Next.js to prevent hydration mismatch errors. Check `src/components/admin/editor.tsx` for the correct implementation.
