# Monorepo Migration Checklist

This checklist helps you complete the migration from separate frontend/backend deployments to a unified Netlify monorepo.

## ✅ Pre-Migration (Already Completed)

- [x] Code migrated to monorepo structure
- [x] Netlify Functions created
- [x] API proxy configured
- [x] Documentation updated
- [x] render.yaml removed

## 📋 Post-Merge Deployment Steps

### 1. Netlify Account Setup

- [ ] Create or log in to [Netlify account](https://app.netlify.com/)
- [ ] Authorize Netlify to access your GitHub repository

### 2. Site Creation

- [ ] In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
- [ ] Connect to GitHub and select `Project-Qplay/QPlay-Core` repository
- [ ] Choose branch: `main` (or your production branch)
- [ ] Verify build settings (should auto-detect from `netlify.toml`):
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Functions directory: `netlify/functions`

### 3. Environment Variables Configuration

In Netlify dashboard → **Site settings** → **Environment variables**, add:

#### Required Variables

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Where to find these:**
- [ ] Supabase: Dashboard → Settings → API
- [ ] Google OAuth: Cloud Console → APIs & Services → Credentials

### 4. First Deployment

- [ ] Click **"Deploy site"** in Netlify
- [ ] Wait for build to complete (typically 2-5 minutes)
- [ ] Check build logs for any errors

### 5. Testing & Verification

After deployment, test these URLs:

- [ ] `https://your-site.netlify.app/` — Frontend loads
- [ ] `https://your-site.netlify.app/health` — Backend health check returns JSON
- [ ] `https://your-site.netlify.app/api/test-supabase` — Database connection works
- [ ] `https://your-site.netlify.app/api/game/rooms` — API returns game data

**If any test fails:**
- Check Netlify Function logs: Dashboard → Functions → api
- Verify environment variables are set correctly
- Review DEPLOYMENT.md troubleshooting section

### 6. Google OAuth Configuration

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to: APIs & Services → Credentials → Your OAuth Client
- [ ] Add to **Authorized JavaScript origins**:
  ```
  https://your-site-name.netlify.app
  ```
- [ ] Add to **Authorized redirect URIs** (if needed):
  ```
  https://your-site-name.netlify.app
  ```
- [ ] Save changes
- [ ] Test Google sign-in on your deployed site

### 7. Custom Domain (Optional)

If you want a custom domain:

- [ ] In Netlify: Domain settings → Add custom domain
- [ ] Follow DNS configuration instructions
- [ ] Wait for SSL certificate provisioning (automatic)
- [ ] Update Google OAuth authorized origins with custom domain
- [ ] Test site with custom domain

### 8. Decommission Old Backend

Once everything works on Netlify:

- [ ] Verify all features work on new deployment
- [ ] Check leaderboards, authentication, game saves
- [ ] Remove/archive old Render.com backend service
- [ ] Update any external links or documentation

### 9. Monitoring Setup

- [ ] Check Netlify Analytics (if enabled)
- [ ] Set up deployment notifications (Slack, email, etc.)
- [ ] Monitor Function invocations and errors
- [ ] Set up Supabase monitoring/alerts

### 10. Final Steps

- [ ] Update README badge (if any) with Netlify deploy status
- [ ] Announce migration to users (if applicable)
- [ ] Update any external documentation
- [ ] Celebrate! 🎉

## 🔧 Rollback Plan

If something goes wrong:

1. **Immediate rollback**: In Netlify → Deploys → Find last working deploy → "Publish deploy"
2. **Backend fallback**: Keep old Render backend running for 1-2 weeks as backup
3. **Frontend update**: If needed, update `VITE_BACKEND_URL` to point back to old backend

## 📚 Resources

- [DEPLOYMENT.md](DEPLOYMENT.md) — Detailed deployment guide
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify Support](https://www.netlify.com/support/)

## 🆘 Need Help?

If you encounter issues:
1. Check Netlify Function logs
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
3. Check environment variables are set correctly
4. Verify Supabase connection from Supabase dashboard
5. Test locally with `npm run dev:full` first

## 📊 Success Metrics

Your migration is successful when:
- ✅ Site loads and is playable
- ✅ User authentication works (email and Google)
- ✅ Game progress saves correctly
- ✅ Leaderboards load and update
- ✅ No console errors in browser
- ✅ API response times < 2 seconds
- ✅ Build times < 5 minutes
