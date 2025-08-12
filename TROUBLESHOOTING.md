# Organization Creation Troubleshooting Guide

## Issue: Organization Creation Failed

If you're experiencing issues creating a new organization, follow these steps to diagnose and fix the problem.

## Step 1: Check Environment Variables

First, ensure your Supabase environment variables are properly configured:

1. Check that your `.env` file exists in the project root
2. Verify the variables are set correctly:
   ```env
   VITE_SUPABASE_URL=https://oxkdjossstzpiewqncni.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 2: Fix Database Schema and RLS Policies

The most common causes of organization creation failure are:
1. Missing Row Level Security (RLS) policies
2. Missing columns in the organizations table

Run the complete fix script in your Supabase SQL Editor:

-- Copy and paste the contents of complete-fix.sql
-- This script will:
-- 1. Add all missing columns to the organizations table
-- 2. Fix RLS policies for organization creation
-- 3. Verify the changes were applied correctly

## Step 3: Test the Connection

Run the test script to verify everything is working:

1. Open your browser's developer console
2. Copy and paste the contents of `test-signup.js`
3. Press Enter to run the test
4. Check the console output for any errors

## Step 4: Check Database Schema

Ensure your database schema is properly set up:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the contents of `database-schema.sql` to ensure all tables exist
4. Check that the `organizations`, `users`, and `organizational_settings` tables are present

## Step 5: Verify Table Structure

Check that your tables have the correct structure:

```sql
-- Check organizations table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations';

-- Check users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check organizational_settings table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizational_settings';
```

## Step 6: Common Error Messages and Solutions

### "Failed to create organization"
- **Cause**: Missing INSERT policy for organizations table OR missing columns in the organizations table
- **Solution**: Run the complete fix script (`complete-fix.sql`) which addresses both RLS policies and missing columns

### "Could not find the 'is_active' column of 'organizations' in the schema cache"
- **Cause**: The organizations table is missing required columns
- **Solution**: Run the complete fix script (`complete-fix.sql`) to add all missing columns

### "Could not find the 'plan' column of 'organizations' in the schema cache"
- **Cause**: The organizations table is missing the plan column
- **Solution**: Run the minimal fix script (`minimal-fix.sql`) to add essential columns

### "new row violates row-level security policy for table 'organizations'"
- **Cause**: RLS policies are blocking organization creation
- **Solution**: Run the RLS fix script (`fix-rls-only.sql`) or temporarily disable RLS (`disable-rls-temp.sql`)

### "Could not find the 'email_verified' column of 'users' in the schema cache"
- **Cause**: The users table is missing required columns
- **Solution**: Run the complete database fix script (`complete-database-fix.sql`) to add all missing columns

### "Failed to create user"
- **Cause**: Missing INSERT policy for users table
- **Solution**: Run the RLS policy fix above

### "Organization slug already exists"
- **Cause**: The organization slug is already taken
- **Solution**: Choose a different organization slug

### "Invalid API key"
- **Cause**: Incorrect Supabase credentials
- **Solution**: Check your `.env` file and ensure the anon key is correct

### "Table doesn't exist"
- **Cause**: Database schema not properly set up
- **Solution**: Run the database schema SQL in your Supabase dashboard

## Step 7: Debug Mode

To get more detailed error information, check the browser console:

1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. Try to create an organization
4. Look for any error messages in the console

## Step 8: Production Considerations

For production use, consider implementing more restrictive RLS policies:

```sql
-- More restrictive policies for production
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
```

## Step 9: Contact Support

If you're still experiencing issues after following these steps:

1. Check the Supabase dashboard for any service status issues
2. Review the Supabase logs in your project dashboard
3. Ensure your Supabase project is not paused or over quota

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Policy Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema Reference](https://supabase.com/docs/reference/javascript/schema)
