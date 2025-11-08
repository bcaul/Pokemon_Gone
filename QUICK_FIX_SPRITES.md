# Quick Fix: Sprites Not Showing on Map

## The Problem
Map shows only paw emojis (🐾) instead of fakemon sprites.

## Most Likely Causes

### 1. Database Not Updated (90% of cases)
**Solution:** Run the SQL script to update sprite URLs

1. Open Supabase Dashboard → SQL Editor
2. Run `KEEP_ONLY_51_CREATURES.sql`
3. Verify it worked:
   ```sql
   SELECT name, image_url FROM creature_types WHERE image_url LIKE '%pokengine%' LIMIT 5;
   ```
4. Refresh your app

### 2. Image URLs Not Being Fetched
**Solution:** The code now explicitly fetches `image_url` field. Check browser console for:
- `Creating marker for [name]:` logs
- Look for `image_url: "https://..."` or `image_url: null`

### 3. Images Failing to Load
**Solution:** Check if sprite URLs work

1. Open browser console
2. Run:
   ```javascript
   const testUrl = 'https://pokengine.b-cdn.net/play/images/mons/fronts/00xjjwow.webp?t=26';
   const img = new Image();
   img.onload = () => console.log('✅ URL works!');
   img.onerror = () => console.log('❌ URL failed!');
   img.src = testUrl;
   ```

## Step-by-Step Debugging

### Step 1: Check Database
```sql
-- Run in Supabase SQL Editor
SELECT name, image_url 
FROM creature_types 
WHERE image_url IS NOT NULL 
LIMIT 10;
```

**Expected:** 10 creatures with Pokengine URLs
**If empty:** Run `KEEP_ONLY_51_CREATURES.sql`

### Step 2: Check Browser Console
1. Open app → DevTools (F12) → Console
2. Look for logs when creatures spawn:
   - `Creating marker for [name]:`
   - `Sprite URL for [name]:`
   - `✅ Successfully loaded` or `❌ Failed to load`

### Step 3: Check Network Tab
1. DevTools → Network → Filter "Img"
2. Look for requests to `pokengine.b-cdn.net`
3. Check if they return 200 OK or error

## What the Logs Should Show

**If working correctly:**
```
Creating marker for Geckrow: {name: "Geckrow", image_url: "https://pokengine.b-cdn.net/...", hasImageUrl: true}
Sprite URL for Geckrow: https://pokengine.b-cdn.net/play/images/mons/fronts/00xjjwow.webp?t=26
✅ Successfully loaded sprite for Geckrow: https://...
```

**If not working:**
```
Creating marker for Geckrow: {name: "Geckrow", image_url: null, hasImageUrl: false}
⚠️ No valid sprite URL for Geckrow. spriteUrl: null
```

This means the database doesn't have the sprite URLs - run the SQL script!

## Quick Test Script

Run this in browser console to test:

```javascript
// Test if sprites are in database
fetch('YOUR_SUPABASE_URL/rest/v1/creature_types?select=name,image_url&limit=5', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Creature data from DB:', data);
  data.forEach(c => {
    if (c.image_url) {
      console.log(`✅ ${c.name}: ${c.image_url}`);
    } else {
      console.log(`❌ ${c.name}: NO IMAGE URL`);
    }
  });
});
```

Replace `YOUR_SUPABASE_URL` and `YOUR_ANON_KEY` with your actual values from `.env`.

## Most Common Fix

**99% of the time, the issue is:** Database hasn't been updated with sprite URLs.

**Fix:** Run `KEEP_ONLY_51_CREATURES.sql` in Supabase SQL Editor.

After running it, refresh your app and sprites should appear!

