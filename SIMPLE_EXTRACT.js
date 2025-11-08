// SIMPLE SCRIPT - Just copy and paste this into browser console
// Make sure you're on: https://pokengine.org/collections/107s7x9x/Mongratis?icons

const images = document.querySelectorAll('img[src*="pokengine.b-cdn.net"]');
const updates = [];

console.log('Found', images.length, 'sprite images\n');

images.forEach((img, i) => {
  const url = img.src;
  const match = url.match(/fronts\/([^\.]+)\.webp/);
  if (match) {
    const spriteId = match[1];
    const fullUrl = `https://pokengine.b-cdn.net/play/images/mons/fronts/${spriteId}.webp?t=26`;
    
    // Try to get name
    let name = img.alt || img.title || `Creature_${i + 1}`;
    
    // Look in parent elements
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

