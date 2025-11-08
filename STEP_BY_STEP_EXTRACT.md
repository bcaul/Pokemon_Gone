# Step-by-Step: Extract Sprite IDs

## The Problem
The script found 98 images but didn't generate SQL updates. This usually means the URLs aren't matching the expected pattern.

## Solution: Debug First, Then Extract

### Step 1: Debug What's on the Page

Run this **first** to see what's actually on the page:

```javascript
// DEBUG SCRIPT - Run this first
const allImages = Array.from(document.querySelectorAll('img'));
console.log('Total images:', allImages.length);

const pokengineImages = allImages.filter(img => img.src && img.src.includes('pokengine'));
console.log('Pokengine images:', pokengineImages.length);

// Show first 5 URLs
pokengineImages.slice(0, 5).forEach((img, i) => {
  console.log(`${i + 1}.`, img.src);
});
```

**Look at the output** - what do the URLs look like?

### Step 2: Extract Based on Actual URLs

Once you see the URL format, use this script:

```javascript
// EXTRACTION SCRIPT - Adjust based on actual URL format
const images = Array.from(document.querySelectorAll('img'));
const spriteImages = images.filter(img => {
  const src = img.src || '';
  return src.includes('pokengine.b-cdn.net') && src.includes('fronts');
});

console.log('Found', spriteImages.length, 'sprite images\n');

// Creature names in order (100 total)
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

const sqlUpdates = [];

spriteImages.forEach((img, index) => {
  const url = img.src;
  
  // Try multiple extraction methods
  let spriteId = null;
  
  // Method 1: Split by /fronts/
  if (url.includes('/fronts/')) {
    const parts = url.split('/fronts/');
    if (parts[1]) {
      spriteId = parts[1].split('.webp')[0].split('?')[0];
    }
  }
  
  // Method 2: Regex
  if (!spriteId) {
    const match = url.match(/fronts\/([^\/\.\?]+)/);
    if (match) spriteId = match[1];
  }
  
  if (spriteId && index < names.length) {
    const name = names[index];
    const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
    const escapedName = name.replace(/'/g, "''");
    sqlUpdates.push(`UPDATE creature_types SET image_url = '${fullUrl}' WHERE name = '${escapedName}';`);
    console.log(`${index + 1}. ${name} → ${spriteId}`);
  } else {
    console.warn(`Skipped ${index + 1}: spriteId=${spriteId}, name=${names[index]}`);
  }
});

console.log('\n=== SQL UPDATES ===\n');
sqlUpdates.forEach(sql => console.log(sql));
```

### Step 3: Manual Check

If the script still doesn't work, manually check a few images:

1. Right-click on the first sprite
2. Inspect the image
3. Look at the `src` attribute
4. What does the URL look like?

### Step 4: Alternative - Extract All URLs

If names don't match, just extract all sprite IDs and match manually:

```javascript
const images = Array.from(document.querySelectorAll('img[src*="pokengine.b-cdn.net"]'));
const spriteIds = [];

images.forEach(img => {
  const url = img.src;
  if (url.includes('/fronts/')) {
    const parts = url.split('/fronts/');
    if (parts[1]) {
      const id = parts[1].split('.webp')[0].split('?')[0];
      spriteIds.push(id);
      console.log(spriteIds.length, id);
    }
  }
});

console.log('\nTotal sprite IDs:', spriteIds.length);
console.log('Sprite IDs:', spriteIds.join(', '));
```

Then manually create UPDATE statements matching IDs to creature names.

## Expected Output

You should see:
```
1. Geckrow → 0016spl5
2. Goanopy → xxxxxxx
...
```

Followed by SQL UPDATE statements.

## If Still Not Working

Share:
1. The output from the debug script
2. A sample image URL (right-click → Inspect → copy src)
3. What you see in the console

Then I can create a custom script for your specific case!

