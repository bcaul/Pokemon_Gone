-- Update all creature sprite URLs with Pokengine CDN pattern
-- Format: https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID}.webp?t=26
-- 
-- INSTRUCTIONS:
-- 1. Visit https://pokengine.org/collections/107s7x9x/Mongratis?icons
-- 2. Run the EXTRACT_SPRITE_IDS.js script in browser console
-- 3. Copy the generated UPDATE statements below
-- 4. Replace the placeholders with actual sprite IDs
-- 5. Run this file in Supabase SQL Editor

-- Example (replace {SPRITE_ID} with actual IDs):
-- UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26' WHERE name = 'Geckrow';
-- UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID}.webp?t=26' WHERE name = 'Goanopy';

-- TODO: Add UPDATE statements for all 100 creatures below:

-- Common creatures (40)
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/fronts/0016spl5.webp?t=26' WHERE name = 'Geckrow';
-- Add remaining 39 common creatures...

-- Uncommon creatures (30)
-- Add 30 uncommon creatures...

-- Rare creatures (20)
-- Add 20 rare creatures...

-- Epic creatures (8)
-- Add 8 epic creatures...

-- Legendary creatures (2)
-- Add 2 legendary creatures...

-- Verify updates
SELECT name, image_url 
FROM creature_types 
WHERE image_url LIKE '%pokengine.b-cdn.net%'
ORDER BY name;

-- Check for missing or placeholder URLs
SELECT name, image_url 
FROM creature_types 
WHERE image_url IS NULL 
   OR image_url LIKE '%{SPRITE_ID}%'
   OR image_url NOT LIKE '%pokengine.b-cdn.net%'
ORDER BY name;

