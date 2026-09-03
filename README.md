# 🌿 SyncwellnessCo

> **A luxury, holistic women's wellness and metabolic fat loss platform engineered with Next.js 16, Supabase, Stripe, MailerLite, Calendly, and Cloudflare R2.**

SyncwellnessCo is a full-stack web application designed with a high-end, minimalist editorial aesthetic. It serves as both a high-converting, interactive landing page for wellness programs and a robust custom Content Management System (CMS) for administrative operations.

---

## 🔗 Quick Reference Links
* 📡 **[API Documentation (API.md)](./API.md)** ([file:///home/prashant-singh/code/client/SyncwellnessCo/API.md](file:///home/prashant-singh/code/client/SyncwellnessCo/API.md)): Complete A-to-Z reference guide for all API endpoints, request/response formats, authentication security, webhooks, and backend integration sequence diagrams.
* 🗄️ **[Database Migrations (supabase-migrations.sql)](./supabase-migrations.sql)** ([file:///home/prashant-singh/code/client/SyncwellnessCo/supabase-migrations.sql](file:///home/prashant-singh/code/client/SyncwellnessCo/supabase-migrations.sql)): Production PostgreSQL schema definitions, RLS policies, views, triggers, and indexes.

> [!NOTE]
> For in-depth backend technical specifications, payload schemas, and webhook details, please consult **[API.md](./API.md)**.

---

## 🛠️ Complete Technology Stack & External Services

SyncwellnessCo integrates a modern tech stack and specialized cloud services to deliver seamless e-commerce, content authoring, lead generation, and appointment scheduling.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │              SyncwellnessCo Next.js 16                  │
                    │               (App Router / React 19)                   │
                    └────┬────────────┬─────────────┬────────────┬────────────┘
                         │            │             │            │
                         ▼            ▼             ▼            ▼
                 ┌───────────┐  ┌───────────┐  ┌──────────┐ ┌───────────┐
                 │ Supabase  │  │  Stripe   │  │MailerLite│ │Cloudflare │
                 │ PostgreSQL│  │ Checkout  │  │Automations│ │ R2 Storage│
                 └───────────┘  └───────────┘  └──────────┘ └───────────┘
                                      │             │
                                      ▼             ▼
                                ┌────────────────────────┐
                                │   Calendly Embed &     │
                                │   Webhook Engine       │
                                └────────────────────────┘
```

### 1. Frontend Architecture
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router & React 19)
* **Language:** TypeScript
* **Styling & Design System:** Tailwind CSS v4 (Custom luxury color palette, heavy use of glassmorphism and modern typography)
* **Animations:** Framer Motion (Scroll animations, page transitions, interactive modals)
* **Skeleton Loaders:** Custom Boneyard skeleton loaders to eliminate Cumulative Layout Shift (CLS) during data fetching
* **State & Toast Notifications:** Zustand & `react-hot-toast`
* **Icons:** Lucide React

### 2. Backend & Database Infrastructure
* **Database Engine:** [Supabase](https://supabase.com/) (PostgreSQL with JSONB column support for flexible schemas)
* **Authentication:** Supabase Auth (SSR Cookie Session authentication protecting the Admin Dashboard)
* **Server Infrastructure:** Next.js Route Handlers (`/api/*`) and `@supabase/ssr` server client wrappers
* **API Documentation:** Comprehensive backend and route specification documented in **[API.md](./API.md)**

### 3. Third-Party Integrations & Services
* **Payment Gateway ([Stripe](https://stripe.com/)):** Handles one-time checkout sessions and PaymentIntents for coaching programs. Includes webhook handling (`checkout.session.completed`) and client-side payment verification.
* **Email Marketing & CRM ([MailerLite](https://www.mailerlite.com/)):** Automatically subscribes buyers to program onboarding groups, sends download links for e-books, and dispatches automated coaching agreement emails.
* **Appointment Scheduling ([Calendly](https://calendly.com/)):** Integrated consultation booking widget with webhook synchronization (`invitee.created`, `invitee.canceled`) and signature verification.
* **Object Storage & CDN ([Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)):** S3-compatible, zero egress-fee media storage with presigned direct uploads, CDN edge delivery, and secure asset deletion.
* **Rich Content Authoring ([Tiptap Editor](https://tiptap.dev/)):** Notion-style WYSIWYG editor for blog and program content management.

---

## 📂 Project Structure

```text
SyncwellnessCo/
├── public/                     # Static assets, logos, fallback banners
├── src/
│   ├── app/                    # Next.js App Router Pages & API Routes
│   │   ├── (site)/             # Public client-facing routes
│   │   │   ├── agreement/[token]/ # Public Coaching Agreement acceptance page
│   │   │   ├── programs/[slug]/  # Dynamic program sales page
│   │   │   ├── resources/      # Blogs & E-Books landing pages
│   │   │   ├── testimonials/   # Written & video client stories
│   │   │   └── page.tsx        # Main Homepage
│   │   ├── admin/              # Protected Admin Dashboard & Auth
│   │   │   ├── login/          # Admin Login route
│   │   │   └── dashboard/      # CMS Management Hub
│   │   └── api/                # API Route Handlers (Detailed in API.md)
│   │       ├── admin/          # Admin metrics summary
│   │       ├── agreement/      # Agreement signing endpoint
│   │       ├── blogs/          # Blog CRUD endpoints
│   │       ├── bookings/       # Calendly booking management
│   │       ├── checkout/       # Stripe session & order verification
│   │       ├── ebook-requests/ # Lead capture endpoint
│   │       ├── enquiries/      # Contact form submission endpoint
│   │       ├── media/          # Cloudflare R2 presigned upload & delete endpoints
│   │       ├── payment-intent/ # Stripe PaymentIntent endpoint
│   │       ├── programs/       # Program management endpoints
│   │       ├── purchases/      # Purchase history & resend API
│   │       ├── quiz-responses/ # Assessment engine storage
│   │       ├── reviews/        # Written reviews API
│   │       ├── videos/         # Video testimonials API
│   │       └── webhooks/       # Stripe & Calendly webhook handlers
│   │
│   ├── components/             # Reusable UI & Business Components
│   │   ├── admin/              # CMS Editors, Tables & Modals
│   │   ├── home/               # Hero, Features, Testimonial Marquees
│   │   ├── layout/             # Navbar, Footer, Mobile Drawer
│   │   ├── pages/              # Program & Blog Content wrappers
│   │   ├── resources/          # Resource card carousels & filters
│   │   ├── ui/                 # Primitive components (Buttons, Inputs, Skeletons)
│   │   └── wellness-quiz.tsx   # Metabolic Quiz Assessment Component
│   │
│   ├── lib/                    # Helper Utilities & Service SDK Wrappers
│   │   ├── api-auth.ts         # Bearer token verification helper
│   │   ├── blogs.ts            # Blog data fetching logic
│   │   ├── content-store.ts    # Fallback content store
│   │   ├── media-utils.ts      # Client media upload and URL helpers
│   │   ├── order-fulfillment.ts# Idempotent Stripe order processor
│   │   ├── programs.ts         # Program queries & data mappers
│   │   ├── r2.ts               # Cloudflare R2 S3 SDK integration & presigning
│   │   ├── stripe.ts           # Stripe SDK initialization
│   │   ├── supabase-client.ts  # Browser Supabase client
│   │   └── supabase-server.ts  # Server SSR Supabase client
│   │
│   └── types/                  # TypeScript Data Models
│       ├── blog.ts
│       ├── program.ts
│       └── quiz.ts
│
├── API.md                      # Complete A-to-Z API Documentation
├── AGENTS.md                   # Custom project & agent rules
├── package.json                # Dependencies & scripts
└── supabase-migrations.sql    # PostgreSQL schema definition
```

---

## 🎨 Luxury Editorial Design System

SyncwellnessCo is crafted with an intentional **Luxury Editorial** aesthetic. When extending the design system, adhere strictly to these principles:

1. **Color Palette:**
   * **Charcoal (`#1A1A1A` / `bg-neutral-900`):** High-contrast background for dark mode components and primary headlines.
   * **Warm Cream / Beige (`#FAF8F5`, `#EBE3DB`):** Inviting primary background tones.
   * **Muted Gold Accents (`#8C6D40`, `#D4AF37`):** CTA buttons, badges, highlights, and active states.
2. **Glassmorphism:** Use `bg-white/20` or `bg-black/40` with `backdrop-blur-md` and light border overlays (`border-white/10`) for video player overlays, sticky headers, and floating badges.
3. **Typography:** Elegant serif pairings for section headers paired with clean sans-serif body copy.
4. **Layout Shift Prevention:** Every asynchronous data section uses Boneyard skeleton loaders matching exact element dimensions to prevent jarring page layout jumps.

---

## ⚡ Core Business Workflows

### 1. Stripe Checkout & Order Fulfillment
1. User clicks "Enroll Now" on a program page.
2. `POST /api/checkout` initiates a Stripe Checkout Session with custom metadata (`programId`, `email`, `name`, `phone`).
3. Upon successful payment, Stripe redirects to `/success?session_id=...`.
4. `POST /api/checkout/verify` triggers `fulfillOrder()` in [`src/lib/order-fulfillment.ts`](file:///home/prashant-singh/code/client/SyncwellnessCo/src/lib/order-fulfillment.ts):
   * Validates payment status idempotently.
   * Generates a 64-character hex `agreementToken`.
   * Creates a purchase record in Supabase `purchases` table.
   * Syncs buyer details to MailerLite and assigns them to the onboarding group.
   * MailerLite sends an email with the link to `/agreement/<token>`.
5. Stripe Webhook (`POST /api/webhooks/stripe`) acts as an asynchronous fallback fulfillment mechanism.

### 2. Digital Coaching Agreement Signing
1. Customer receives email link containing `/agreement/<token>`.
2. Page displays agreement terms and client details.
3. Customer clicks "I Agree & Sign".
4. `PATCH /api/agreement/[token]` updates `agreementStatus` to `"Accepted"`, recording timestamp, IP address, and browser User-Agent.

### 3. Consultation Booking (Calendly)
1. Customer schedules a consultation call via embedded Calendly widget.
2. Calendly Webhook (`POST /api/webhooks/calendly`) receives `invitee.created`.
3. Validates HMAC SHA-256 signature header `Calendly-Webhook-Signature`.
4. Queries Calendly API for event details and inserts booking into `calendly_bookings` table.
5. If canceled, `invitee.canceled` event removes booking from database.

### 4. E-Book Lead Funnel
1. User submits name and email on an e-book modal.
2. `POST /api/ebook-requests` validates and logs the request to `ebook_requests` table.
3. Adds lead to MailerLite group, which fires an automated workflow delivering the PDF download link directly to their inbox.

---

## 🖥️ Custom Admin Dashboard (`/admin/dashboard`)

The Admin Dashboard provides full operational control over the platform:

* **Summary Tab:** Displays total revenue, pending enquiries, ebook requests, active programs, and recent transaction history.
* **Programs Manager:** Add, edit, or archive programs, configure pricing plans, FAQs, hero images, and feature ranks.
* **Blogs Manager:** Author and edit blog posts using the Tiptap rich-text editor with direct Cloudflare R2 media uploads.
* **Reviews & Video Testimonials:** Manage written client reviews and upload video URLs for home and testimonial page carousels.
* **Leads & Enquiries:** Review user submissions, mark contact enquiries as read/replied, and manage e-book requests.
* **Purchases & Agreements:** View transaction history and trigger manual resend of Coaching Agreement signing links via MailerLite.

*Note: Access requires logging in via `/admin/login` with an account having `user_metadata.role = 'admin'` in Supabase Auth.*

---

## ⚙️ Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudflare R2 Configuration (Server-Side)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name

# Cloudflare R2 Public Media URL (CDN / Custom Domain or Public Bucket URL)
R2_PUBLIC_URL=https://media.syncwellness.co
NEXT_PUBLIC_R2_PUBLIC_URL=https://media.syncwellness.co

# MailerLite Email Automation
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_EBOOK=your_ebook_group_id
MAILERLITE_GROUP_PROGRAM_ENROLLMENT=your_program_enrollment_group_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Calendly Configuration
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-org/consultation
CALENDLY_API_KEY=your_calendly_personal_access_token
CALENDLY_WEBHOOK_SIGNING_KEY=your_calendly_webhook_signing_key

# Internal Service API Auth
CONTENT_API_SECRET=your_secure_api_secret_key
```

---

## 💻 Local Development Setup

### 1. Prerequisites
* Node.js v18.0.0 or higher
* npm or yarn
* Supabase project with initial schema applied from [`supabase-migrations.sql`](./supabase-migrations.sql)

### 2. Installation & Running

```bash
# 1. Clone repository & navigate to root
cd SyncwellnessCo

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# (Fill in your Supabase, Stripe, MailerLite, Calendly, and Cloudflare R2 keys)

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Linting

```bash
# Run ESLint checks
npm run lint

# Build production bundle
npm run build

# Start production server locally
npm run start
```

---

## 📝 Developer Notes & Production Gotchas

1. **Next.js App Router Route Caching:** Route handlers and server pages heavily cache data. Modifications to database entries automatically call `revalidatePath()` to clear stale cache.
2. **Hydration Warning with Rich-Text Editors:** Tiptap / Editor.js components interact directly with the DOM and should be imported dynamically with `ssr: false` on client components.
3. **Supabase SSR Auth Cookie Handling:** Ensure `@supabase/ssr` middleware refreshes auth sessions smoothly to avoid unexpected session dropouts on the Admin Dashboard.
4. **Idempotent Order Fulfillment:** Order fulfillment safe-guards against duplicate purchases by verifying `stripe_session_id` uniqueness before executing database insertions or MailerLite triggers.
5. **Backend API Reference:** Refer to **[API.md](./API.md)** ([file:///home/prashant-singh/code/client/SyncwellnessCo/API.md](file:///home/prashant-singh/code/client/SyncwellnessCo/API.md)) for complete API request/response specifications and webhook verification details.

---
*For detailed API route endpoints, payloads, and response interfaces, refer to [API.md](./API.md).*
