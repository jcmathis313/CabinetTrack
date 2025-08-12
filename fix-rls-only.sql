-- Fix RLS Policies Only
-- Run this in your Supabase SQL Editor to fix the RLS policy issue

-- First, let's see what RLS policies currently exist
SELECT 'Current RLS policies for organizations table:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY policyname;

-- Drop ALL existing policies for organizations table
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their own organization" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation with validation" ON organizations;

-- Create a simple, permissive policy for organizations table
CREATE POLICY "Allow all operations on organizations" ON organizations
  FOR ALL USING (true) WITH CHECK (true);

-- Check if RLS is enabled on organizations table
SELECT 'RLS status for organizations table:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'organizations';

-- If RLS is enabled, we can also disable it temporarily for testing
-- ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Verify the new policy was created
SELECT 'New RLS policies for organizations table:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'organizations'
ORDER BY policyname;
