// WORKING EXTRACTION SCRIPT - This should work!
// Make sure you're on: https://pokengine.org/collections/107s7x9x/Mongratis?icons

// Step 1: Find all images with Pokengine CDN URLs
const allImages = Array.from(document.querySelectorAll('img'));
const spriteImages = allImages.filter(img => {
  const src = img.src || '';
  return src.includes('pokengine.b-cdn.net') && src.includes('/fronts/');
});

console.log('Found', spriteImages.length, 'sprite images\n');

// Step 2: Extract sprite IDs
const spriteData = [];

spriteImages.forEach((img, index) => {
  const url = img.src;
  
  // Extract sprite ID: fronts/0016spl5.webp
  const parts = url.split('/fronts/');
  if (parts.length === 2) {
    const spriteId = parts[1].split('.webp')[0];
    const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
    
    spriteData.push({
      index: index,
      spriteId: spriteId,
      url: fullUrl
    });
    
    console.log(`${index + 1}. ${spriteId}`);
  }
});

// Step 3: Match with creature names (100 total in order)
const creatureNames = [
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

// Step 4: Generate SQL updates
console.log('\n=== SQL UPDATE STATEMENTS ===\n');

const sqlStatements = [];

spriteData.forEach((data, index) => {
  if (index < creatureNames.length) {
    const name = creatureNames[index];
    const escapedName = name.replace(/'/g, "''");
    const sql = `UPDATE creature_types SET image_url = '${data.url}' WHERE name = '${escapedName}';`;
    sqlStatements.push(sql);
    console.log(`${index + 1}. ${name.padEnd(20)} → ${data.spriteId}`);
  }
});

console.log('\n=== COPY THESE SQL STATEMENTS ===\n');
sqlStatements.forEach(sql => console.log(sql));

// Step 5: Try to copy to clipboard
const fullSQL = sqlStatements.join('\n');
if (navigator.clipboard) {
  navigator.clipboard.writeText(fullSQL).then(() => {
    console.log('\n✅ SQL copied to clipboard!');
  });
}

// Return data for inspection
console.log('\n=== SUMMARY ===');
console.log('Total sprites found:', spriteData.length);
console.log('SQL statements generated:', sqlStatements.length);

