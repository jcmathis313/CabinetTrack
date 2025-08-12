-- Add missing columns to organizations table
-- Run this in your Supabase SQL Editor

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE organizations ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to organizations table';
    ELSE
        RAISE NOTICE 'is_active column already exists in organizations table';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to organizations table';
    ELSE
        RAISE NOTICE 'created_at column already exists in organizations table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE organizations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to organizations table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in organizations table';
    END IF;
END $$;

-- Add other potentially missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'domain'
    ) THEN
        ALTER TABLE organizations ADD COLUMN domain VARCHAR(255);
        RAISE NOTICE 'Added domain column to organizations table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'subscription_id'
    ) THEN
        ALTER TABLE organizations ADD COLUMN subscription_id VARCHAR(255);
        RAISE NOTICE 'Added subscription_id column to organizations table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'current_period_start'
    ) THEN
        ALTER TABLE organizations ADD COLUMN current_period_start TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added current_period_start column to organizations table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'current_period_end'
    ) THEN
        ALTER TABLE organizations ADD COLUMN current_period_end TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added current_period_end column to organizations table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'cancel_at_period_end'
    ) THEN
        ALTER TABLE organizations ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added cancel_at_period_end column to organizations table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'trial_end'
    ) THEN
        ALTER TABLE organizations ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added trial_end column to organizations table';
    END IF;
END $$;

-- Verify the table structure after adding columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;
