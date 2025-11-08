// DEBUG SCRIPT - Run this first to see what's on the page
// Copy this into browser console on the Pokengine page

console.log('=== DEBUGGING POKENGINE PAGE ===\n');

// Check all images
const allImages = document.querySelectorAll('img');
console.log('Total images:', allImages.length);

// Check for Pokengine images
const pokengineImages = Array.from(allImages).filter(img => {
  const src = img.src || '';
  return src.includes('pokengine');
});

console.log('Pokengine images:', pokengineImages.length);

// Show first 10 image URLs
console.log('\n=== FIRST 10 IMAGE URLs ===');
pokengineImages.slice(0, 10).forEach((img, i) => {
  console.log(`${i + 1}.`, img.src);
});

// Check for CDN images
const cdnImages = Array.from(allImages).filter(img => {
  const src = img.src || '';
  return src.includes('pokengine.b-cdn.net') && src.includes('fronts');
});

console.log('\n=== CDN FRONT SPRITE IMAGES ===');
console.log('Count:', cdnImages.length);

// Show first 10 CDN URLs
cdnImages.slice(0, 10).forEach((img, i) => {
  const url = img.src;
  const match = url.match(/fronts\/([^\.]+)\.webp/);
  if (match) {
    console.log(`${i + 1}.`, match[1], '→', url);
  } else {
    console.log(`${i + 1}.`, 'NO MATCH →', url);
  }
});

// Check page structure
console.log('\n=== PAGE STRUCTURE ===');
const containers = document.querySelectorAll('[class*="creature"], [class*="mon"], [class*="sprite"], [class*="icon"]');
console.log('Potential creature containers:', containers.length);

// Check if images are in a grid/list
const grid = document.querySelector('[class*="grid"], [class*="list"], [class*="collection"]');
if (grid) {
  console.log('Found grid/list container');
  const gridImages = grid.querySelectorAll('img');
  console.log('Images in grid:', gridImages.length);
}

