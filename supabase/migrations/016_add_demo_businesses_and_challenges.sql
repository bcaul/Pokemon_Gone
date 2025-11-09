-- ============================================================================
-- Demo Businesses and Challenges Migration
-- Creates prototype fake businesses and challenges for demo purposes
-- ============================================================================

-- First, allow NULL user_id for demo businesses (modify table if needed)
-- This will fail if the column is already nullable, so we ignore errors
DO $$
BEGIN
  -- Remove NOT NULL constraint if it exists
  ALTER TABLE businesses ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Column might already be nullable, which is fine
    NULL;
END $$;

-- Remove UNIQUE constraint on user_id to allow demo businesses without users
-- Demo businesses will have NULL user_id
-- First, update any existing demo businesses to have NULL user_id to avoid conflicts
UPDATE businesses 
SET user_id = NULL 
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

-- Remove UNIQUE constraint on user_id if it exists
-- This allows multiple demo businesses to have NULL user_id
DO $$
BEGIN
  -- Check if constraint exists and drop it
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conrelid = 'businesses'::regclass 
    AND conname = 'businesses_user_id_key'
  ) THEN
    ALTER TABLE businesses DROP CONSTRAINT businesses_user_id_key;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If constraint doesn't exist or has different name, that's fine
    RAISE NOTICE 'Could not drop businesses_user_id_key constraint: %', SQLERRM;
END $$;

