# Setting Up Pokengine Sprites

## Overview
This guide explains how to integrate Pokengine Mongratis collection sprites into your WanderBeasts app.

## Sprite Source
- **Collection**: Mongratis (107s7x9x)
- **URL**: https://pokengine.org/collections/107s7x9x/Mongratis?icons
- **Total Creatures**: 100

## Sprite URL Format

The exact URL format for Pokengine sprites needs to be verified. The migration file uses:
```
https://pokengine.org/icons/{creature-name}.png
```

However, you may need to adjust this based on the actual Pokengine API/structure.

### Finding the Correct URL Format

1. **Inspect the Pokengine website**:
   - Open https://pokengine.org/collections/107s7x9x/Mongratis?icons
   - Right-click on a sprite image
   - Select "Inspect" or "Inspect Element"
   - Look at the `src` attribute of the `<img>` tag
   - This will show you the actual URL pattern

2. **Common URL Patterns**:
   - `https://pokengine.org/icons/{name}.png`
   - `https://pokengine.org/sprites/{name}.png`
   - `https://pokengine.org/collections/107s7x9x/icons/{name}.png`
   - `https://pokengine.org/api/sprites/{name}`

3. **Update the URL Pattern**:
   Once you find the correct pattern, update `src/lib/creatureSprites.js`:

   ```javascript
   export function getCreatureSpriteUrl(creatureName) {
     const normalizedName = creatureName.toLowerCase().replace(/\s+/g, '')
     // Update this line with the correct URL pattern:
     return `https://pokengine.org/icons/${normalizedName}.png`
   }
   ```

## Alternative: Download Sprites Locally

If Pokengine doesn't provide direct URLs, you can:

1. **Download all sprites**:
   - Visit the collection page
   - Download each sprite image
   - Save them to `public/sprites/mongratis/`

2. **Update the sprite function**:
   ```javascript
   export function getCreatureSpriteUrl(creatureName) {
     const normalizedName = creatureName.toLowerCase().replace(/\s+/g, '')
     return `/sprites/mongratis/${normalizedName}.png`
   }
   ```

3. **Update the database migration**:
   Change `image_url` in the migration to use local paths:
   ```sql
   image_url = '/sprites/mongratis/geckrow.png'
   ```

## Database Migration

Run the migration to replace existing creatures:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/006_replace_with_pokengine_creatures.sql
```

This will:
- Delete existing creatures
- Insert all 100 Pokengine creatures
- Assign rarities (40 common, 30 uncommon, 20 rare, 8 epic, 2 legendary)
- Assign types based on creature names
- Set sprite URLs (you may need to update these)

## Testing

1. **Check sprite URLs**:
   ```javascript
   // In browser console
   const spriteUrl = 'https://pokengine.org/icons/geckrow.png'
   fetch(spriteUrl).then(r => console.log('Status:', r.status))
   ```

2. **Verify in app**:
   - Generate spawns
   - Check if sprites load on map markers
   - Check if sprites load in catch modal
   - Check if sprites load in collection

3. **Fallback behavior**:
   - If sprite fails to load, emoji (🐾) will be shown
   - Check browser console for 404 errors

## Troubleshooting

### Sprites Not Loading

1. **Check URL format**:
   - Verify the URL pattern is correct
   - Test a URL directly in browser
   - Check for CORS issues

2. **Check creature names**:
   - Ensure names match exactly (case-sensitive)
   - Check for special characters
   - Verify normalization is working

3. **Check network**:
   - Open browser DevTools → Network tab
   - Look for failed image requests
   - Check error messages

### CORS Issues

If Pokengine blocks cross-origin requests:

1. **Use a proxy**:
   ```javascript
   // Add to vite.config.js
   server: {
     proxy: {
       '/api/sprites': {
         target: 'https://pokengine.org',
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/api\/sprites/, '')
       }
     }
   }
   ```

2. **Download sprites locally** (recommended):
   - Download all sprites
   - Host them in your app
   - No CORS issues

## Creature List

All 100 creatures from the Mongratis collection are included in the migration:

1. Geckrow - 40. Goanopy
2. Varanitor - 41. Deember
3. Hissiorite - 42. Lavee
... (see migration file for full list)

## Rarity Distribution

- **Common** (40): 40% spawn rate
- **Uncommon** (30): 30% spawn rate
- **Rare** (20): 20% spawn rate
- **Epic** (8): 8% spawn rate
- **Legendary** (2): 2% spawn rate

## Next Steps

1. **Find correct sprite URLs**:
   - Inspect Pokengine website
   - Update `creatureSprites.js` if needed

2. **Run migration**:
   - Execute SQL migration in Supabase
   - Verify creatures are inserted

3. **Test sprites**:
   - Generate spawns
   - Verify sprites load correctly
   - Check all UI components

4. **Adjust as needed**:
   - Update URLs if pattern is wrong
   - Download locally if URLs don't work
   - Adjust rarities/types if needed

## Files Modified

- `supabase/migrations/006_replace_with_pokengine_creatures.sql` - Database migration
- `src/lib/creatureSprites.js` - Sprite URL helper
- `src/components/Map.jsx` - Map markers with sprites
- `src/components/CatchModal.jsx` - Catch modal with sprites
- `src/components/Collection.jsx` - Collection view with sprites
- `src/components/SearchBar.jsx` - Search results with sprites

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify sprite URLs work in browser
3. Check network tab for failed requests
4. Consider downloading sprites locally

