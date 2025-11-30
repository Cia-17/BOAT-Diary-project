-- Quick fix: Add base64_data column to media_files table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS base64_data TEXT;

-- If you have existing rows without base64_data, you may need to:
-- UPDATE media_files SET base64_data = '' WHERE base64_data IS NULL;

-- Make it NOT NULL if needed (only after ensuring all rows have values)
-- ALTER TABLE media_files ALTER COLUMN base64_data SET NOT NULL;

