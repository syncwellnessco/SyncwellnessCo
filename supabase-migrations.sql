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
  "order" INTEGER DEFAULT 0,
  
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
  testimonials JSONB,
  quiz JSONB,
  media JSONB,
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
