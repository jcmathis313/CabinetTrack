-- Fix Organization Plan
-- Run this in your Supabase SQL Editor

-- First, let's see what organizations exist
SELECT 'Current organizations:' as info;
SELECT id, name, plan, is_active FROM organizations;

-- Update all organizations to have the 'free' plan if they don't have one
UPDATE organizations 
SET plan = 'free' 
WHERE plan IS NULL OR plan = '';

-- Verify the update
SELECT 'Organizations after update:' as info;
SELECT id, name, plan, is_active FROM organizations;

-- Also make sure the plan column exists
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';
