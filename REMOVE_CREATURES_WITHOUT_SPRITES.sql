-- Remove all creatures that don't have valid sprite URLs
-- This will keep only creatures with working Pokengine sprites

-- Step 1: Identify creatures without valid sprites
-- These are creatures where:
-- - image_url is NULL
-- - image_url contains placeholder {SPRITE_ID}
-- - image_url doesn't contain pokengine.b-cdn.net

-- Step 2: Delete catches for creatures without sprites
DELETE FROM catches
WHERE creature_type_id IN (
  SELECT id FROM creature_types
  WHERE image_url IS NULL 
     OR image_url LIKE '%{SPRITE_ID}%'
     OR image_url NOT LIKE '%pokengine.b-cdn.net%'
);

-- Step 3: Delete spawns for creatures without sprites
DELETE FROM spawns
WHERE creature_type_id IN (
  SELECT id FROM creature_types
  WHERE image_url IS NULL 
     OR image_url LIKE '%{SPRITE_ID}%'
     OR image_url NOT LIKE '%pokengine.b-cdn.net%'
);

-- Step 4: Delete the creatures themselves
DELETE FROM creature_types
WHERE image_url IS NULL 
   OR image_url LIKE '%{SPRITE_ID}%'
   OR image_url NOT LIKE '%pokengine.b-cdn.net%';

-- Step 5: Verify - should only show creatures with valid sprites
SELECT 
  COUNT(*) as total_creatures_with_sprites,
  COUNT(*) FILTER (WHERE image_url LIKE '%pokengine.b-cdn.net%') as with_pokengine_sprites
FROM creature_types;

-- Show all remaining creatures (should all have sprites)
SELECT name, rarity, type, image_url
FROM creature_types
ORDER BY 
  CASE rarity
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END,
  name;
