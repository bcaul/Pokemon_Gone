// ============================================
// EXTRACT POKENGINE SPRITE IDs - COPY THIS ENTIRE SCRIPT
// ============================================
// Instructions:
// 1. Go to: https://pokengine.org/collections/107s7x9x/Mongratis?icons
// 2. Open browser console (F12)
// 3. Paste this ENTIRE script
// 4. Press Enter
// 5. Copy the SQL output
// ============================================

(function() {
  console.log('=== EXTRACTING POKENGINE SPRITE IDs ===\n');
  
  // Find all images with Pokengine CDN URLs
  const images = Array.from(document.querySelectorAll('img'));
  const spriteImages = images.filter(img => img.src && img.src.includes('pokengine.b-cdn.net') && img.src.includes('fronts'));
  
  console.log(`Found ${spriteImages.length} sprite images\n`);
  
  if (spriteImages.length === 0) {
    console.error('❌ No sprite images found!');
    console.log('Make sure you are on: https://pokengine.org/collections/107s7x9x/Mongratis?icons');
    return;
  }
  
  // List of all 100 creature names in order (as they appear on the page)
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
  
  const results = [];
  const sqlUpdates = [];
  
  // Extract sprite IDs from images
  spriteImages.forEach((img, index) => {
    const url = img.src;
    
    // Extract sprite ID from URL
    // URL format: https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26
    const match = url.match(/fronts\/([^\.]+)\.webp/);
    
    if (match) {
      const spriteId = match[1];
      const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
      
      // Get creature name (try multiple methods)
      let name = null;
      
      // Method 1: Check img alt/title
      if (img.alt) name = img.alt.trim();
      if (!name && img.title) name = img.title.trim();
      
      // Method 2: Check data attributes
      if (!name) {
        name = img.getAttribute('data-name') || 
               img.getAttribute('data-creature') ||
               img.closest('[data-name]')?.getAttribute('data-name');
      }
      
      // Method 3: Look for name in nearby elements
      if (!name) {
        const container = img.closest('div, li, article, section, td');
        if (container) {
          const nameEl = container.querySelector('h1, h2, h3, h4, .name, [class*="name"], [class*="title"], strong, b');
          if (nameEl) {
            name = nameEl.textContent.trim();
          }
        }
      }
      
      // Method 4: Use index to match with creatureNames array (if order matches)
      if (!name && index < creatureNames.length) {
        name = creatureNames[index];
      }
      
      // Method 5: Fallback to index
      if (!name) {
        name = `Creature_${index + 1}`;
      }
      
      // Clean up name
      name = name.replace(/\s+/g, ' ').trim();
      
      results.push({
        index: index + 1,
        name: name,
        spriteId: spriteId,
        url: fullUrl
      });
      
      // Generate SQL update statement
      const escapedName = name.replace(/'/g, "''");
      sqlUpdates.push(`UPDATE creature_types SET image_url = '${fullUrl}' WHERE name = '${escapedName}';`);
      
      console.log(`${index + 1}. ${name.padEnd(20)} → ${spriteId}`);
    }
  });
  
  console.log(`\n✅ Extracted ${results.length} sprite IDs\n`);
  
  // Output SQL statements
  console.log('=== SQL UPDATE STATEMENTS ===');
  console.log('-- Copy the following and run in Supabase SQL Editor:\n');
  console.log(sqlUpdates.join('\n'));
  
  // Also output as JSON
  console.log('\n=== JSON MAPPING ===');
  console.log(JSON.stringify(results.map(r => ({
    name: r.name,
    spriteId: r.spriteId,
    url: r.url
  })), null, 2));
  
  // Try to copy SQL to clipboard
  if (navigator.clipboard) {
    const sqlText = sqlUpdates.join('\n');
    navigator.clipboard.writeText(sqlText).then(() => {
      console.log('\n✅ SQL statements copied to clipboard!');
      console.log('Paste them into Supabase SQL Editor.');
    }).catch(err => {
      console.log('\n⚠️ Could not copy to clipboard. Please copy manually.');
    });
  }
  
  // Return results for manual inspection
  return {
    results: results,
    sql: sqlUpdates.join('\n'),
    count: results.length
  };
})();

