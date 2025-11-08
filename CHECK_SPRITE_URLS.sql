-- Check what sprite URLs are currently in the database
-- Compare with what should be there based on Pokengine page

SELECT 
  name,
  image_url,
  CASE 
    WHEN image_url LIKE '%00xjjwow%' AND name = 'Geckrow' THEN '✓ Correct'
    WHEN image_url LIKE '%00gevuxu%' AND name = 'Goanopy' THEN '✓ Correct'
    WHEN image_url LIKE '%002y0esz%' AND name = 'Varanitor' THEN '✓ Correct'
    WHEN image_url LIKE '%00ptxzlq%' AND name = 'Hissiorite' THEN '✓ Correct'
    WHEN image_url LIKE '%002qrwwn%' AND name = 'Cobarett' THEN '✓ Correct'
    WHEN image_url LIKE '%00rgw87i%' AND name = 'Pythonova' THEN '✓ Correct'
    WHEN image_url LIKE '%00pqrglt%' AND name = 'Ninoala' THEN '✓ Correct'
    WHEN image_url LIKE '%00kohfok%' AND name = 'Koaninja' THEN '✓ Correct'
    WHEN image_url LIKE '%00whcgac%' AND name = 'Anu' THEN '✓ Correct'
    WHEN image_url LIKE '%00vfbxmp%' AND name = 'Merlicun' THEN '✓ Correct'
    WHEN image_url LIKE '%00w4ht43%' AND name = 'Baoby' THEN '✓ Correct'
    WHEN image_url LIKE '%00acorxf%' AND name = 'Baobaraffe' THEN '✓ Correct'
    WHEN image_url LIKE '%00mi3mop%' AND name = 'Nuenflu' THEN '✓ Correct'
    WHEN image_url LIKE '%000kt6km%' AND name = 'Drashimi' THEN '✓ Correct'
    WHEN image_url LIKE '%00rbkjox%' AND name = 'Tsushimi' THEN '✓ Correct'
    WHEN image_url LIKE '%00t4jrnx%' AND name = 'Tobishimi' THEN '✓ Correct'
    WHEN image_url LIKE '%009ghbgo%' AND name = 'Baulder' THEN '✓ Correct'
    WHEN image_url LIKE '%00czmr0r%' AND name = 'Dreadrock' THEN '✓ Correct'
    WHEN image_url LIKE '%00oemb2o%' AND name = 'Tekagon' THEN '✓ Correct'
    WHEN image_url LIKE '%0088w5ay%' AND name = 'Nymbi' THEN '✓ Correct'
    WHEN image_url LIKE '%008wb8sj%' AND name = 'Deember' THEN '✓ Correct'
    WHEN image_url LIKE '%00vjdmsm%' AND name = 'Lavee' THEN '✓ Correct'
    WHEN image_url LIKE '%001291eg%' AND name = 'Lavare' THEN '✓ Correct'
    WHEN image_url LIKE '%00s1rbp7%' AND name = 'Crator' THEN '✓ Correct'
    WHEN image_url LIKE '%00ytz84z%' AND name = 'Efflutal' THEN '✓ Correct'
    WHEN image_url LIKE '%00jtq3x2%' AND name = 'Hayog' THEN '✓ Correct'
    WHEN image_url LIKE '%00bspmsd%' AND name = 'Hogouse' THEN '✓ Correct'
    WHEN image_url LIKE '%00jegdpk%' AND name = 'Hogriks' THEN '✓ Correct'
    WHEN image_url LIKE '%00qwht05%' AND name = 'Webruiser' THEN '✓ Correct'
    WHEN image_url LIKE '%000jcvv9%' AND name = 'Pilfetch' THEN '✓ Correct'
    WHEN image_url LIKE '%00n7m78l%' AND name = 'Criminalis' THEN '✓ Correct'
    WHEN image_url LIKE '%00gyfbhn%' AND name = 'Pasturlo' THEN '✓ Correct'
    WHEN image_url LIKE '%00u9jl5b%' AND name = 'Brambull' THEN '✓ Correct'
    WHEN image_url LIKE '%00vu9xqu%' AND name = 'Maizotaur' THEN '✓ Correct'
    WHEN image_url LIKE '%00rofohd%' AND name = 'Minamai' THEN '✓ Correct'
    WHEN image_url LIKE '%004bj9kp%' AND name = 'Marelstorm' THEN '✓ Correct'
    WHEN image_url LIKE '%00mtbpyt%' AND name = 'Spinarak' THEN '✓ Correct'
    WHEN image_url LIKE '%00czwms2%' AND name = 'Ariados' THEN '✓ Correct'
    WHEN image_url LIKE '%009f30og%' AND name = 'Torkoal' THEN '✓ Correct'
    WHEN image_url LIKE '%00gmc3cs%' AND name = 'Tormine' THEN '✓ Correct'
    WHEN image_url LIKE '%00ttay1v%' AND name = 'Sunkern' THEN '✓ Correct'
    WHEN image_url LIKE '%00jrih6k%' AND name = 'Sunflora' THEN '✓ Correct'
    WHEN image_url LIKE '%00yys19h%' AND name = 'Sunnydra' THEN '✓ Correct'
    WHEN image_url LIKE '%00pt51k2%' AND name = 'Luvdisc' THEN '✓ Correct'
    WHEN image_url LIKE '%001kzlm1%' AND name = 'Shorelorn' THEN '✓ Correct'
    WHEN image_url LIKE '%00lp5xuj%' AND name = 'Cryscross' THEN '✓ Correct'
    WHEN image_url LIKE '%0033cq1k%' AND name = 'Cryogonal' THEN '✓ Correct'
    WHEN image_url LIKE '%002f46ds%' AND name = 'Wolfman' THEN '✓ Correct'
    WHEN image_url LIKE '%003foeh3%' AND name = 'Warwolf' THEN '✓ Correct'
    WHEN image_url LIKE '%00di4vdx%' AND name = 'Corsola' THEN '✓ Correct'
    ELSE '✗ Check mapping'
  END as status
FROM creature_types
WHERE image_url IS NOT NULL
ORDER BY name;

-- Also check for any creatures that should have sprites but don't
SELECT name, image_url
FROM creature_types
WHERE image_url IS NULL OR image_url LIKE '%{SPRITE_ID}%'
ORDER BY name;

