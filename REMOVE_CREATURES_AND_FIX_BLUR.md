# Remove Creatures Without Sprites & Fix Image Blur

## Changes Made

### 1. Remove Creatures Without Sprites

**File:** `REMOVE_CREATURES_WITHOUT_SPRITES.sql`

This SQL script will:
- Delete all creatures that don't have valid Pokengine sprite URLs
- Remove associated catches and spawns for those creatures
- Keep only creatures with working sprites

**To apply:**
1. Open Supabase Dashboard → SQL Editor
2. Run `REMOVE_CREATURES_WITHOUT_SPRITES.sql`
3. This will remove all creatures showing pawprint emojis (🐾)

### 2. Fix Image Blur/Quality

**Files Updated:**
- `src/components/Collection.jsx`
- `src/components/CatchModal.jsx`
- `src/components/Map.jsx`

**Changes:**
- Changed `imageRendering` from `pixelated` to `crisp-edges`
- Added browser-specific rendering properties for better compatibility
- Added hardware acceleration properties to prevent blur

## How to Apply

### Step 1: Remove Creatures Without Sprites

```sql
-- Run this in Supabase SQL Editor
-- File: REMOVE_CREATURES_WITHOUT_SPRITES.sql
```

This will:
- Keep only creatures with valid `image_url` containing `pokengine.b-cdn.net`
- Remove creatures with `NULL` image_url or placeholder URLs
- Clean up associated data (catches, spawns)

### Step 2: Refresh Your App

After running the SQL:
1. Refresh your app (hard refresh: Ctrl+Shift+R)
2. Only creatures with working sprites will appear
3. No more pawprint emojis!

### Step 3: Verify Image Quality

Check:
1. **Collection view** - Images should be sharp and clear
2. **Catch modal** - Both preview and success views should be crisp
3. **Map markers** - Should remain clear

## Expected Results

### Before:
- Some creatures show sprites ✅
- Some creatures show pawprint emojis 🐾
- Images appear blurry in collection/modal

### After:
- Only creatures with working sprites appear ✅
- No pawprint emojis
- Images are sharp and clear

## Troubleshooting

### If images are still blurry:

1. **Check browser zoom** - Should be at 100%
2. **Check display DPI** - High-DPI displays may need different settings
3. **Clear browser cache** - Old cached images might be blurry
4. **Try different browser** - Some browsers handle image rendering differently

### If creatures still show pawprints:

1. **Check database** - Run this query:
   ```sql
   SELECT name, image_url 
   FROM creature_types 
   WHERE image_url IS NULL 
      OR image_url NOT LIKE '%pokengine.b-cdn.net%';
   ```
2. **If any results** - Those creatures don't have valid sprite URLs
3. **Run the removal script again** to clean them up

## Notes

- The removal script is safe to run multiple times
- It only removes creatures without valid sprite URLs
- Your catches and spawns for creatures with sprites are preserved
- Image quality improvements work automatically after code changes

