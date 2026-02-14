-- Migration: Add status and metadata columns to knowledge_base
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'indexed',
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS slice_count integer DEFAULT 1;

-- Update existing rows (Optional, safe defaults)
UPDATE knowledge_base SET status = 'indexed' WHERE status IS NULL;
UPDATE knowledge_base SET source_type = 'text' WHERE source_type IS NULL;
UPDATE knowledge_base SET slice_count = 1 WHERE slice_count IS NULL;
