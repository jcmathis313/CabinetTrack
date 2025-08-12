-- Quick Check: Current Organizations Table Structure
-- Run this in your Supabase SQL Editor to see what columns exist

SELECT 'Current organizations table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check for specific missing columns
SELECT 'Missing columns check:' as info;
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'plan'
    ) THEN '✓ plan column EXISTS' ELSE '❌ plan column MISSING' END as plan_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'is_active'
    ) THEN '✓ is_active column EXISTS' ELSE '❌ is_active column MISSING' END as is_active_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'created_at'
    ) THEN '✓ created_at column EXISTS' ELSE '❌ created_at column MISSING' END as created_at_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'updated_at'
    ) THEN '✓ updated_at column EXISTS' ELSE '❌ updated_at column MISSING' END as updated_at_status;
