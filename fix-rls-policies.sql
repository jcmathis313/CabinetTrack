-- Fix RLS Policies for Organization Creation
-- Run this in your Supabase SQL Editor

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

-- Alternative: More restrictive policies for production (uncomment when ready)
/*
CREATE POLICY "Allow organization creation with validation" ON organizations
  FOR INSERT WITH CHECK (
    name IS NOT NULL AND 
    slug IS NOT NULL AND 
    slug ~ '^[a-z0-9-]+$' AND
    length(name) > 0 AND
    length(slug) > 0
  );

CREATE POLICY "Allow user creation with validation" ON users
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND
    username IS NOT NULL AND
    password_hash IS NOT NULL AND
    first_name IS NOT NULL AND
    last_name IS NOT NULL AND
    organization_id IS NOT NULL
  );

CREATE POLICY "Allow organizational settings creation with validation" ON organizational_settings
  FOR INSERT WITH CHECK (
    organization_id IS NOT NULL
  );
*/
