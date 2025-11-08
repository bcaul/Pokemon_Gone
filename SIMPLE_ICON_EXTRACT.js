// SIMPLE VERSION - Extract sprite IDs from icon URLs
// Copy this entire block into browser console

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
  // Extract ID from: /mons/icons/00xjjwow.webp
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

// Copy to clipboard
if (navigator.clipboard && sql.length > 0) {
  navigator.clipboard.writeText(sql.join('\n')).then(() => {
    console.log('✅ Copied to clipboard!');
  });
}

