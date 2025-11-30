-- Migration: Add base64_data column to media_files table
-- Run this in your Supabase SQL Editor if the column doesn't exist

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'media_files' 
        AND column_name = 'base64_data'
    ) THEN
        ALTER TABLE media_files 
        ADD COLUMN base64_data TEXT NOT NULL DEFAULT '';
        
        -- Update existing rows (if any) - you may want to handle this differently
        UPDATE media_files 
        SET base64_data = '' 
        WHERE base64_data IS NULL;
        
        RAISE NOTICE 'Column base64_data added successfully';
    ELSE
        RAISE NOTICE 'Column base64_data already exists';
    END IF;
END $$;

