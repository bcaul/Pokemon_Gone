// GET REMAINING SPRITES - Scroll to load all images first
// Instructions:
// 1. Go to: https://pokengine.org/collections/107s7x9x/Mongratis?icons
// 2. Scroll to the BOTTOM of the page to load all images (wait for loading to finish)
// 3. Run this script

// Scroll to bottom to trigger lazy loading
console.log('Scrolling to load all images...');
let scrollCount = 0;
const scrollInterval = setInterval(() => {
  window.scrollTo(0, document.body.scrollHeight);
  scrollCount++;
  
  if (scrollCount > 10) {
    clearInterval(scrollInterval);
    console.log('Finished scrolling. Waiting 3 seconds for images to load...');
    
    setTimeout(() => {
      extractAllSprites();
    }, 3000);
  }
}, 500);

function extractAllSprites() {
  const images = Array.from(document.querySelectorAll('img'));
  const icons = images.filter(img => {
    const src = img.src;
    return src.includes('pokengine.b-cdn.net') && 
           src.includes('/mons/icons/') && 
           !src.includes('favicon') && 
           !src.includes('collections') &&
           !src.includes('unknown');
  });

  console.log('Found', icons.length, 'total creature icons\n');

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

  console.log('\n=== ALL SQL UPDATES ===\n');
  sql.forEach(s => console.log(s));
  console.log('\nTotal:', sql.length, 'out of', names.length);

  // Show which creatures are missing
  if (sql.length < names.length) {
    console.log('\n=== MISSING CREATURES ===');
    const foundNames = sql.map(s => {
      const match = s.match(/WHERE name = '([^']+)'/);
      return match ? match[1] : null;
    });
    names.forEach((name, i) => {
      if (!foundNames.includes(name)) {
        console.log(`${i + 1}. ${name} - MISSING`);
      }
    });
  }
}

