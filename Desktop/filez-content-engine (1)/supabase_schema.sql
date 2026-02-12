-- Create table for storing prompt options
CREATE TABLE prompt_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL, -- 'roles', 'industries', etc.
  option_id TEXT NOT NULL, -- The string ID used in code (e.g., 'content_expert')
  name TEXT NOT NULL,
  description TEXT,
  extra_data JSONB DEFAULT '{}'::jsonb, -- Store dynamic fields like 'painPoints', 'features', 'css', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, option_id)
);

-- Create table for storing generated prompt history
CREATE TABLE generated_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_content TEXT NOT NULL,
  settings JSONB NOT NULL, -- Store the selections used to generate this prompt
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Enable for public access for this demo (or restrict as needed)
ALTER TABLE prompt_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to configurations
CREATE POLICY "Public profiles are viewable by everyone" ON prompt_configurations FOR SELECT USING (true);
CREATE POLICY "Public can insert configurations" ON prompt_configurations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update configurations" ON prompt_configurations FOR UPDATE USING (true);
CREATE POLICY "Public can delete configurations" ON prompt_configurations FOR DELETE USING (true);

-- Allow public read/write access to history
CREATE POLICY "Public history view" ON generated_prompts FOR SELECT USING (true);
CREATE POLICY "Public history insert" ON generated_prompts FOR INSERT WITH CHECK (true);

-- Initial Data Seeding (Truncated for brevity, but you should run a script to populate this based on initialData.ts if needed)
-- Example:
-- ('roles', 'content_expert', 'B2B 内容集客专家', '擅长挑战者销售法则，重构客户认知', '{}'),
-- ('industries', 'biopharma', '生物制药', NULL, '{"painPoints": "FDA 21 CFR Part 11 合规，配方数据防泄露"}');

-- Create table for materials (images, documents, links)
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'document', 'link')),
  name TEXT NOT NULL,
  url TEXT NOT NULL, -- Storage path or external URL
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for materials
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Allow public access to materials table
CREATE POLICY "Public materials view" ON materials FOR SELECT USING (true);
CREATE POLICY "Public materials insert" ON materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public materials update" ON materials FOR UPDATE USING (true);
CREATE POLICY "Public materials delete" ON materials FOR DELETE USING (true);

-- Storage configuration
-- Attempt to create the 'materials' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'materials' bucket
-- Note: You might need to adjust these policies based on your specific security requirements
CREATE POLICY "Public materials storage view" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Public materials storage insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials');
CREATE POLICY "Public materials storage update" ON storage.objects FOR UPDATE USING (bucket_id = 'materials');
CREATE POLICY "Public materials storage delete" ON storage.objects FOR DELETE USING (bucket_id = 'materials');

-- Create table for storing user custom templates
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Stores the full state of the builder
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for templates
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Allow public access (for demo simplicity, or adjust as needed)
CREATE POLICY "Public templates view" ON prompt_templates FOR SELECT USING (true);
CREATE POLICY "Public templates insert" ON prompt_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public templates update" ON prompt_templates FOR UPDATE USING (true);
CREATE POLICY "Public templates delete" ON prompt_templates FOR DELETE USING (true);

-- Create table for RAG Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  ref_mode TEXT DEFAULT 'smart' CHECK (ref_mode IN ('smart', 'strict')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for knowledge_base
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow public access for knowledge_base (adjust as needed)
CREATE POLICY "Public knowledge view" ON knowledge_base FOR SELECT USING (true);
CREATE POLICY "Public knowledge insert" ON knowledge_base FOR INSERT WITH CHECK (true);
CREATE POLICY "Public knowledge update" ON knowledge_base FOR UPDATE USING (true);
CREATE POLICY "Public knowledge delete" ON knowledge_base FOR DELETE USING (true);


-- Create profiles table to store user roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RPC Function to allow Admin to create users (Bypassing client-side restriction)
-- NOTE: This requires pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION create_user_by_admin(
  email TEXT,
  password TEXT,
  user_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Run as database owner
AS $$
DECLARE
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- 2. Generate ID and Hash Password
  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(password, gen_salt('bf'));

  -- 3. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    email,
    encrypted_pw,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', user_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 4. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', email),
    'email',
    now(),
    now(),
    now()
  );
  
  RETURN new_user_id;
END;
$$;
