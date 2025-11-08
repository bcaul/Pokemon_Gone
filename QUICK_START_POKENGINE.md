# Quick Start: Pokengine Sprites Integration

## What Was Done

✅ Created database migration with all 100 Pokengine creatures
✅ Updated UI components to display sprites instead of emojis
✅ Added fallback to emoji if sprite fails to load
✅ Created sprite URL helper utility

## Next Steps

### 1. Find Correct Sprite URLs

The migration uses this URL pattern:
```
https://pokengine.org/icons/{creature-name}.png
```

**You need to verify this is correct:**

1. Go to https://pokengine.org/collections/107s7x9x/Mongratis?icons
2. Right-click on any sprite image
3. Select "Inspect" or "Copy image address"
4. Check the actual URL format

### 2. Update Sprite URLs (If Needed)

If the URL pattern is different, update `src/lib/creatureSprites.js`:

```javascript
// Change this line to match the actual URL pattern:
return `https://pokengine.org/icons/${normalizedName}.png`
```

### 3. Run Database Migration

In Supabase SQL Editor, run:
```sql
-- File: supabase/migrations/006_replace_with_pokengine_creatures.sql
```

This will:
- Delete existing 5 creatures
- Insert all 100 Pokengine creatures
- Set sprite URLs (you may need to update these)

### 4. Test the App

1. **Generate spawns** - Should see new creatures
2. **Check map markers** - Should show sprites (or emoji fallback)
3. **Catch a creature** - Modal should show sprite
4. **View collection** - Should show sprites
5. **Search** - Should show sprites in results

### 5. Verify Sprite Loading

Open browser DevTools → Network tab:
- Look for image requests
- Check if they return 200 (success) or 404 (not found)
- If 404, update URL pattern in `creatureSprites.js`

## Alternative: Download Sprites Locally

If Pokengine URLs don't work or you want better performance:

1. **Download all sprites** from Pokengine
2. **Save to** `public/sprites/mongratis/`
3. **Update** `creatureSprites.js`:
   ```javascript
   return `/sprites/mongratis/${normalizedName}.png`
   ```
4. **Update migration** to use local paths:
   ```sql
   image_url = '/sprites/mongratis/geckrow.png'
   ```

## Files Modified

- ✅ `supabase/migrations/006_replace_with_pokengine_creatures.sql` - Database migration
- ✅ `src/lib/creatureSprites.js` - Sprite URL helper
- ✅ `src/components/Map.jsx` - Map markers
- ✅ `src/components/CatchModal.jsx` - Catch modal
- ✅ `src/components/Collection.jsx` - Collection view
- ✅ `src/components/SearchBar.jsx` - Search results

## Troubleshooting

### Sprites Not Showing

1. **Check browser console** for 404 errors
2. **Verify URL pattern** matches Pokengine structure
3. **Test URL directly** in browser
4. **Check CORS** - Pokengine might block cross-origin requests

### Fallback Working (Emoji Showing)

- This means sprite URL is wrong or blocked
- Update URL pattern or download sprites locally

### Migration Fails

- Check if existing catches/spawns need to be deleted first
- The migration uses `TRUNCATE` which will delete all data
- Make a backup if needed

## Expected Behavior

✅ **Map markers**: Show creature sprites (or emoji fallback)
✅ **Catch modal**: Show large creature sprite
✅ **Collection**: Show creature sprites in grid
✅ **Search**: Show creature sprites in results
✅ **Fallback**: Emoji (🐾) shows if sprite fails to load

## Rarity Distribution

- **Common** (40): Most frequent spawns
- **Uncommon** (30): Medium frequency
- **Rare** (20): Less frequent
- **Epic** (8): Very rare
- **Legendary** (2): Extremely rare

## Creature Types

Creatures are assigned types based on their names:
- Fire, Water, Grass, Electric, etc.
- You can adjust these in the migration if needed

## Need Help?

1. Check `SETUP_POKENGINE_SPRITES.md` for detailed guide
2. Verify sprite URLs work in browser
3. Check browser console for errors
4. Consider downloading sprites locally for reliability

