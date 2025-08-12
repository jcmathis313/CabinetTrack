-- Fix Organizational Settings Table
-- Run this in your Supabase SQL Editor

-- Create organizational_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizational_settings (
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
CREATE INDEX IF NOT EXISTS idx_organizational_settings_organization_id ON organizational_settings(organization_id);

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

-- Disable RLS temporarily
ALTER TABLE organizational_settings DISABLE ROW LEVEL SECURITY;

-- Check if any organizations don't have settings
SELECT 'Organizations without settings:' as info;
SELECT o.id, o.name, o.slug 
FROM organizations o 
LEFT JOIN organizational_settings os ON o.id = os.organization_id 
WHERE os.organization_id IS NULL;

-- Create default settings for organizations that don't have them
INSERT INTO organizational_settings (organization_id, company_name, company_address, company_phone)
SELECT o.id, o.name, 'Your Company Address', 'Your Company Phone'
FROM organizations o 
LEFT JOIN organizational_settings os ON o.id = os.organization_id 
WHERE os.organization_id IS NULL
ON CONFLICT (organization_id) DO NOTHING;

-- Verify the settings
SELECT 'Organizational settings:' as info;
SELECT os.organization_id, os.company_name, os.company_phone, os.logo_url IS NOT NULL as has_logo
FROM organizational_settings os
ORDER BY os.created_at;
