/**
 * Simple script to extract sprite IDs from Pokengine collection page
 * 
 * INSTRUCTIONS:
 * 1. Go to: https://pokengine.org/collections/107s7x9x/Mongratis?icons
 * 2. Open browser console (F12)
 * 3. Paste and run this script
 * 4. Copy the output SQL statements
 * 5. Run them in Supabase SQL Editor
 */

// Method 1: Extract from all images on the page
function extractSpriteIds() {
  const images = Array.from(document.querySelectorAll('img[src*="pokengine.b-cdn.net"]'));
  const results = [];
  
  console.log(`Found ${images.length} sprite images\n`);
  console.log('=== SPRITE ID EXTRACTION ===\n');
  
  images.forEach((img, index) => {
    const url = img.src;
    // Extract sprite ID: https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26
    const match = url.match(/fronts\/([^\.]+)\.webp/);
    
    if (match) {
      const spriteId = match[1];
      const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
      
      // Try to get creature name - you may need to adjust selectors based on page structure
      let name = img.alt || 
                 img.title || 
                 img.getAttribute('data-name') ||
                 img.closest('[data-creature]')?.getAttribute('data-creature') ||
                 null;
      
      // If name not found, try to find it in nearby elements
      if (!name) {
        const container = img.closest('div, li, article, section');
        if (container) {
          const nameElement = container.querySelector('h1, h2, h3, .name, [class*="name"], [class*="title"]');
          name = nameElement?.textContent?.trim() || null;
        }
      }
      
      results.push({
        index: index + 1,
        spriteId: spriteId,
        url: fullUrl,
        name: name || `Unknown_${index + 1}`,
        imgElement: img
      });
      
      console.log(`${index + 1}. ${name || 'Unknown'}: ${spriteId}`);
      console.log(`   URL: ${fullUrl}\n`);
    }
  });
  
  return results;
}

// Method 2: Try to match with creature names from the list
function matchWithCreatureNames(results) {
  // List of all 100 creature names in order (from the collection page)
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
  
  // Match results with names (assuming order matches)
  results.forEach((result, index) => {
    if (index < creatureNames.length && !result.name || result.name.startsWith('Unknown')) {
      result.name = creatureNames[index];
    }
  });
  
  return results;
}

// Generate SQL UPDATE statements
function generateSQLUpdates(results) {
  console.log('\n=== SQL UPDATE STATEMENTS ===\n');
  console.log('-- Copy and run these in Supabase SQL Editor\n');
  
  const updates = results.map(result => {
    // Escape single quotes in name for SQL
    const escapedName = result.name.replace(/'/g, "''");
    return `UPDATE creature_types SET image_url = '${result.url}' WHERE name = '${escapedName}';`;
  });
  
  updates.forEach(update => console.log(update));
  
  return updates.join('\n');
}

// Main execution
console.log('Starting sprite ID extraction...\n');
const results = extractSpriteIds();

if (results.length === 0) {
  console.error('No sprites found! Make sure you are on the Pokengine collection page.');
} else {
  // Try to match with creature names
  const matchedResults = matchWithCreatureNames(results);
  
  // Generate SQL
  const sqlStatements = generateSQLUpdates(matchedResults);
  
  // Try to copy to clipboard
  if (navigator.clipboard && sqlStatements) {
    navigator.clipboard.writeText(sqlStatements).then(() => {
      console.log('\n✅ SQL statements copied to clipboard!');
      console.log('Paste them into Supabase SQL Editor to update sprite URLs.');
    }).catch(err => {
      console.log('\n⚠️ Could not copy to clipboard. Please copy the SQL statements manually.');
    });
  }
  
  // Also output as JSON for reference
  console.log('\n=== JSON MAPPING (for reference) ===\n');
  console.log(JSON.stringify(matchedResults.map(r => ({
    name: r.name,
    spriteId: r.spriteId,
    url: r.url
  })), null, 2));
}

