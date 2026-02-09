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
