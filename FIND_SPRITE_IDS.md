# How to Find Pokengine Sprite IDs

## Quick Method

1. **Visit the collection page**: https://pokengine.org/collections/107s7x9x/Mongratis?icons

2. **For each creature**:
   - Right-click on the sprite image
   - Select "Inspect" or "Inspect Element"
   - Look at the `<img>` tag's `src` attribute
   - The URL will look like: `https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26`
   - The sprite ID is the part before `.webp` (e.g., `0016spl5`)

3. **Copy the sprite ID** and update the database

## Automated Method (Browser Console)

Open browser console on the Pokengine collection page and run:

```javascript
// Extract all sprite URLs from the page
const images = document.querySelectorAll('img[src*="pokengine.b-cdn.net"]');
const spriteMap = {};

images.forEach(img => {
  const url = img.src;
  const match = url.match(/fronts\/([^\.]+)\.webp/);
  if (match) {
    const spriteId = match[1];
    // Try to get creature name from alt text, title, or nearby text
    const name = img.alt || img.title || img.closest('[data-name]')?.dataset.name || 'Unknown';
    spriteMap[name] = spriteId;
    console.log(`${name}: ${spriteId}`);
  }
});

// Copy the result
console.log(JSON.stringify(spriteMap, null, 2));
```

## Update Database

Once you have the sprite IDs, create a SQL update script:

```sql
-- Example updates (replace with actual sprite IDs)
UPDATE creature_types 
SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26'
WHERE name = 'Geckrow';

UPDATE creature_types 
SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/{NEXT_ID}.webp?t=26'
WHERE name = 'Goanopy';

-- ... continue for all 100 creatures
```

## Bulk Update Script Template

```sql
-- Update all creatures at once (replace {SPRITE_ID} with actual IDs)
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID_1}.webp?t=26' WHERE name = 'Geckrow';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID_2}.webp?t=26' WHERE name = 'Goanopy';
-- ... etc
```

## Verify Updates

```sql
-- Check that URLs are updated
SELECT name, image_url 
FROM creature_types 
WHERE image_url LIKE '%pokengine.b-cdn.net%'
LIMIT 10;

-- Check for missing URLs
SELECT name 
FROM creature_types 
WHERE image_url IS NULL OR image_url LIKE '%{SPRITE_ID}%';
```

## Testing

1. **Test URL directly**: Open a sprite URL in browser to verify it works
2. **Test in app**: Generate spawns and check if sprites load
3. **Check console**: Look for 404 errors in browser DevTools

## Notes

- Sprite IDs appear to be unique codes (like `0016spl5`)
- The `?t=26` parameter is likely a cache buster or version number
- You can remove the `?t=26` parameter if needed, but it's recommended to keep it
- The `.webp` format is efficient and modern

