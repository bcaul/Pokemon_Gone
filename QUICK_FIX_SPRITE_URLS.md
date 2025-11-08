# Quick Fix: Update Sprite URLs

## Problem
Sprites are using placeholder URLs with `{SPRITE_ID}` which need to be replaced with actual Pokengine sprite IDs.

## Solution

### Step 1: Extract Sprite IDs from Pokengine

1. **Open the collection page**: https://pokengine.org/collections/107s7x9x/Mongratis?icons

2. **Open browser console** (F12 → Console tab)

3. **Run the extraction script** (see `EXTRACT_SPRITE_IDS.js`):
   ```javascript
   // This will extract all sprite URLs and map them to creature names
   const images = document.querySelectorAll('img[src*="pokengine.b-cdn.net"]');
   const mapping = {};
   images.forEach((img, index) => {
     const url = img.src;
     const match = url.match(/fronts\/([^\.]+)\.webp/);
     if (match) {
       const spriteId = match[1];
       const name = img.alt || img.title || `Creature_${index + 1}`;
       mapping[name] = spriteId;
       console.log(`${name}: ${spriteId}`);
     }
   });
   console.log(JSON.stringify(mapping, null, 2));
   ```

### Step 2: Update Database

Once you have the sprite ID mappings, update the database:

```sql
-- Example: Update Geckrow (replace with actual sprite ID)
UPDATE creature_types 
SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26'
WHERE name = 'Geckrow';

-- Repeat for all 100 creatures
```

### Step 3: Verify

```sql
-- Check that URLs are updated
SELECT name, image_url 
FROM creature_types 
WHERE image_url NOT LIKE '%{SPRITE_ID}%'
LIMIT 10;

-- Check for remaining placeholders
SELECT COUNT(*) as missing_urls
FROM creature_types 
WHERE image_url LIKE '%{SPRITE_ID}%';
```

## Alternative: Manual Update

If you can't extract IDs automatically:

1. Visit https://pokengine.org/collections/107s7x9x/Mongratis?icons
2. For each creature, right-click → Inspect → Copy image URL
3. Extract the sprite ID (the part before `.webp`)
4. Update the database one by one

## Files to Update

- Migration file uses placeholders - these need actual sprite IDs
- Once database is updated, sprites will load automatically
- The `getCreatureSprite()` function will use `image_url` from database

## Testing

After updating URLs:

1. **Test a URL directly**: Open in browser to verify it loads
2. **Generate spawns**: Check if sprites appear on map
3. **Catch a creature**: Verify sprite in modal
4. **Check collection**: Verify sprites in collection view

## Current Status

- ✅ Sprite URL pattern updated to Pokengine CDN
- ✅ Sprite helper updated to use correct pattern
- ⚠️ Database migration has placeholder URLs
- ⚠️ Need to extract and update sprite IDs

## Next Steps

1. Extract sprite IDs using browser console script
2. Update database with actual sprite IDs
3. Test that sprites load correctly
4. Verify all 100 creatures have working sprites

