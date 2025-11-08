# Update Sprite URLs for Pokengine CDN

## Correct Sprite URL Pattern

Pokengine uses a CDN with this pattern:
```
https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID}.webp?t=26
```

Example: `https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26`

## The Challenge

The sprite URLs use **specific IDs** (like `0016spl5`) rather than creature names. You need to map each creature name to its corresponding sprite ID.

## Solution Options

### Option 1: Add sprite_id Column (Recommended)

1. **Run the migration** to add `sprite_id` column:
   ```sql
   -- File: supabase/migrations/007_add_sprite_id_column.sql
   ```

2. **Find the sprite IDs** for each creature:
   - Visit https://pokengine.org/collections/107s7x9x/Mongratis?icons
   - Inspect each sprite image to get its URL
   - Extract the sprite ID (the part before `.webp`)

3. **Update the database** with sprite IDs:
   ```sql
   UPDATE creature_types 
   SET sprite_id = '0016spl5', 
       image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26'
   WHERE name = 'Geckrow';
   ```

### Option 2: Update image_url Directly

Update the `image_url` column in the migration with the correct URLs:

```sql
UPDATE creature_types 
SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26'
WHERE name = 'Geckrow';
```

### Option 3: Create Mapping Script

Create a JavaScript/TypeScript file that maps creature names to sprite IDs:

```javascript
const spriteMapping = {
  'Geckrow': '0016spl5',
  'Goanopy': 'xxxxxxx',
  // ... etc
}
```

## Finding Sprite IDs

### Method 1: Inspect Website

1. Go to https://pokengine.org/collections/107s7x9x/Mongratis?icons
2. Right-click on each sprite
3. Select "Inspect" or "Copy image address"
4. Extract the sprite ID from the URL

### Method 2: Network Tab

1. Open browser DevTools → Network tab
2. Filter by "Images"
3. Load the Pokengine collection page
4. Look for requests to `pokengine.b-cdn.net`
5. Note the sprite IDs in the URLs

### Method 3: API/Data Export

If Pokengine has an API or data export, you might be able to get the mapping programmatically.

## Updated Code

The sprite helper (`src/lib/creatureSprites.js`) has been updated to:
1. Use `image_url` from database (preferred)
2. Use `sprite_id` if available
3. Fall back to name-based URL (may not work)

## Quick Fix

For now, update the migration to use the correct URL pattern. You'll need to find the sprite ID for each creature:

```sql
-- Example: Update one creature at a time
UPDATE creature_types 
SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID}.webp?t=26'
WHERE name = '{CREATURE_NAME}';
```

## Bulk Update Script

Once you have all sprite IDs, create a SQL script:

```sql
-- Update all creatures with their sprite URLs
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26' WHERE name = 'Geckrow';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/xxxxxxx.webp?t=26' WHERE name = 'Goanopy';
-- ... etc for all 100 creatures
```

## Testing

After updating sprite URLs:

1. **Check database**:
   ```sql
   SELECT name, image_url FROM creature_types LIMIT 10;
   ```

2. **Test in browser**:
   - Open a sprite URL directly in browser
   - Should see the sprite image

3. **Test in app**:
   - Generate spawns
   - Check if sprites load on map
   - Check catch modal
   - Check collection

## Files Updated

- ✅ `src/lib/creatureSprites.js` - Updated to use Pokengine CDN pattern
- ✅ `supabase/migrations/007_add_sprite_id_column.sql` - Adds sprite_id column
- 📝 Migration file needs sprite IDs added

## Next Steps

1. **Run migration** to add `sprite_id` column
2. **Find sprite IDs** for all 100 creatures
3. **Update database** with sprite URLs
4. **Test** that sprites load correctly

## Alternative: Reverse Engineer IDs

If the sprite IDs follow a pattern, you might be able to:
- Map collection position to ID
- Use creature database ID
- Use a hash of the creature name

But the safest approach is to get the actual IDs from the Pokengine website.

