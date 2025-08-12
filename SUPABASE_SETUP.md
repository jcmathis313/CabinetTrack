# CabinetTrack Supabase Setup Guide

This guide will walk you through setting up Supabase as your backend database for CabinetTrack.

## Prerequisites

1. **Node.js installed** (version 16 or higher)
2. **Git** for version control
3. **A Supabase account** (free at [supabase.com](https://supabase.com))

## Step 1: Install Dependencies

Once you have Node.js installed, run:

```bash
npm install @supabase/supabase-js
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `cabinet-track` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-schema.sql` from this project
3. Paste it into the SQL editor and click "Run"
4. This will create all the necessary tables and relationships

## Step 5: Configure Row Level Security (RLS)

For production use, you should enable Row Level Security. In the SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (example for orders table)
CREATE POLICY "Allow all operations for authenticated users" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Repeat for other tables as needed
```

## Step 6: Test the Connection

1. Start your development server: `npm run dev`
2. Check the browser console for any Supabase connection errors
3. If successful, you should see no errors

## Step 7: Migrate Existing Data (Optional)

If you have existing data in localStorage:

1. The app will automatically use Supabase once configured
2. You can use the `MigrationService` to move data from localStorage to Supabase
3. After successful migration, you can clear localStorage

## Step 8: Deploy to Production

When deploying:

1. Set the environment variables in your hosting platform
2. Ensure your Supabase project is in the correct region
3. Consider enabling authentication if you need user management

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that your `.env` file exists and has the correct values
   - Ensure the file is in the project root

2. **"Invalid API key"**
   - Verify you're using the `anon` key, not the `service_role` key
   - Check that the key is copied correctly

3. **"Table doesn't exist"**
   - Run the database schema SQL in your Supabase SQL Editor
   - Check that all tables were created successfully

4. **CORS errors**
   - In Supabase dashboard, go to **Settings** → **API**
   - Add your domain to the "Additional Allowed Origins" list

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Security Considerations

1. **Never expose your service_role key** in client-side code
2. **Use RLS policies** to control data access
3. **Validate all inputs** before sending to the database
4. **Consider implementing authentication** for multi-user scenarios

## Performance Tips

1. **Use indexes** (already included in the schema)
2. **Implement pagination** for large datasets
3. **Use select()** to limit returned columns when possible
4. **Consider caching** frequently accessed data

## Next Steps

After setup, you can:

1. **Add authentication** using Supabase Auth
2. **Implement real-time subscriptions** for live updates
3. **Add file storage** for logos and attachments
4. **Set up automated backups** and monitoring