-- Demo Business 1: GreenLeaf Cafe
-- Use NULL user_id for demo businesses (they don't need real user accounts)
DO $$
BEGIN
  INSERT INTO businesses (
    id, user_id, business_name, business_type, description, address, phone, email, website, active
  ) VALUES (
    '00000000-0000-0000-0000-000000000001',
    NULL, -- Demo businesses don't have user accounts
    'GreenLeaf Cafe',
    'cafe',
    'A cozy neighborhood cafe serving organic coffee and fresh pastries. Join us for your morning brew!',
    '123 Main Street, Manchester, M1 1AA',
    '+44 161 123 4567',
    'hello@greenleafcafe.co.uk',
    'https://greenleafcafe.co.uk',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    active = EXCLUDED.active,
    user_id = NULL; -- Always set to NULL for demo businesses
EXCEPTION
  WHEN unique_violation THEN
    -- If user_id constraint still exists and conflicts, update existing record
    UPDATE businesses 
    SET business_name = 'GreenLeaf Cafe',
        business_type = 'cafe',
        description = 'A cozy neighborhood cafe serving organic coffee and fresh pastries. Join us for your morning brew!',
        address = '123 Main Street, Manchester, M1 1AA',
        phone = '+44 161 123 4567',
        email = 'hello@greenleafcafe.co.uk',
        website = 'https://greenleafcafe.co.uk',
        active = true,
        user_id = NULL
    WHERE id = '00000000-0000-0000-0000-000000000001';
END $$;

-- Demo Business 2: Wild Adventures Outdoor Shop
DO $$
BEGIN
  INSERT INTO businesses (
    id, user_id, business_name, business_type, description, address, phone, email, website, active
  ) VALUES (
    '00000000-0000-0000-0000-000000000002',
    NULL, -- Demo businesses don't have user accounts
    'Wild Adventures Outdoor Shop',
    'shop',
    'Your one-stop shop for outdoor gear and adventure equipment. Get ready for your next expedition!',
    '456 High Street, Manchester, M2 2BB',
    '+44 161 234 5678',
    'info@wildadventures.co.uk',
    'https://wildadventures.co.uk',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    active = EXCLUDED.active,
    user_id = NULL; -- Always set to NULL for demo businesses
EXCEPTION
  WHEN unique_violation THEN
    UPDATE businesses 
    SET business_name = 'Wild Adventures Outdoor Shop',
        business_type = 'shop',
        description = 'Your one-stop shop for outdoor gear and adventure equipment. Get ready for your next expedition!',
        address = '456 High Street, Manchester, M2 2BB',
        phone = '+44 161 234 5678',
        email = 'info@wildadventures.co.uk',
        website = 'https://wildadventures.co.uk',
        active = true,
        user_id = NULL
    WHERE id = '00000000-0000-0000-0000-000000000002';
END $$;

-- Demo Business 3: Nature's Bounty Restaurant
DO $$
BEGIN
  INSERT INTO businesses (
    id, user_id, business_name, business_type, description, address, phone, email, website, active
  ) VALUES (
    '00000000-0000-0000-0000-000000000003',
    NULL, -- Demo businesses don't have user accounts
    'Nature''s Bounty Restaurant',
    'restaurant',
    'Farm-to-table dining experience featuring locally sourced ingredients and seasonal menus.',
    '789 Park Lane, Manchester, M3 3CC',
    '+44 161 345 6789',
    'reservations@naturesbounty.co.uk',
    'https://naturesbounty.co.uk',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    active = EXCLUDED.active,
    user_id = NULL; -- Always set to NULL for demo businesses
EXCEPTION
  WHEN unique_violation THEN
    UPDATE businesses 
    SET business_name = 'Nature''s Bounty Restaurant',
        business_type = 'restaurant',
        description = 'Farm-to-table dining experience featuring locally sourced ingredients and seasonal menus.',
        address = '789 Park Lane, Manchester, M3 3CC',
        phone = '+44 161 345 6789',
        email = 'reservations@naturesbounty.co.uk',
        website = 'https://naturesbounty.co.uk',
        active = true,
        user_id = NULL
    WHERE id = '00000000-0000-0000-0000-000000000003';
END $$;

-- Demo Business 4: The Wildlife Sanctuary
DO $$
BEGIN
  INSERT INTO businesses (
    id, user_id, business_name, business_type, description, address, phone, email, website, active
  ) VALUES (
    '00000000-0000-0000-0000-000000000004',
    NULL, -- Demo businesses don't have user accounts
    'The Wildlife Sanctuary',
    'attraction',
    'Educational wildlife center and nature reserve. Learn about local wildlife and conservation efforts.',
    '321 Nature Trail, Manchester, M4 4DD',
    '+44 161 456 7890',
    'contact@wildlifesanctuary.co.uk',
    'https://wildlifesanctuary.co.uk',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    active = EXCLUDED.active,
    user_id = NULL; -- Ensure demo businesses have NULL user_id
EXCEPTION
  WHEN unique_violation THEN
    -- If user_id constraint still exists and conflicts, update existing record
    UPDATE businesses 
    SET business_name = 'The Wildlife Sanctuary',
        business_type = 'attraction',
        description = 'Educational wildlife center and nature reserve. Learn about local wildlife and conservation efforts.',
        address = '321 Nature Trail, Manchester, M4 4DD',
        phone = '+44 161 456 7890',
        email = 'contact@wildlifesanctuary.co.uk',
        website = 'https://wildlifesanctuary.co.uk',
        active = true,
        user_id = NULL
    WHERE id = '00000000-0000-0000-0000-000000000004';
END $$;

-- Now create demo challenges for these businesses
-- Note: We need to get creature types first
DO $$
DECLARE
  v_geckrow_id INT;
  v_pythonova_id INT;
  v_anu_id INT;
  v_business1_id UUID := '00000000-0000-0000-0000-000000000001';
  v_business2_id UUID := '00000000-0000-0000-0000-000000000002';
  v_business3_id UUID := '00000000-0000-0000-0000-000000000003';
  v_business4_id UUID := '00000000-0000-0000-0000-000000000004';
  -- Manchester city center coordinates
  v_manchester_lat FLOAT := 53.4808;
  v_manchester_lon FLOAT := -2.2426;
BEGIN
  -- Get creature type IDs
  SELECT id INTO v_geckrow_id FROM creature_types WHERE name = 'Geckrow' LIMIT 1;
  SELECT id INTO v_pythonova_id FROM creature_types WHERE name = 'Pythonova' LIMIT 1;
  SELECT id INTO v_anu_id FROM creature_types WHERE name = 'Anu' LIMIT 1;
  
  -- If creatures don't exist, use first available creature
  IF v_geckrow_id IS NULL THEN
    SELECT id INTO v_geckrow_id FROM creature_types LIMIT 1;
  END IF;
  IF v_pythonova_id IS NULL THEN
    SELECT id INTO v_pythonova_id FROM creature_types LIMIT 1;
  END IF;
  IF v_anu_id IS NULL THEN
    SELECT id INTO v_anu_id FROM creature_types LIMIT 1;
  END IF;

  -- Demo Challenge 1: GreenLeaf Cafe - Catch 3 Creatures
  INSERT INTO challenges (
    id,
    name,
    description,
    challenge_type,
    target_value,
    target_creature_type_id,
    location,
    radius_meters,
    business_id,
    prize_description,
    reward_points,
    difficulty,
    active,
    expires_at,
    prize_expires_at
  ) VALUES (
    '10000000-0000-0000-0000-000000000001',
    'Cafe Creature Hunt',
    'Visit GreenLeaf Cafe and catch 3 creatures in the area. Perfect for a morning adventure with your coffee!',
    'collect',
    3,
    v_geckrow_id,
    ST_SetSRID(ST_MakePoint(v_manchester_lon + 0.001, v_manchester_lat + 0.001), 4326), -- Slightly offset for demo
    300,
    v_business1_id,
    'Free large coffee and pastry of your choice! Valid for 30 days.',
    200,
    'easy',
    true,
    (NOW() + INTERVAL '90 days'),
    (NOW() + INTERVAL '30 days')
  ) ON CONFLICT (id) DO NOTHING;

  -- Demo Challenge 2: Wild Adventures - Walk 500 meters
  INSERT INTO challenges (
    id,
    name,
    description,
    challenge_type,
    target_value,
    target_creature_type_id,
    location,
    radius_meters,
    business_id,
    prize_description,
    reward_points,
    difficulty,
    active,
    expires_at,
    prize_expires_at
  ) VALUES (
    '10000000-0000-0000-0000-000000000002',
    'Adventure Walk Challenge',
    'Take a 500-meter walk near Wild Adventures Outdoor Shop. Get moving and earn your reward!',
    'walk',
    500,
    NULL,
    ST_SetSRID(ST_MakePoint(v_manchester_lon + 0.002, v_manchester_lat + 0.002), 4326),
    500,
    v_business2_id,
    '15% discount on all outdoor gear! Show this voucher in-store. Valid for 60 days.',
    250,
    'easy',
    true,
    (NOW() + INTERVAL '90 days'),
    (NOW() + INTERVAL '60 days')
  ) ON CONFLICT (id) DO NOTHING;

  -- Demo Challenge 3: Nature's Bounty - Catch 5 Creatures
  INSERT INTO challenges (
    id,
    name,
    description,
    challenge_type,
    target_value,
    target_creature_type_id,
    location,
    radius_meters,
    business_id,
    prize_description,
    reward_points,
    difficulty,
    active,
    expires_at,
    prize_expires_at
  ) VALUES (
    '10000000-0000-0000-0000-000000000003',
    'Restaurant Rarity Hunt',
    'Catch 5 creatures near Nature''s Bounty Restaurant. Discover rare creatures while exploring the area!',
    'collect',
    5,
    v_pythonova_id,
    ST_SetSRID(ST_MakePoint(v_manchester_lon - 0.001, v_manchester_lat + 0.001), 4326),
    400,
    v_business3_id,
    'Complimentary appetizer and dessert with any main course! Valid for 45 days. Reservation recommended.',
    300,
    'medium',
    true,
    (NOW() + INTERVAL '90 days'),
    (NOW() + INTERVAL '45 days')
  ) ON CONFLICT (id) DO NOTHING;

  -- Demo Challenge 4: Wildlife Sanctuary - Catch 2 Rare Creatures
  INSERT INTO challenges (
    id,
    name,
    description,
    challenge_type,
    target_value,
    target_creature_type_id,
    location,
    radius_meters,
    business_id,
    prize_description,
    reward_points,
    difficulty,
    active,
    expires_at,
    prize_expires_at
  ) VALUES (
    '10000000-0000-0000-0000-000000000004',
    'Sanctuary Species Search',
    'Find and catch 2 rare creatures near The Wildlife Sanctuary. Learn about wildlife while you explore!',
    'collect',
    2,
    v_anu_id,
    ST_SetSRID(ST_MakePoint(v_manchester_lon, v_manchester_lat - 0.002), 4326),
    350,
    v_business4_id,
    'Free entry pass for 2 people + guided tour! Valid for 90 days. Perfect for a family day out.',
    350,
    'medium',
    true,
    (NOW() + INTERVAL '90 days'),
    (NOW() + INTERVAL '90 days')
  ) ON CONFLICT (id) DO NOTHING;

  -- Demo Challenge 5: GreenLeaf Cafe - Walk 1000 meters
  INSERT INTO challenges (
    id,
    name,
    description,
    challenge_type,
    target_value,
    target_creature_type_id,
    location,
    radius_meters,
    business_id,
    prize_description,
    reward_points,
    difficulty,
    active,
    expires_at,
    prize_expires_at
  ) VALUES (
    '10000000-0000-0000-0000-000000000005',
    'Morning Fitness Walk',
    'Complete a 1km walk in the GreenLeaf Cafe area. Start your day with exercise and reward yourself!',
    'walk',
    1000,
    NULL,
    ST_SetSRID(ST_MakePoint(v_manchester_lon + 0.0015, v_manchester_lat + 0.0015), 4326),
    600,
    v_business1_id,
    'Buy one get one free on any coffee drink! Valid for 30 days. Perfect for bringing a friend!',
    180,
    'easy',
    true,
    (NOW() + INTERVAL '90 days'),
    (NOW() + INTERVAL '30 days')
  ) ON CONFLICT (id) DO NOTHING;

END $$;

-- Create index on business_id if it doesn't exist (should already exist from previous migration)
CREATE INDEX IF NOT EXISTS challenges_business_id_idx ON challenges(business_id);

-- Add comment to explain demo data
COMMENT ON TABLE businesses IS 'Businesses table. Demo businesses are included for demonstration purposes.';
COMMENT ON TABLE challenges IS 'Challenges table. Demo business challenges are included for demonstration purposes.';

