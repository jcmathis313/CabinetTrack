-- Complete Fix for Organization Creation Issues
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns to organizations table
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE organizations ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to organizations table';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to organizations table';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to organizations table';
    END IF;

    -- Add domain column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'domain'
    ) THEN
        ALTER TABLE organizations ADD COLUMN domain VARCHAR(255);
        RAISE NOTICE 'Added domain column to organizations table';
    END IF;

    -- Add subscription_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'subscription_id'
    ) THEN
        ALTER TABLE organizations ADD COLUMN subscription_id VARCHAR(255);
        RAISE NOTICE 'Added subscription_id column to organizations table';
    END IF;

    -- Add current_period_start column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'current_period_start'
    ) THEN
        ALTER TABLE organizations ADD COLUMN current_period_start TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added current_period_start column to organizations table';
    END IF;

    -- Add current_period_end column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'current_period_end'
    ) THEN
        ALTER TABLE organizations ADD COLUMN current_period_end TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added current_period_end column to organizations table';
    END IF;

    -- Add cancel_at_period_end column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'cancel_at_period_end'
    ) THEN
        ALTER TABLE organizations ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added cancel_at_period_end column to organizations table';
    END IF;

    -- Add trial_end column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'trial_end'
    ) THEN
        ALTER TABLE organizations ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added trial_end column to organizations table';
    END IF;

    -- Add plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'plan'
    ) THEN
        ALTER TABLE organizations ADD COLUMN plan VARCHAR(50) DEFAULT 'free';
        RAISE NOTICE 'Added plan column to organizations table';
    END IF;
END $$;

-- Step 2: Fix RLS Policies
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert users in their organization" ON users;
DROP POLICY IF EXISTS "Users can insert their organization settings" ON organizational_settings;

-- Add permissive policies for signup process
CREATE POLICY "Allow organization creation" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow user creation during signup" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow organizational settings creation" ON organizational_settings
  FOR INSERT WITH CHECK (true);

-- Step 3: Verify the fix
SELECT 'Organizations table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

SELECT 'RLS Policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('organizations', 'users', 'organizational_settings')
ORDER BY tablename, policyname;
