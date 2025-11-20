# Deployment Guide

This guide explains how to deploy Quantum Quest to Netlify as a unified monorepo application.

## Overview

The application is deployed as a monorepo on Netlify with:
- **Frontend**: React app built with Vite
- **Backend**: Python Flask API running as Netlify Functions
- **Single deployment**: Everything deploys together

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. A [Supabase project](https://supabase.com/) with the database schema set up
3. Google OAuth credentials (if using Google sign-in)

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the `QPlay-Core` repository
5. Configure build settings:
   - **Branch to deploy**: `main` (or your preferred branch)
   - **Build command**: `npm run build` (should be auto-detected from netlify.toml)
   - **Publish directory**: `dist` (should be auto-detected)
   - **Functions directory**: `netlify/functions` (should be auto-detected)

### 2. Configure Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

#### Required Variables

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### How to Get These Values

**Supabase credentials:**
1. Go to your [Supabase project dashboard](https://app.supabase.com/)
2. Navigate to **Settings** → **API**
3. Copy:
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_KEY`: service_role key (⚠️ Keep this secret!)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Create OAuth 2.0 Client ID (or use existing)
4. Add your Netlify URL to authorized origins:
   - `https://your-site-name.netlify.app`
5. Copy the Client ID

### 3. Deploy

1. Click **"Deploy site"** in Netlify
2. Netlify will:
   - Install Node.js dependencies
   - Install Python dependencies for functions
   - Build the React frontend
   - Package the backend as serverless functions
   - Deploy everything together

### 4. Verify Deployment

Once deployed, test these endpoints:

- `https://your-site.netlify.app/` — Frontend (should load the game)
- `https://your-site.netlify.app/health` — Backend health check
- `https://your-site.netlify.app/api/test-supabase` — Database connection test

### 5. Configure Domain (Optional)

1. In Netlify, go to **Domain settings**
2. Add your custom domain
3. Update Google OAuth authorized origins with your custom domain
4. Update CORS settings if needed

## Troubleshooting

### Build Failures

**Problem**: Build fails during npm install
- **Solution**: Check that `package.json` and `package-lock.json` are committed

**Problem**: Build fails during Python dependency installation
- **Solution**: Verify `netlify/functions/requirements.txt` is present and valid

### Runtime Errors

**Problem**: API endpoints return 500 errors
- **Solution**: Check Netlify Function logs in dashboard → Functions
- Verify environment variables are set correctly

**Problem**: "Database connection failed"
- **Solution**: 
  - Verify Supabase URL and keys in environment variables
  - Check Supabase project is not paused
  - Test connection from local environment first

**Problem**: Google OAuth fails
- **Solution**:
  - Verify `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` match
  - Check authorized origins in Google Cloud Console include your Netlify URL
  - Make sure credentials include https:// protocol

### CORS Issues

The monorepo structure eliminates most CORS issues since frontend and backend are on the same origin. If you still encounter CORS problems:

1. Check that redirects in `netlify.toml` are configured correctly
2. Verify API calls in frontend use relative URLs (e.g., `/api/auth/signin`)
3. Review Netlify Function logs for errors

## Monitoring

### Netlify Dashboard

Monitor your deployment:
- **Deploys**: View build history and logs
- **Functions**: Check function invocations and logs
- **Analytics**: Track site performance (if enabled)

### Logs

View logs for debugging:
1. Go to **Functions** tab in Netlify dashboard
2. Click on a function (e.g., `api`)
3. View real-time logs and errors

## Updating

To deploy updates:

1. Push changes to your Git repository
2. Netlify automatically rebuilds and deploys (if auto-deploy is enabled)
3. Or manually trigger deploy from Netlify dashboard

## Rollback

If a deployment breaks something:

1. Go to **Deploys** in Netlify dashboard
2. Find the last working deployment
3. Click **"Publish deploy"** to rollback

## Cost Optimization

Netlify Free Tier includes:
- 100GB bandwidth/month
- 300 build minutes/month
- 125k function invocations/month

For higher traffic:
- Consider upgrading to Netlify Pro
- Optimize function calls (cache where possible)
- Monitor usage in Netlify dashboard

## Security Best Practices

1. **Never commit secrets**: Keep `.env` files in `.gitignore`
2. **Use service role key carefully**: Only use `SUPABASE_SERVICE_KEY` for admin operations
3. **Rotate keys regularly**: Update API keys periodically
4. **Enable HTTPS only**: Netlify provides this by default
5. **Review function logs**: Monitor for suspicious activity

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
