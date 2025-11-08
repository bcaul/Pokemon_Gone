// EXTRACT SPRITE IDs FROM ICONS - The page uses /icons/ not /fronts/
// Make sure you're on: https://pokengine.org/collections/107s7x9x/Mongratis?icons

const images = Array.from(document.querySelectorAll('img'));
const iconImages = images.filter(img => {
  const src = img.src || '';
  return src.includes('pokengine.b-cdn.net') && 
         src.includes('/mons/icons/') && 
         !src.includes('favicon') &&
         !src.includes('collections/icons') &&
         !src.includes('unknown');
});

console.log('Found', iconImages.length, 'creature icon images\n');

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
const results = [];

// Extract sprite IDs from icon URLs and create front URLs
iconImages.forEach((img, index) => {
  const url = img.src;
  
  // Extract sprite ID from icon URL
  // Pattern: https://pokengine.b-cdn.net/play/images/mons/icons/00xjjwow.webp?t=27
  // We need: https://pokengine.b-cdn.net/play/images/mons/fronts/00xjjwow.webp?t=26
  let spriteId = null;
  
  if (url.includes('/mons/icons/')) {
    const parts = url.split('/mons/icons/');
    if (parts.length === 2) {
      spriteId = parts[1].split('.webp')[0].split('?')[0];
    }
  }
  
  if (spriteId && index < names.length) {
    const name = names[index];
    const frontUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
    
    results.push({
      index: index + 1,
      name: name,
      spriteId: spriteId,
      iconUrl: url,
      frontUrl: frontUrl
    });
    
    // Generate SQL update
    const escapedName = name.replace(/'/g, "''");
    const sql = `UPDATE creature_types SET image_url = '${frontUrl}' WHERE name = '${escapedName}';`;
    sqlUpdates.push(sql);
    
    console.log(`${(index + 1).toString().padStart(3)}. ${name.padEnd(20)} → ${spriteId}`);
  } else if (spriteId) {
    console.warn(`Skipped index ${index + 1}: spriteId=${spriteId}, no matching name`);
  } else {
    console.warn(`Could not extract sprite ID from: ${url}`);
  }
});

console.log('\n=== SQL UPDATE STATEMENTS ===\n');
sqlUpdates.forEach(sql => console.log(sql));

console.log('\n=== SUMMARY ===');
console.log('Total icons found:', iconImages.length);
console.log('SQL updates generated:', sqlUpdates.length);

// Try to copy to clipboard
const fullSQL = sqlUpdates.join('\n');
if (navigator.clipboard && sqlUpdates.length > 0) {
  navigator.clipboard.writeText(fullSQL).then(() => {
    console.log('\n✅ SQL copied to clipboard!');
    console.log('Paste into Supabase SQL Editor and run.');
  }).catch(err => {
    console.log('\n⚠️ Could not copy to clipboard. Please copy manually.');
  });
}

// Show first few results for verification
console.log('\n=== FIRST 5 RESULTS (for verification) ===');
results.slice(0, 5).forEach(r => {
  console.log(`${r.name}: ${r.frontUrl}`);
});

// Return data
return {
  results: results,
  sql: fullSQL,
  count: sqlUpdates.length
};

