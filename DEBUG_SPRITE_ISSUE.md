# Debugging Sprite Display Issue

## Problem
Map shows only paw emojis (🐾) instead of fakemon sprites.

## Steps to Debug

### Step 1: Verify Database Has Sprite URLs

Run this in Supabase SQL Editor:

```sql
-- Check if sprites are in database
SELECT name, image_url 
FROM creature_types 
WHERE image_url IS NOT NULL 
  AND image_url LIKE '%pokengine.b-cdn.net%'
ORDER BY name
LIMIT 10;
```

**Expected:** Should show 10+ creatures with valid Pokengine URLs.

**If empty or NULL:** Run `KEEP_ONLY_51_CREATURES.sql` first.

### Step 2: Check Browser Console

1. Open your app in browser
2. Open DevTools (F12) → Console tab
3. Look for log messages when markers are created:
   - `Creating marker for [creature name]:`
   - `Sprite URL for [creature name]:`
   - `✅ Successfully loaded sprite` or `❌ Failed to load sprite`

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Img" (images)
3. Look for requests to `pokengine.b-cdn.net`
4. Check if they return 200 OK or 404/error

### Step 4: Verify Creature Data is Loaded

In browser console, run:

```javascript
// Check what data is being fetched
// This will show if image_url is in the creature data
```

Look at the console logs from `createMarkerElement` - it should show:
- `image_url: "https://pokengine.b-cdn.net/..."`
- If `image_url` is `null` or `undefined`, the database query isn't fetching it

### Step 5: Test Sprite URL Directly

Open one of the sprite URLs directly in browser:
- Example: `https://pokengine.b-cdn.net/play/images/mons/fronts/00xjjwow.webp?t=26`

**If it loads:** Sprite URL is correct, issue is in the app
**If it 404s:** Sprite ID might be wrong

## Common Issues and Fixes

### Issue 1: Database Not Updated
**Symptom:** `image_url` is `null` in console logs
**Fix:** Run `KEEP_ONLY_51_CREATURES.sql` in Supabase

### Issue 2: Image URLs Not Being Fetched
**Symptom:** `creatureType.image_url` is `undefined` in console
**Fix:** The query might not be selecting `image_url`. Check `spawning.js` line 280.

### Issue 3: Images Fail to Load (404)
**Symptom:** Console shows `❌ Failed to load sprite`
**Fix:** Sprite IDs might be wrong. Verify URLs work in browser.

### Issue 4: CORS or Network Issues
**Symptom:** Images fail to load, network tab shows CORS error
**Fix:** Pokengine CDN should allow cross-origin. Check browser console for CORS errors.

## Quick Test

Run this in browser console on your app:

```javascript
// Test if sprite URLs are working
const testUrl = 'https://pokengine.b-cdn.net/play/images/mons/fronts/00xjjwow.webp?t=26';
const img = new Image();
img.onload = () => console.log('✅ Sprite URL works!');
img.onerror = () => console.log('❌ Sprite URL failed!');
img.src = testUrl;
```

If this works, the URLs are fine and the issue is in how they're being used.

