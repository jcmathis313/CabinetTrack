-- Minimal Fix for Organization Creation
-- Run this in your Supabase SQL Editor to add only the essential columns

-- Add essential columns for organization creation
DO $$ 
BEGIN
    -- Add plan column (required for organization creation)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'plan'
    ) THEN
        ALTER TABLE organizations ADD COLUMN plan VARCHAR(50) DEFAULT 'free';
        RAISE NOTICE 'Added plan column to organizations table';
    END IF;

    -- Add is_active column (required for organization creation)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE organizations ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to organizations table';
    END IF;

    -- Add created_at column (required for organization creation)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to organizations table';
    END IF;

    -- Add updated_at column (required for organization creation)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to organizations table';
    END IF;
END $$;

-- Fix RLS Policies for organization creation
DROP POLICY IF EXISTS "Users can insert users in their organization" ON users;
DROP POLICY IF EXISTS "Users can insert their organization settings" ON organizational_settings;

CREATE POLICY "Allow organization creation" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow user creation during signup" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow organizational settings creation" ON organizational_settings
  FOR INSERT WITH CHECK (true);

-- Verify the essential columns exist
SELECT 'Essential columns check:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND column_name IN ('id', 'name', 'slug', 'plan', 'is_active', 'created_at', 'updated_at')
ORDER BY column_name;
