/**
 * Script to extract sprite IDs from Pokengine collection page
 * 
 * Instructions:
 * 1. Open https://pokengine.org/collections/107s7x9x/Mongratis?icons
 * 2. Open browser console (F12)
 * 3. Paste this script and run it
 * 4. Copy the output and use it to update the database
 */

// Extract sprite URLs and map to creature names
function extractSpriteMapping() {
  const mapping = {}
  
  // Find all images on the page
  const images = document.querySelectorAll('img[src*="pokengine.b-cdn.net"]')
  
  images.forEach((img, index) => {
    const url = img.src
    // Extract sprite ID from URL: https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26
    const match = url.match(/fronts\/([^\.]+)\.webp/)
    
    if (match) {
      const spriteId = match[1]
      
      // Try to get creature name from various sources
      let name = img.alt || 
                 img.title || 
                 img.getAttribute('data-name') ||
                 img.closest('[data-creature-name]')?.getAttribute('data-creature-name') ||
                 `Creature_${index + 1}`
      
      // Clean up name
      name = name.trim()
      
      mapping[name] = {
        spriteId: spriteId,
        url: url,
        index: index + 1
      }
      
      console.log(`${index + 1}. ${name}: ${spriteId}`)
    }
  })
  
  return mapping
}

// Alternative: Extract from page structure if names are in nearby elements
function extractWithNames() {
  const mapping = {}
  const containers = document.querySelectorAll('[class*="creature"], [class*="mon"], [class*="sprite"]')
  
  containers.forEach((container, index) => {
    const img = container.querySelector('img[src*="pokengine.b-cdn.net"]')
    if (!img) return
    
    const url = img.src
    const match = url.match(/fronts\/([^\.]+)\.webp/)
    if (!match) return
    
    const spriteId = match[1]
    
    // Look for name in nearby text elements
    const nameElement = container.querySelector('[class*="name"], h1, h2, h3, .title, [data-name]')
    const name = nameElement?.textContent?.trim() || 
                 img.alt || 
                 `Creature_${index + 1}`
    
    mapping[name] = {
      spriteId: spriteId,
      url: url
    }
    
    console.log(`${name}: ${spriteId}`)
  })
  
  return mapping
}

// Generate SQL update statements
function generateSQLUpdates(mapping) {
  console.log('\n=== SQL UPDATE STATEMENTS ===\n')
  
  Object.entries(mapping).forEach(([name, data]) => {
    // Escape single quotes in name for SQL
    const escapedName = name.replace(/'/g, "''")
    console.log(`UPDATE creature_types SET image_url = '${data.url}' WHERE name = '${escapedName}';`)
  })
}

// Run extraction
console.log('=== EXTRACTING SPRITE MAPPINGS ===\n')
const mapping = extractSpriteMapping()

if (Object.keys(mapping).length === 0) {
  console.log('No sprites found with first method. Trying alternative...\n')
  const altMapping = extractWithNames()
  if (Object.keys(altMapping).length > 0) {
    generateSQLUpdates(altMapping)
  }
} else {
  generateSQLUpdates(mapping)
}

// Also output as JSON for easy reference
console.log('\n=== JSON MAPPING ===\n')
console.log(JSON.stringify(mapping, null, 2))

// Copy to clipboard helper (if supported)
if (navigator.clipboard) {
  const sqlStatements = Object.entries(mapping)
    .map(([name, data]) => {
      const escapedName = name.replace(/'/g, "''")
      return `UPDATE creature_types SET image_url = '${data.url}' WHERE name = '${escapedName}';`
    })
    .join('\n')
  
  navigator.clipboard.writeText(sqlStatements).then(() => {
    console.log('\n✅ SQL statements copied to clipboard!')
  }).catch(err => {
    console.log('\n⚠️ Could not copy to clipboard:', err)
  })
}

