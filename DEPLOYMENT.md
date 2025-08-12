# Deployment Guide for Work Order Management App

This guide will walk you through deploying your React + Vite + Supabase application to production.

## Prerequisites

1. **Supabase Project**: Ensure your Supabase project is set up and running
2. **Domain Name**: Have your domain name ready
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Environment Variables

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key
4. Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app

### Step 3: Connect Custom Domain

1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your domain name
3. Follow Vercel's DNS configuration instructions
4. Update your domain's DNS records as instructed

## Option 2: Deploy to Netlify

### Step 1: Build Your Project

```bash
npm run build
```

### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag and drop your `dist` folder to deploy
4. Or connect your Git repository for automatic deployments

### Step 3: Configure Environment Variables

1. In your Netlify dashboard, go to "Site settings" > "Environment variables"
2. Add your Supabase environment variables

### Step 4: Connect Custom Domain

1. Go to "Domain settings"
2. Add your custom domain
3. Configure DNS as instructed

## Option 3: Deploy to Railway

### Step 1: Prepare for Railway

1. Create a `railway.toml` file:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run preview"
healthcheckPath = "/"
healthcheckTimeout = 300
```

### Step 2: Deploy

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

## Option 4: Deploy to DigitalOcean App Platform

### Step 1: Create App Spec

Create a `.do/app.yaml` file:

```yaml
name: work-order-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  build_command: npm run build
  run_command: npm run preview
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_SUPABASE_URL
    value: ${VITE_SUPABASE_URL}
  - key: VITE_SUPABASE_ANON_KEY
    value: ${VITE_SUPABASE_ANON_KEY}
```

### Step 2: Deploy

1. Go to DigitalOcean App Platform
2. Create new app from your repository
3. Configure environment variables
4. Deploy

## Post-Deployment Checklist

### 1. Test Your Application
- [ ] Verify all features work in production
- [ ] Test user registration/login
- [ ] Test order creation and management
- [ ] Test file uploads (if any)
- [ ] Test on mobile devices

### 2. Configure Supabase for Production

1. **Update Supabase Settings**:
   - Go to your Supabase dashboard
   - Navigate to Settings > API
   - Add your production domain to "Additional Redirect URLs"
   - Update "Site URL" to your production domain

2. **Configure RLS Policies**:
   - Ensure Row Level Security is properly configured
   - Test all user roles and permissions

### 3. Set Up Monitoring

1. **Error Tracking**: Consider adding Sentry or similar
2. **Analytics**: Add Google Analytics or Plausible
3. **Uptime Monitoring**: Set up UptimeRobot or similar

### 4. SSL/HTTPS

Most platforms (Vercel, Netlify, Railway) provide SSL automatically. Ensure your domain has HTTPS enabled.

### 5. Performance Optimization

1. **Enable Compression**: Most platforms do this automatically
2. **CDN**: Vercel and Netlify provide global CDN
3. **Caching**: Configure appropriate cache headers

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_`
   - Rebuild after adding new variables
   - Check platform-specific variable configuration

2. **Routing Issues**:
   - Ensure your hosting platform supports SPA routing
   - Check the `vercel.json` or similar configuration

3. **Supabase Connection Issues**:
   - Verify your Supabase URL and keys
   - Check CORS settings in Supabase
   - Ensure your domain is in allowed origins

4. **Build Failures**:
   - Check your build logs
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

## Cost Considerations

- **Vercel**: Free tier available, $20/month for Pro
- **Netlify**: Free tier available, $19/month for Pro
- **Railway**: $5/month minimum
- **DigitalOcean**: $5/month minimum

## Next Steps

1. **Set up CI/CD**: Configure automatic deployments on Git push
2. **Add monitoring**: Implement error tracking and analytics
3. **Backup strategy**: Set up database backups
4. **Scaling plan**: Plan for growth and performance optimization

## Support

If you encounter issues during deployment:
1. Check the platform's documentation
2. Review build logs for errors
3. Verify environment variables are correctly set
4. Test locally with production environment variables
