# How to Update Sprite URLs with Actual Pokengine IDs

## Current Situation

The migration file has placeholder URLs like:
```
https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID}.webp?t=26
```

You need to replace `{SPRITE_ID}` with actual sprite IDs (like `0016spl5`).

## Quick Method: Browser Console Script

1. **Open Pokengine collection**: https://pokengine.org/collections/107s7x9x/Mongratis?icons

2. **Open browser console** (F12 → Console)

3. **Run this script**:
   ```javascript
   // Extract all sprite URLs and create UPDATE statements
   const images = Array.from(document.querySelectorAll('img[src*="pokengine.b-cdn.net"]'));
   const updates = [];
   
   images.forEach((img, index) => {
     const url = img.src;
     const match = url.match(/fronts\/([^\.]+)\.webp/);
     if (match) {
       const spriteId = match[1];
       // Try to get creature name - adjust selector based on page structure
       const nameElement = img.closest('[data-name]') || 
                          img.parentElement?.querySelector('[class*="name"]') ||
                          img.parentElement?.previousElementSibling;
       const name = nameElement?.textContent?.trim() || 
                   img.alt || 
                   img.title ||
                   `Creature_${index + 1}`;
       
       // Clean name (remove extra whitespace, special chars)
       const cleanName = name.trim().replace(/'/g, "''");
       
       updates.push({
         name: cleanName,
         spriteId: spriteId,
         url: url
       });
       
       console.log(`${cleanName}: ${spriteId}`);
     }
   });
   
   // Generate SQL UPDATE statements
   console.log('\n=== SQL UPDATE STATEMENTS ===\n');
   updates.forEach(u => {
     console.log(`UPDATE creature_types SET image_url = '${u.url}' WHERE name = '${u.name}';`);
   });
   
   // Copy to clipboard if possible
   const sqlStatements = updates.map(u => 
     `UPDATE creature_types SET image_url = '${u.url}' WHERE name = '${u.name}';`
   ).join('\n');
   
   console.log('\n=== COPY THIS TO CLIPBOARD ===\n');
   console.log(sqlStatements);
   ```

4. **Copy the generated SQL statements** and run them in Supabase SQL Editor

## Manual Method

If the script doesn't work, manually extract sprite IDs:

1. **Visit the collection page**
2. **For each creature**:
   - Right-click the sprite
   - Select "Inspect" or "Inspect Element"
   - Find the `<img>` tag
   - Copy the `src` attribute
   - Extract the sprite ID (part before `.webp`)
   - Note the creature name from the page

3. **Update database**:
   ```sql
   UPDATE creature_types 
   SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26'
   WHERE name = 'Geckrow';
   ```

## Verify Updates

```sql
-- Check updated URLs
SELECT name, image_url 
FROM creature_types 
WHERE image_url LIKE '%pokengine.b-cdn.net%'
  AND image_url NOT LIKE '%{SPRITE_ID}%'
ORDER BY name;

-- Check for remaining placeholders
SELECT name, image_url 
FROM creature_types 
WHERE image_url LIKE '%{SPRITE_ID}%'
ORDER BY name;
```

## Testing

1. **Test URL directly**: Open a sprite URL in browser
2. **Generate spawns**: Check if sprites load
3. **Check console**: Look for 404 errors
4. **Verify images**: Sprites should appear instead of emojis

## Files Updated

- ✅ `src/lib/creatureSprites.js` - Updated to use Pokengine CDN pattern
- ✅ `src/components/Map.jsx` - Filters out placeholder URLs
- ✅ Migration file - Uses correct URL pattern (needs sprite IDs)

## Next Steps

1. Extract sprite IDs using browser console script
2. Update database with actual sprite IDs
3. Test that sprites load correctly
4. All creatures should now display with their sprites!

