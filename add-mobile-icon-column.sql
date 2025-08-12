-- Add mobile_icon_url column to organizational_settings table
-- This migration adds support for mobile icons in organizational settings

-- Check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'organizational_settings' 
        AND column_name = 'mobile_icon_url'
    ) THEN
        -- Add the mobile_icon_url column
        ALTER TABLE organizational_settings 
        ADD COLUMN mobile_icon_url TEXT;
        
        RAISE NOTICE 'Added mobile_icon_url column to organizational_settings table';
    ELSE
        RAISE NOTICE 'mobile_icon_url column already exists in organizational_settings table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizational_settings' 
AND column_name = 'mobile_icon_url';
