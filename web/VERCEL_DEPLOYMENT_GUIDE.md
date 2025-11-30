# Vercel Deployment Guide - DiaryPro

## Quick Fix for "Page Not Found" Error

### Option 1: Deploy from the `web` directory (Recommended)

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Under "Build & Development Settings"
   - Set **Root Directory** to: `web`
   - Set **Build Command** to: `npm run build`
   - Set **Output Directory** to: `.next` (leave default)
   - Set **Install Command** to: `npm install`

2. **Environment Variables:**
   Make sure to add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Option 2: Deploy the entire project

If deploying from the root directory, use the `vercel.json` file in the root.

## Common Issues and Solutions

### Issue 1: "Page Not Found" Error

**Cause:** Vercel can't find the Next.js app because it's in the `web/` subdirectory.

**Solution:**
1. In Vercel project settings, set **Root Directory** to `web`
2. Or use the `vercel.json` configuration file provided

### Issue 2: Build Fails

**Possible causes:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Run `npm run build` locally to test
4. Fix any TypeScript or linting errors

### Issue 3: Environment Variables Not Working

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy after adding variables

### Issue 4: Routes Not Working

**Solution:**
- Ensure all routes exist in `web/src/app/`
- Check that `page.tsx` files are properly exported
- Verify the root `page.tsx` exists and redirects correctly

## Step-by-Step Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `web`
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `.next` (or leave default)
   - **Install Command:** `npm install` (or leave default)

4. **Add Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Check deployment logs for errors

## Testing Locally Before Deployment

```bash
cd web
npm run build
npm run start
```

Visit `http://localhost:3000` to test the production build locally.

## Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] Authentication works (login/register)
- [ ] Dashboard is accessible
- [ ] Entry creation works
- [ ] Media uploads work
- [ ] All routes are accessible
- [ ] Environment variables are set correctly

## Troubleshooting

### Check Build Logs
- Go to Vercel Dashboard → Deployments → Click on deployment → View logs

### Common Error Messages

**"Module not found"**
- Check if all dependencies are in `package.json`
- Run `npm install` locally to verify

**"Environment variable not found"**
- Add missing variables in Vercel dashboard
- Redeploy after adding

**"Page not found"**
- Verify Root Directory is set to `web`
- Check that routes exist in `web/src/app/`

## Support

If issues persist:
1. Check Vercel deployment logs
2. Test build locally: `cd web && npm run build`
3. Verify all environment variables are set
4. Check Next.js version compatibility

