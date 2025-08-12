-- Temporarily Disable RLS for Testing
-- Run this in your Supabase SQL Editor to temporarily disable RLS

-- Disable RLS on organizations table
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on organizational_settings table
ALTER TABLE organizational_settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 'RLS status after disabling:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('organizations', 'users', 'organizational_settings')
ORDER BY tablename;

-- Note: This is for testing only. For production, you should re-enable RLS with proper policies:
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organizational_settings ENABLE ROW LEVEL SECURITY;
