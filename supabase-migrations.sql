-- SQL Migration for SyncwellnessCo Supabase

-- 1. Create Programs Table
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  shortDescription TEXT,
  description TEXT,
  duration TEXT,
  format TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  featured_rank INTEGER,
  
  -- Use JSONB for nested schema structures
  pricing JSONB,
  hero JSONB,
  audience JSONB,
  problemsSolved JSONB,
  outcomes JSONB,
  included JSONB,
  bonuses JSONB,
  structure JSONB,
  methodology JSONB,
  faqs JSONB,
  enrollment JSONB,
  quiz JSONB,
  seo JSONB,

  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Contact Enquiries Table
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Ebook Requests Table
CREATE TABLE IF NOT EXISTS ebook_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ebookName TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) setup - Optional based on your usage
-- Allow read access to published programs for everyone
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are viewable by everyone" ON programs
  FOR SELECT USING (status = 'published');

-- You can add further policies to allow admin insert/update if using Auth,
-- but typically if using Service Role Key on the Next.js backend, RLS is bypassed.

-- 4. Create Quiz Responses Table
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
  createdat TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) setup for quiz responses
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit/insert quiz responses
CREATE POLICY "Enable insert for all users" ON quiz_responses
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view quiz responses (for admin panel)
CREATE POLICY "Enable read access for authenticated users" ON quiz_responses
  FOR SELECT TO authenticated USING (true);

-- 5. Create Calendly Bookings Table
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

-- Allow insert/select/update/delete for everyone (or bypass using Service Role Key in Next.js backend)
CREATE POLICY "Enable insert for everyone" ON calendly_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for everyone" ON calendly_bookings FOR SELECT USING (true);
CREATE POLICY "Enable update for everyone" ON calendly_bookings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for everyone" ON calendly_bookings FOR DELETE USING (true);

-- 6. Add Coaching Agreement Fields to Purchases Table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "agreementToken" TEXT UNIQUE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "agreementStatus" TEXT DEFAULT 'Pending' CHECK ("agreementStatus" IN ('Pending', 'Accepted'));
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "agreementAcceptedAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "agreementIp" TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "agreementUserAgent" TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS "agreementVersion" INTEGER DEFAULT 1;
