// FIXED EXTRACTION SCRIPT - Copy this entire block into browser console
// Make sure you're on: https://pokengine.org/collections/107s7x9x/Mongratis?icons

(function() {
  console.log('=== EXTRACTING SPRITE IDs ===\n');
  
  // Find all images
  const allImages = document.querySelectorAll('img');
  console.log('Total images on page:', allImages.length);
  
  // Filter for Pokengine CDN images
  const spriteImages = Array.from(allImages).filter(img => {
    const src = img.src || img.getAttribute('src') || '';
    return src.includes('pokengine.b-cdn.net') && src.includes('fronts');
  });
  
  console.log('Pokengine sprite images found:', spriteImages.length);
  
  if (spriteImages.length === 0) {
    console.error('No sprite images found!');
    console.log('Checking all image sources...');
    allImages.forEach((img, i) => {
      if (i < 10) console.log(`Image ${i}:`, img.src);
    });
    return;
  }
  
  // List of creature names in order (100 total)
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
  
  // Process each image
  spriteImages.forEach((img, index) => {
    try {
      const url = img.src || img.getAttribute('src') || '';
      
      if (!url) {
        console.warn(`Image ${index + 1} has no src`);
        return;
      }
      
      // Extract sprite ID from URL
      // Pattern: https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26
      const match = url.match(/fronts\/([^\/\.]+)\.webp/);
      
      if (!match) {
        console.warn(`Image ${index + 1} URL doesn't match pattern:`, url);
        return;
      }
      
      const spriteId = match[1];
      const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
      
      // Get creature name (use index to match with creatureNames array)
      const name = index < creatureNames.length ? creatureNames[index] : `Creature_${index + 1}`;
      
      results.push({
        index: index + 1,
        name: name,
        spriteId: spriteId,
        url: fullUrl
      });
      
      // Generate SQL update
      const escapedName = name.replace(/'/g, "''");
      sqlUpdates.push(`UPDATE creature_types SET image_url = '${fullUrl}' WHERE name = '${escapedName}';`);
      
      console.log(`${(index + 1).toString().padStart(3)}. ${name.padEnd(20)} → ${spriteId}`);
      
    } catch (error) {
      console.error(`Error processing image ${index + 1}:`, error);
    }
  });
  
  console.log(`\n✅ Processed ${results.length} sprites\n`);
  
  // Output SQL statements
  if (sqlUpdates.length > 0) {
    console.log('=== SQL UPDATE STATEMENTS ===');
    console.log('-- Copy these and run in Supabase SQL Editor:\n');
    sqlUpdates.forEach(sql => console.log(sql));
    console.log('\n');
    
    // Combine into single string
    const sqlText = sqlUpdates.join('\n');
    
    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sqlText).then(() => {
        console.log('✅ SQL statements copied to clipboard!');
      }).catch(err => {
        console.log('⚠️ Could not copy to clipboard. Please copy manually.');
      });
    }
    
    // Also log the full SQL text
    console.log('=== FULL SQL TEXT (copy this) ===');
    console.log(sqlText);
    
  } else {
    console.error('❌ No SQL updates generated!');
    console.log('Debug info:');
    console.log('Results array:', results);
    console.log('Sample image URLs:');
    spriteImages.slice(0, 5).forEach((img, i) => {
      console.log(`  ${i + 1}.`, img.src);
    });
  }
  
  return {
    results: results,
    sql: sqlUpdates.join('\n'),
    count: results.length
  };
})();

