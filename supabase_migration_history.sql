-- Migration: Create smart_tools_history table

CREATE TABLE IF NOT EXISTS smart_tools_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt text,
    markdown_content text,
    html_content text,
    created_at timestamptz DEFAULT now(),
    -- Optional metadata
    title text,
    tags text[]
);

-- Add RLS policies
ALTER TABLE smart_tools_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own history" 
ON smart_tools_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own history" 
ON smart_tools_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own history" 
ON smart_tools_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" 
ON smart_tools_history FOR DELETE 
USING (auth.uid() = user_id);
