-- Complete solution: Update 51 creatures with sprites AND remove the other 49
-- Run this entire script to keep only the 51 fakemon with Pokengine sprites

-- Step 1: Update the 51 creatures with Pokengine sprite URLs
-- NOTE: Using /icons/ instead of /fronts/ because sprite IDs were extracted from icons page
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00xjjwow.webp?t=26' WHERE name = 'Geckrow';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00gevuxu.webp?t=26' WHERE name = 'Goanopy';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00ptxzlq.webp?t=26' WHERE name = 'Varanitor';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/002qrwwn.webp?t=26' WHERE name = 'Hissiorite';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00rgw87i.webp?t=26' WHERE name = 'Cobarett';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00pqrglt.webp?t=26' WHERE name = 'Pythonova';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00whcgac.webp?t=26' WHERE name = 'Ninoala';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00vfbxmp.webp?t=26' WHERE name = 'Koaninja';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00qaw4vt.webp?t=26' WHERE name = 'Anu';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00w4ht43.webp?t=26' WHERE name = 'Merlicun';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00acorxf.webp?t=26' WHERE name = 'Firomenis';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00mi3mop.webp?t=26' WHERE name = 'Baoby';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/000kt6km.webp?t=26' WHERE name = 'Baobaraffe';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00rbkjox.webp?t=26' WHERE name = 'Nuenflu';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00t4jrnx.webp?t=26' WHERE name = 'Drashimi';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/009ghbgo.webp?t=26' WHERE name = 'Tsushimi';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/0088w5ay.webp?t=26' WHERE name = 'Tobishimi';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00vjdmsm.webp?t=26' WHERE name = 'Baulder';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/001291eg.webp?t=26' WHERE name = 'Dreadrock';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00s1rbp7.webp?t=26' WHERE name = 'Tekagon';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00ytz84z.webp?t=26' WHERE name = 'Nymbi';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/000jcvv9.webp?t=26' WHERE name = 'Deember';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00n7m78l.webp?t=26' WHERE name = 'Lavee';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00gyfbhn.webp?t=26' WHERE name = 'Lavare';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00u9jl5b.webp?t=26' WHERE name = 'Crator';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00vu9xqu.webp?t=26' WHERE name = 'Efflutal';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00rofohd.webp?t=26' WHERE name = 'Hayog';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/004bj9kp.webp?t=26' WHERE name = 'Hogouse';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00mtbpyt.webp?t=26' WHERE name = 'Hogriks';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00czwms2.webp?t=26' WHERE name = 'Webruiser';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/009f30og.webp?t=26' WHERE name = 'Pilfetch';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00gmc3cs.webp?t=26' WHERE name = 'Criminalis';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00ttay1v.webp?t=26' WHERE name = 'Pasturlo';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00jrih6k.webp?t=26' WHERE name = 'Brambull';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00yys19h.webp?t=26' WHERE name = 'Maizotaur';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00pt51k2.webp?t=26' WHERE name = 'Minamai';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/0033cq1k.webp?t=26' WHERE name = 'Marelstorm';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00di4vdx.webp?t=26' WHERE name = 'Spinarak';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/000os8g9.webp?t=26' WHERE name = 'Ariados';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00tqmnpz.webp?t=26' WHERE name = 'Torkoal';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/005izpgv.webp?t=26' WHERE name = 'Tormine';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00y73uy5.webp?t=26' WHERE name = 'Sunkern';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00ie8he1.webp?t=26' WHERE name = 'Sunflora';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00w927yf.webp?t=26' WHERE name = 'Sunnydra';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00nfmggx.webp?t=26' WHERE name = 'Luvdisc';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/0011n46k.webp?t=26' WHERE name = 'Shorelorn';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00j13n23.webp?t=26' WHERE name = 'Cryscross';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00vjb07z.webp?t=26' WHERE name = 'Cryogonal';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00v5mn4p.webp?t=26' WHERE name = 'Wolfman';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00mfujdo.webp?t=26' WHERE name = 'Warwolf';
UPDATE creature_types SET image_url = 'https://pokengine.b-cdn.net/play/images/mons/icons/00cwgrmf.webp?t=26' WHERE name = 'Corsola';

-- Step 2: Delete catches for creatures without sprites (to avoid foreign key violations)
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

-- Step 4: Delete creatures without valid sprite URLs
DELETE FROM creature_types
WHERE image_url IS NULL 
   OR image_url LIKE '%{SPRITE_ID}%'
   OR image_url NOT LIKE '%pokengine.b-cdn.net%';

-- Step 5: Verify - Should show exactly 51 creatures
SELECT 
  COUNT(*) as total_creatures,
  COUNT(*) FILTER (WHERE image_url LIKE '%pokengine.b-cdn.net%') as with_sprites
FROM creature_types;

-- Show all remaining creatures (should be exactly 51)
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

