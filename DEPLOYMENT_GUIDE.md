# 🚀 Deployment Guide - WanderBeasts

Complete guide for deploying WanderBeasts as a web app and mobile app.

## Table of Contents

1. [Web App Deployment](#web-app-deployment)
2. [Mobile App Deployment](#mobile-app-deployment)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Web App Deployment

### Option 1: Vercel (Recommended - Easiest)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Code pushed to GitHub

#### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/wanderbeasts.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset:** Vite
     - **Root Directory:** ./ (or leave default)
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   
3. **Add Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_MAPBOX_TOKEN`
     - `VITE_GEMINI_API_KEY` (optional)
   - Click "Redeploy" after adding variables

4. **Deploy**
   - Vercel will automatically deploy
   - Your app will be live at `your-project.vercel.app`

#### Custom Domain (Optional)
- Go to Project Settings > Domains
- Add your custom domain
- Follow DNS configuration instructions

---

### Option 2: Netlify

#### Steps

1. **Push code to GitHub** (same as Vercel)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add New Site" > "Import an existing project"
   - Connect GitHub and select your repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   
3. **Add Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all variables from `.env` file
   - Trigger a new deployment

4. **Deploy**
   - Netlify will automatically deploy
   - Your app will be live at `your-project.netlify.app`

---

### Option 3: GitHub Pages

#### Steps

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/wanderbeasts"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select "gh-pages" branch
   - Your app will be live at `yourusername.github.io/wanderbeasts`

**Note:** GitHub Pages doesn't support environment variables easily. You'll need to use a build-time script or use Vercel/Netlify instead.

---

## Mobile App Deployment

### Option 1: PWA (Progressive Web App) - Already Configured!

Your app is already a PWA! Users can install it on their phones.

#### How Users Install:

**Android:**
1. Open the web app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will appear on the home screen

**iOS:**
1. Open the web app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear on the home screen

#### PWA Features Already Enabled:
- ✅ Service Worker (offline support)
- ✅ Web App Manifest
- ✅ Install prompt
- ✅ Offline caching
- ✅ Mobile-optimized UI

---

### Option 2: Capacitor (Native Mobile Apps)

Convert your web app to native iOS and Android apps.

#### Steps

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **Add Platforms**
   ```bash
   npm install @capacitor/android @capacitor/ios
   npx cap add android
   npx cap add ios
   ```

3. **Build Web App**
   ```bash
   npm run build
   ```

4. **Sync with Native Projects**
   ```bash
   npx cap sync
   ```

5. **Open in Native IDEs**
   ```bash
   # Android
   npx cap open android
   
   # iOS (Mac only)
   npx cap open ios
   ```

6. **Configure Native Apps**
   - Update `capacitor.config.json`:
     ```json
     {
       "appId": "com.yourcompany.wanderbeasts",
       "appName": "WanderBeasts",
       "webDir": "dist",
       "server": {
         "url": "https://your-domain.com",
         "cleartext": false
       }
     }
     ```

7. **Build and Publish**
   - **Android:** Build APK/AAB in Android Studio, publish to Google Play Store
   - **iOS:** Build in Xcode, publish to Apple App Store

#### Required Permissions

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**iOS (ios/App/App/Info.plist):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby creatures and challenges</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to track your progress on walking challenges</string>
```

---

### Option 3: React Native (Complete Rewrite)

If you want a fully native experience, you can rewrite the app in React Native. This is more work but provides better performance.

---

## Environment Variables

### Required Variables

Create these in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_GEMINI_API_KEY=your_gemini_key  # Optional
```

### Getting API Keys

1. **Supabase:**
   - Go to Supabase Dashboard > Settings > API
   - Copy URL and anon key

2. **Mapbox:**
   - Go to [mapbox.com](https://mapbox.com)
   - Create account and get access token

3. **Gemini (Optional):**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API key

---

## Post-Deployment Checklist

### ✅ Web App

- [ ] Environment variables set
- [ ] App builds successfully
- [ ] App loads in browser
- [ ] Location permissions work
- [ ] Map displays correctly
- [ ] Creatures spawn correctly
- [ ] Challenges work
- [ ] Gyms work
- [ ] Authentication works
- [ ] Vouchers work
- [ ] Email functionality works (if configured)
- [ ] PWA installs on mobile
- [ ] Service worker works (offline mode)

### ✅ Mobile App (Capacitor)

- [ ] Capacitor installed and configured
- [ ] Native projects created
- [ ] Permissions configured
- [ ] App builds in Android Studio/Xcode
- [ ] Location permissions requested
- [ ] App runs on device
- [ ] All features work
- [ ] App signed for release
- [ ] Published to app stores

### ✅ Database

- [ ] All migrations run
- [ ] RLS policies active
- [ ] Edge Functions deployed
- [ ] Resend API key set (if using email)
- [ ] Test data created (if needed)

### ✅ Performance

- [ ] Images optimized
- [ ] Code minified
- [ ] Bundle size optimized
- [ ] Loading times acceptable
- [ ] Mobile performance good

---

## Troubleshooting

### Web App Issues

**Build fails:**
- Check environment variables are set
- Check Node.js version (use Node 18+)
- Check for TypeScript/ESLint errors

**App doesn't load:**
- Check browser console for errors
- Verify environment variables
- Check network requests

**Location doesn't work:**
- Verify HTTPS (required for geolocation)
- Check browser permissions
- Test on mobile device

### Mobile App Issues

**Capacitor sync fails:**
- Run `npm run build` first
- Check `capacitor.config.json`
- Verify platforms are added

**Location doesn't work:**
- Check permissions in manifest/Info.plist
- Test on physical device (not simulator)
- Verify location services enabled

**App crashes:**
- Check native logs
- Verify all dependencies installed
- Check for memory issues

---

## Quick Deploy Commands

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
```bash
npm run deploy
```

---

## Support

For issues:
1. Check the troubleshooting section
2. Check browser/device console for errors
3. Verify all environment variables are set
4. Test on different devices/browsers
5. Check Supabase logs for database issues

---

## Next Steps

After deployment:
1. Test all features
2. Monitor error logs
3. Set up analytics (optional)
4. Configure custom domain (optional)
5. Set up CI/CD (optional)
6. Monitor performance
7. Gather user feedback

Good luck with your deployment! 🚀

