-- Fix Organizational Settings Table (Simple Version)
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT 'Checking if organizational_settings table exists:' as info;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'organizational_settings'
) as table_exists;

-- Drop table if it exists and recreate it
DROP TABLE IF EXISTS organizational_settings CASCADE;

-- Create the table
CREATE TABLE organizational_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL DEFAULT '',
    company_address TEXT NOT NULL DEFAULT '',
    company_phone VARCHAR(50) NOT NULL DEFAULT '',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Create index
CREATE INDEX idx_organizational_settings_organization_id ON organizational_settings(organization_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizational_settings_updated_at 
  BEFORE UPDATE ON organizational_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS
ALTER TABLE organizational_settings DISABLE ROW LEVEL SECURITY;

-- Check table structure
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizational_settings' 
ORDER BY ordinal_position;

-- Check if any organizations exist
SELECT 'Organizations:' as info;
SELECT id, name, slug FROM organizations;

-- Create default settings for each organization
INSERT INTO organizational_settings (organization_id, company_name, company_address, company_phone)
SELECT o.id, o.name, 'Your Company Address', 'Your Company Phone'
FROM organizations o;

-- Show final result
SELECT 'Final organizational settings:' as info;
SELECT os.organization_id, os.company_name, os.company_phone, os.logo_url IS NOT NULL as has_logo
FROM organizational_settings os
ORDER BY os.created_at;
