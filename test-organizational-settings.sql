-- Test Organizational Settings
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT 'Checking organizational_settings table:' as info;
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizational_settings' 
ORDER BY ordinal_position;

-- Check current data
SELECT 'Current organizational settings:' as info;
SELECT * FROM organizational_settings;

-- Test inserting a simple record
SELECT 'Testing insert...' as info;
INSERT INTO organizational_settings (organization_id, company_name, company_address, company_phone)
SELECT id, 'Test Company', 'Test Address', 'Test Phone'
FROM organizations 
LIMIT 1
ON CONFLICT (organization_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_address = EXCLUDED.company_address,
  company_phone = EXCLUDED.company_phone,
  updated_at = NOW();

-- Check if insert worked
SELECT 'After test insert:' as info;
SELECT * FROM organizational_settings;

-- Test updating with a small logo URL
SELECT 'Testing logo URL update...' as info;
UPDATE organizational_settings 
SET logo_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
WHERE organization_id = (SELECT id FROM organizations LIMIT 1);

-- Check final result
SELECT 'Final result:' as info;
SELECT organization_id, company_name, company_phone, logo_url IS NOT NULL as has_logo, LENGTH(logo_url) as logo_length
FROM organizational_settings;
