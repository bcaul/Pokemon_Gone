# 📱 Mobile App Deployment Guide

Step-by-step guide for deploying WanderBeasts as a mobile app.

## Quick Start: PWA (Already Working!)

Your app is already a Progressive Web App (PWA). Users can install it directly on their phones:

### Android
1. Open the app in Chrome
2. Tap menu (⋮) → "Add to Home Screen"
3. App appears on home screen

### iOS
1. Open the app in Safari
2. Tap Share (□↑) → "Add to Home Screen"
3. App appears on home screen

**That's it!** No additional deployment needed for PWA.

---

## Native Mobile Apps (Capacitor)

For App Store and Google Play Store distribution.

### Prerequisites

- Node.js 18+
- Android Studio (for Android)
- Xcode (for iOS, Mac only)
- Apple Developer account ($99/year, for iOS)
- Google Play Developer account ($25 one-time, for Android)

### Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

When prompted:
- **App name:** WanderBeasts
- **App ID:** com.yourcompany.wanderbeasts (or your domain)
- **Web directory:** dist

### Step 2: Add Platforms

```bash
# Install platform packages
npm install @capacitor/android @capacitor/ios

# Add platforms
npx cap add android
npx cap add ios  # Mac only
```

### Step 3: Configure Capacitor

Edit `capacitor.config.json`:

```json
{
  "appId": "com.yourcompany.wanderbeasts",
  "appName": "WanderBeasts",
  "webDir": "dist",
  "server": {
    "url": "https://your-domain.com",
    "cleartext": false
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000
    },
    "Geolocation": {
      "permissions": {
        "ios": "WhenInUse",
        "android": "WhenInUse"
      }
    }
  }
}
```

### Step 4: Build Web App

```bash
npm run build
```

### Step 5: Sync with Native Projects

```bash
npx cap sync
```

This copies your built web app to native projects.

---

## Android Deployment

### Step 1: Open Android Studio

```bash
npx cap open android
```

### Step 2: Configure Permissions

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
  
  <application>
    <!-- Your app configuration -->
  </application>
</manifest>
```

### Step 3: Configure App

Edit `android/app/build.gradle`:

```gradle
android {
  defaultConfig {
    applicationId "com.yourcompany.wanderbeasts"
    minSdkVersion 22  // Android 5.1+
    targetSdkVersion 34
    versionCode 1
    versionName "1.0.0"
  }
}
```

### Step 4: Build APK (Testing)

1. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK will be in `android/app/build/outputs/apk/`

### Step 5: Build AAB (Play Store)

1. Build → Generate Signed Bundle / APK
2. Select "Android App Bundle"
3. Create keystore (save it securely!)
4. Build AAB

### Step 6: Publish to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app details
4. Upload AAB file
5. Complete store listing
6. Submit for review

---

## iOS Deployment

### Step 1: Open Xcode

```bash
npx cap open ios
```

### Step 2: Configure Permissions

Edit `ios/App/App/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby creatures and challenges</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to track your progress on walking challenges</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location to track your progress on walking challenges</string>
```

### Step 3: Configure App

1. Select project in Xcode
2. Go to "Signing & Capabilities"
3. Select your team
4. Set Bundle Identifier: `com.yourcompany.wanderbeasts`
5. Set Version: 1.0.0
6. Set Build: 1

### Step 4: Build for Device

1. Connect iPhone/iPad
2. Select device in Xcode
3. Click "Run" (▶️)
4. App will install on device

### Step 5: Build for App Store

1. Product → Archive
2. Wait for archive to complete
3. Window → Organizer
4. Select archive → Distribute App
5. Follow App Store Connect workflow

### Step 6: Publish to App Store

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill in app details
4. Upload build from Xcode
5. Complete store listing
6. Submit for review

---

## Environment Variables for Mobile

### Option 1: Build-time (Recommended)

Create a build script that injects environment variables:

```javascript
// scripts/build-mobile.js
import { writeFileSync } from 'fs'

const env = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VITE_MAPBOX_TOKEN: process.env.VITE_MAPBOX_TOKEN,
}

writeFileSync(
  './dist/env.js',
  `window.__ENV__ = ${JSON.stringify(env)}`
)
```

Update your code to use `window.__ENV__` instead of `import.meta.env`.

### Option 2: Runtime Configuration

Serve environment variables from your backend or use a config file.

---

## Testing

### Android

1. **Emulator:**
   ```bash
   npx cap open android
   # Run in Android Studio emulator
   ```

2. **Physical Device:**
   - Enable USB debugging
   - Connect device
   - Run from Android Studio

### iOS

1. **Simulator:**
   ```bash
   npx cap open ios
   # Run in Xcode simulator
   ```

2. **Physical Device:**
   - Connect iPhone/iPad
   - Select device in Xcode
   - Run from Xcode

---

## Common Issues

### Location Not Working

**Android:**
- Check permissions in AndroidManifest.xml
- Test on physical device (not emulator)
- Verify location services enabled

**iOS:**
- Check Info.plist permissions
- Test on physical device (not simulator)
- Verify location services enabled in Settings

### Build Errors

**Android:**
- Update Android Studio
- Sync Gradle files
- Clean and rebuild project

**iOS:**
- Update Xcode
- Clean build folder (Cmd+Shift+K)
- Update CocoaPods: `cd ios && pod install`

### App Crashes

- Check native logs in Android Studio/Xcode
- Verify all dependencies installed
- Check for memory issues
- Test on different devices

---

## Updates

After making changes to your web app:

1. **Build web app:**
   ```bash
   npm run build
   ```

2. **Sync with native:**
   ```bash
   npx cap sync
   ```

3. **Rebuild native apps:**
   - Android: Build new APK/AAB
   - iOS: Archive new build

4. **Update app stores:**
   - Increment version number
   - Upload new build
   - Submit for review

---

## Tips

1. **Test thoroughly** on physical devices before release
2. **Use TestFlight** (iOS) and **Internal Testing** (Android) for beta testing
3. **Monitor crash reports** in App Store Connect and Google Play Console
4. **Optimize images** for mobile (use WebP format)
5. **Test offline mode** (PWA features)
6. **Monitor performance** (battery usage, memory)

---

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com)
- [iOS Developer Guide](https://developer.apple.com/ios)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## Support

For issues:
1. Check Capacitor documentation
2. Check platform-specific documentation
3. Test on physical devices
4. Check native logs for errors
5. Verify permissions are configured correctly

Good luck with your mobile deployment! 📱🚀

