# How to Get Remaining Sprite IDs

## Current Status
✅ **51 out of 100 creatures** have sprite IDs extracted.

## Next Steps

### Option 1: Scroll to Load All Images (Recommended)

The page likely uses lazy loading, so you need to scroll to load all images:

1. **Go to the Pokengine page**: https://pokengine.org/collections/107s7x9x/Mongratis?icons
2. **Scroll to the bottom** of the page slowly
3. **Wait for all images to load** (you should see more than 51 icons)
4. **Run the extraction script again**:

```javascript
const images = Array.from(document.querySelectorAll('img[src*="pokengine.b-cdn.net"]'));
const icons = images.filter(img => {
  const src = img.src;
  return src.includes('/mons/icons/') && 
         !src.includes('favicon') && 
         !src.includes('collections') &&
         !src.includes('unknown');
});

console.log('Found', icons.length, 'creature icons\n');

const names = [
  'Geckrow', 'Goanopy', 'Varanitor', 'Hissiorite', 'Cobarett',
  'Pythonova', 'Ninoala', 'Koaninja', 'Anu', 'Merlicun',
  'Firomenis', 'Baoby', 'Baobaraffe', 'Nuenflu', 'Drashimi',
  'Tsushimi', 'Tobishimi', 'Baulder', 'Dreadrock', 'Tekagon',
  'Nymbi', 'Deember', 'Lavee', 'Lavare', 'Crator',
  'Efflutal', 'Hayog', 'Hogouse', 'Hogriks', 'Webruiser',
  'Pilfetch', 'Criminalis', 'Pasturlo', 'Brambull', 'Maizotaur',
  'Minamai', 'Marelstorm', 'Spinarak', 'Ariados', 'Torkoal',
  'Tormine', 'Sunkern', 'Sunflora', 'Sunnydra', 'Luvdisc',
  'Shorelorn', 'Cryscross', 'Cryogonal', 'Wolfman', 'Warwolf',
  'Corsola', 'Coralya', 'Solacor', 'Dunsparce', 'Dunymph',
  'Dunrago', 'Titaneon', 'Nimbeon', 'Trantima', 'Girafarig',
  'Gireamer', 'Nitmarig', 'Stantler', 'Moosid', 'Egoelk',
  'Suprago', 'Timberry', 'Howliage', 'Botanine', 'Dampurr',
  'Rainther', 'Delugar', 'Bonfur', 'Tindursa', 'Sizzly',
  'Saurky', 'Crestaka', 'Avipex', 'Lollybog', 'Brewtrid',
  'Forbiddron', 'Plushion', 'Rocotton', 'Tuffettry', 'Raskit',
  'Scruffian', 'Dynabit', 'Pompet', 'Pomprim', 'Droopig',
  'Hoolihog', 'Kankwart', 'Kankryst', 'Kankersaur', 'Impurp',
  'Nymfusha', 'Smoald', 'Bombustoad', 'Sligment', 'Viscolor'
];

const sql = [];

icons.forEach((img, i) => {
  const url = img.src;
  const id = url.split('/mons/icons/')[1]?.split('.webp')[0];
  
  if (id && i < names.length) {
    const name = names[i];
    const frontUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${id}.webp?t=26`;
    const escapedName = name.replace(/'/g, "''");
    sql.push(`UPDATE creature_types SET image_url = '${frontUrl}' WHERE name = '${escapedName}';`);
    console.log(`${i + 1}. ${name} → ${id}`);
  }
});

console.log('\n=== SQL UPDATES ===\n');
sql.forEach(s => console.log(s));
console.log('\nTotal:', sql.length);
```

### Option 2: Use Auto-Scroll Script

Run the `GET_REMAINING_SPRITES.js` script which will automatically scroll and extract all sprites.

### Option 3: Manual Extraction

If the page only shows 51 creatures, you may need to:
1. Check if there are multiple pages
2. Look for a "Load More" button
3. Check the collection URL for pagination

## Missing Creatures (After Corsola)

Based on the creature list, these should come after Corsola:
- Coralya (52)
- Solacor (53)
- Dunsparce (54)
- Dunymph (55)
- ... and 45 more

## After Getting All Sprites

1. **Run the SQL file**: `UPDATE_SPRITE_URLS_51.sql` in Supabase SQL Editor
2. **Get the remaining sprites** using one of the methods above
3. **Create a new SQL file** with the remaining UPDATE statements
4. **Run that SQL file** in Supabase
5. **Test in your app**: Generate spawns and verify sprites load correctly

## Verify Updates

After running the SQL, verify with:

```sql
SELECT name, image_url 
FROM creature_types 
WHERE image_url LIKE '%pokengine.b-cdn.net%' 
ORDER BY name;
```

You should see all 100 creatures with valid URLs (no `{SPRITE_ID}` placeholders).

