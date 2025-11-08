# How to Extract Sprite IDs from Pokengine

## Step-by-Step Instructions

### Step 1: Open the Collection Page
1. Go to: https://pokengine.org/collections/107s7x9x/Mongratis?icons
2. Wait for the page to fully load (all sprites should be visible)

### Step 2: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Click on the **Console** tab

### Step 3: Run the Extraction Script

**Option A: Simple Script (Recommended)**
```javascript
const images = document.querySelectorAll('img[src*="pokengine.b-cdn.net"]');
const updates = [];
images.forEach((img, i) => {
  const url = img.src;
  const match = url.match(/fronts\/([^\.]+)\.webp/);
  if (match) {
    const spriteId = match[1];
    const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
    let name = img.alt || img.title || `Creature_${i + 1}`;
    const parent = img.parentElement;
    if (parent) {
      const nameEl = parent.querySelector('h1, h2, h3, .name, [class*="name"]');
      if (nameEl) name = nameEl.textContent.trim();
    }
    updates.push({ name: name.trim(), spriteId, url: fullUrl });
    console.log(`${i + 1}. ${name} → ${spriteId}`);
  }
});
console.log('\n=== SQL UPDATES ===\n');
updates.forEach(u => {
  const name = u.name.replace(/'/g, "''");
  console.log(`UPDATE creature_types SET image_url = '${u.url}' WHERE name = '${name}';`);
});
```

**Option B: Full Script**
- Copy the entire contents of `EXTRACT_SPRITE_IDS_CONSOLE.js`
- Paste into console
- Press Enter

### Step 4: Copy the SQL Output
1. The console will output SQL UPDATE statements
2. Copy all the UPDATE statements
3. They should look like:
   ```sql
   UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26' WHERE name = 'Geckrow';
   UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/xxxxxxx.webp?t=26' WHERE name = 'Goanopy';
   ...
   ```

### Step 5: Run in Supabase
1. Open Supabase Dashboard → SQL Editor
2. Paste the SQL UPDATE statements
3. Click "Run"
4. Verify with:
   ```sql
   SELECT name, image_url FROM creature_types LIMIT 10;
   ```

## Troubleshooting

### "No sprite images found"
- Make sure you're on the correct page
- Wait for page to fully load
- Check if images are loaded (they might be lazy-loaded)

### "Unexpected end of input"
- Make sure you copied the ENTIRE script
- Don't copy just part of it
- Try the simple script instead

### Names don't match
- The script tries to extract names from the page
- You may need to manually match sprite IDs to creature names
- Use the index numbers to match with the creature list

### Manual Extraction
If the script doesn't work:
1. Right-click on each sprite
2. Select "Inspect"
3. Find the `<img>` tag
4. Copy the `src` attribute
5. Extract the sprite ID (part before `.webp`)
6. Manually create UPDATE statements

## Expected Output

You should see:
```
1. Geckrow → 0016spl5
2. Goanopy → xxxxxxx
3. Varanitor → xxxxxxx
...
```

Followed by SQL UPDATE statements.

## Quick Test

After updating the database, test in your app:
1. Generate spawns
2. Check if sprites load on map markers
3. Catch a creature and verify sprite in modal
4. Check collection view

If sprites still don't load:
- Check browser console for 404 errors
- Verify URLs work when opened directly
- Check network tab for failed requests

