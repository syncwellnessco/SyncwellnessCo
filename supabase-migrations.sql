-- SQL Migration Schema for SyncwellnessCo Supabase Database
-- Matching exact schema architecture with created_at / updated_at timestamp standardization

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROGRAMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  shortdescription TEXT,
  description TEXT,
  duration TEXT,
  format TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  pricing JSONB,
  hero JSONB,
  audience JSONB,
  problemssolved JSONB,
  outcomes JSONB,
  included JSONB,
  bonuses JSONB,
  structure JSONB,
  methodology JSONB,
  faqs JSONB,
  enrollment JSONB,
  quiz JSONB,
  seo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  showonhome BOOLEAN DEFAULT TRUE,
  featured_rank INTEGER
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Programs are viewable by everyone" ON programs;
CREATE POLICY "Programs are viewable by everyone" ON programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for authenticated/service role" ON programs;
CREATE POLICY "Allow all for authenticated/service role" ON programs FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_showonhome ON programs(showonhome);

-- -----------------------------------------------------------------------------
-- 2. PURCHASES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  program_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'AUD',
  status TEXT DEFAULT 'completed',
  stripe_session_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Coaching Agreement Fields
  "agreementToken" TEXT UNIQUE,
  "agreementStatus" TEXT DEFAULT 'Pending' CHECK ("agreementStatus" IN ('Pending', 'Accepted')),
  "agreementAcceptedAt" TIMESTAMP WITH TIME ZONE,
  "agreementIp" TEXT,
  "agreementUserAgent" TEXT,
  "agreementVersion" INTEGER DEFAULT 1
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for purchase owner" ON purchases;
CREATE POLICY "Enable read access for purchase owner" ON purchases FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for all users on purchases" ON purchases;
CREATE POLICY "Enable insert for all users on purchases" ON purchases FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for all users on purchases" ON purchases;
CREATE POLICY "Enable update for all users on purchases" ON purchases FOR UPDATE USING (true);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_agreement_token ON purchases("agreementToken");

-- -----------------------------------------------------------------------------
-- 3. CONTACT ENQUIRIES TABLE & VIEW
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for all users on contact_enquiries" ON contact_enquiries;
CREATE POLICY "Enable insert for all users on contact_enquiries" ON contact_enquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable read access for contact_enquiries" ON contact_enquiries;
CREATE POLICY "Enable read access for contact_enquiries" ON contact_enquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable update for contact_enquiries" ON contact_enquiries;
CREATE POLICY "Enable update for contact_enquiries" ON contact_enquiries FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for contact_enquiries" ON contact_enquiries;
CREATE POLICY "Enable delete for contact_enquiries" ON contact_enquiries FOR DELETE USING (true);

CREATE OR REPLACE VIEW enquiries AS SELECT * FROM contact_enquiries;

-- -----------------------------------------------------------------------------
-- 4. EBOOK REQUESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ebook_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ebookname TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  phone_number TEXT,
  country_code TEXT
);

ALTER TABLE ebook_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for all users on ebook_requests" ON ebook_requests;
CREATE POLICY "Enable insert for all users on ebook_requests" ON ebook_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable read access for ebook_requests" ON ebook_requests;
CREATE POLICY "Enable read access for ebook_requests" ON ebook_requests FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- 5. QUIZ RESPONSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  country_code TEXT,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  classification TEXT NOT NULL,
  program_id TEXT,
  program_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for all users on quiz_responses" ON quiz_responses;
CREATE POLICY "Enable insert for all users on quiz_responses" ON quiz_responses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable read access for quiz_responses" ON quiz_responses;
CREATE POLICY "Enable read access for quiz_responses" ON quiz_responses FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- 6. CALENDLY BOOKINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendly_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitee_uri TEXT UNIQUE NOT NULL,
  event_uri TEXT,
  event_name TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  timezone TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  join_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE calendly_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for everyone on calendly_bookings" ON calendly_bookings;
CREATE POLICY "Enable insert for everyone on calendly_bookings" ON calendly_bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable select for everyone on calendly_bookings" ON calendly_bookings;
CREATE POLICY "Enable select for everyone on calendly_bookings" ON calendly_bookings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable update for everyone on calendly_bookings" ON calendly_bookings;
CREATE POLICY "Enable update for everyone on calendly_bookings" ON calendly_bookings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for everyone on calendly_bookings" ON calendly_bookings;
CREATE POLICY "Enable delete for everyone on calendly_bookings" ON calendly_bookings FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 7. REVIEWS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id TEXT,
  name TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  before_image TEXT,
  after_image TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  rating INTEGER DEFAULT 5,
  featured_on_home BOOLEAN DEFAULT FALSE
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for reviews" ON reviews;
CREATE POLICY "Enable insert for reviews" ON reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for reviews" ON reviews;
CREATE POLICY "Enable update for reviews" ON reviews FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for reviews" ON reviews;
CREATE POLICY "Enable delete for reviews" ON reviews FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 8. VIDEO TESTIMONIALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL,
  caption TEXT,
  name TEXT,
  program_id TEXT,
  featured_on_home BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE video_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Video testimonials viewable by everyone" ON video_testimonials;
CREATE POLICY "Video testimonials viewable by everyone" ON video_testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for video_testimonials" ON video_testimonials;
CREATE POLICY "Enable insert for video_testimonials" ON video_testimonials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for video_testimonials" ON video_testimonials;
CREATE POLICY "Enable update for video_testimonials" ON video_testimonials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for video_testimonials" ON video_testimonials;
CREATE POLICY "Enable delete for video_testimonials" ON video_testimonials FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- 9. BLOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT DEFAULT 'Neha Arora',
  category TEXT DEFAULT 'Health & Nutrition',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  tags TEXT
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Blogs viewable by everyone" ON blogs;
CREATE POLICY "Blogs viewable by everyone" ON blogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for blogs" ON blogs;
CREATE POLICY "Enable insert for blogs" ON blogs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for blogs" ON blogs;
CREATE POLICY "Enable update for blogs" ON blogs FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for blogs" ON blogs;
CREATE POLICY "Enable delete for blogs" ON blogs FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
