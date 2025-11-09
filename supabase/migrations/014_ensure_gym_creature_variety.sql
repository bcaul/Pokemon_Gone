-- Ensure gym creatures have variety by using gym ID in randomization
-- This migration updates the initialization functions to ensure each gym gets different creatures

-- Improved function to initialize epic/legendary creatures at all gyms with variety
CREATE OR REPLACE FUNCTION initialize_gym_creatures()
RETURNS VOID AS $$
DECLARE
  gym_record RECORD;
  gym_location GEOGRAPHY;
  spawn_lat FLOAT;
  spawn_lon FLOAT;
  existing_spawn_count INTEGER;
  all_creatures INTEGER[];
  gym_creature_index INTEGER;
  selected_creature_id INTEGER;
BEGIN
  -- Get all epic/legendary creature IDs
  SELECT ARRAY_AGG(id ORDER BY id) INTO all_creatures
  FROM creature_types
  WHERE rarity IN ('epic', 'legendary');
  
  IF all_creatures IS NULL OR array_length(all_creatures, 1) = 0 THEN
    RAISE NOTICE 'No epic/legendary creatures found';
    RETURN;
  END IF;
  
  -- Loop through all gyms
  FOR gym_record IN
    SELECT id, name, location
    FROM gyms
    ORDER BY id
  LOOP
    -- Get gym location
    gym_location := gym_record.location;
    
    -- Extract lat/lon from geography point
    SELECT ST_Y(gym_location::geometry), ST_X(gym_location::geometry)
    INTO spawn_lat, spawn_lon;
    
    -- Check if gym already has active spawns
    SELECT COUNT(*) INTO existing_spawn_count
    FROM spawns
    WHERE gym_id = gym_record.id
      AND expires_at > NOW();
    
    -- Only initialize if gym has no active spawns
    IF existing_spawn_count = 0 THEN
      -- Create a consistent seed from gym ID using hash
      -- Convert UUID to integer-like value for seeding
      gym_creature_index := ABS(('x' || SUBSTR(MD5(gym_record.id::text), 1, 8))::bit(32)::int);
      
      -- Spawn 1 unique creature for this gym
      -- Select creature based on gym hash to ensure variety across gyms
      selected_creature_id := all_creatures[(gym_creature_index % array_length(all_creatures, 1)) + 1];
      
      -- Create spawn at gym location
      INSERT INTO spawns (
        creature_type_id,
        location,
        gym_id,
        in_park,
        expires_at
      )
      VALUES (
        selected_creature_id,
        ST_SetSRID(
          ST_MakePoint(
            spawn_lon + (RANDOM() - 0.5) * 0.0001,
            spawn_lat + (RANDOM() - 0.5) * 0.0001
          ),
          4326
        ),
        gym_record.id,
        FALSE,
        NOW() + INTERVAL '24 hours'
      )
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE 'Initialized creature for gym: %', gym_record.name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Improved refresh function with variety
CREATE OR REPLACE FUNCTION refresh_gym_creatures()
RETURNS VOID AS $$
DECLARE
  gym_record RECORD;
  gym_location GEOGRAPHY;
  spawn_lat FLOAT;
  spawn_lon FLOAT;
  active_spawn_count INTEGER;
  all_creatures INTEGER[];
  gym_creature_index INTEGER;
  selected_creature_id INTEGER;
BEGIN
  -- Get all epic/legendary creature IDs
  SELECT ARRAY_AGG(id ORDER BY id) INTO all_creatures
  FROM creature_types
  WHERE rarity IN ('epic', 'legendary');
  
  IF all_creatures IS NULL OR array_length(all_creatures, 1) = 0 THEN
    RETURN;
  END IF;
  
  -- Loop through all gyms
  FOR gym_record IN
    SELECT id, name, location
    FROM gyms
    ORDER BY id
  LOOP
    gym_location := gym_record.location;
    
    SELECT ST_Y(gym_location::geometry), ST_X(gym_location::geometry)
    INTO spawn_lat, spawn_lon;
    
    SELECT COUNT(*) INTO active_spawn_count
    FROM spawns
    WHERE gym_id = gym_record.id
      AND expires_at > NOW();
    
    -- Only spawn if gym has no active spawns (keep it to 1 spawn per gym)
    IF active_spawn_count = 0 THEN
      -- Create consistent seed from gym ID
      gym_creature_index := ABS(('x' || SUBSTR(MD5(gym_record.id::text), 1, 8))::bit(32)::int);
      
      -- Select 1 creature based on gym hash to ensure variety
      selected_creature_id := all_creatures[(gym_creature_index % array_length(all_creatures, 1)) + 1];
      
      -- Create spawn at gym location
      INSERT INTO spawns (
        creature_type_id,
        location,
        gym_id,
        in_park,
        expires_at
      )
      VALUES (
        selected_creature_id,
        ST_SetSRID(
          ST_MakePoint(
            spawn_lon + (RANDOM() - 0.5) * 0.0001,
            spawn_lat + (RANDOM() - 0.5) * 0.0001
          ),
          4326
        ),
        gym_record.id,
        FALSE,
        NOW() + INTERVAL '24 hours'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to redistribute creatures across all gyms for variety
CREATE OR REPLACE FUNCTION redistribute_gym_creatures()
RETURNS VOID AS $$
BEGIN
  -- Delete all existing gym spawns
  DELETE FROM spawns
  WHERE gym_id IS NOT NULL;
  
  -- Reinitialize with variety
  PERFORM initialize_gym_creatures();
  
  RAISE NOTICE 'Redistributed creatures across all gyms with variety';
END;
$$ LANGUAGE plpgsql;

-- Update spawn_gym_creatures function to default to 1 creature
CREATE OR REPLACE FUNCTION spawn_gym_creatures(
  p_gym_id UUID,
  creature_count INT DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  gym_location GEOGRAPHY;
  spawn_count INTEGER := 0;
  spawn_lat FLOAT;
  spawn_lon FLOAT;
  existing_count INTEGER;
  gym_hash INTEGER;
  all_creatures INTEGER[];
  selected_creature_id INTEGER;
BEGIN
  -- Get gym location
  SELECT location INTO gym_location
  FROM gyms
  WHERE id = p_gym_id;
  
  IF gym_location IS NULL THEN
    RAISE EXCEPTION 'Gym not found';
  END IF;
  
  -- Extract lat/lon from geography point
  SELECT ST_Y(gym_location::geometry), ST_X(gym_location::geometry)
  INTO spawn_lat, spawn_lon;
  
  -- Count existing active spawns
  SELECT COUNT(*) INTO existing_count
  FROM spawns
  WHERE gym_id = p_gym_id
    AND expires_at > NOW();
  
  -- If we already have a spawn, just extend its expiration (only 1 spawn per gym)
  IF existing_count >= 1 THEN
    UPDATE spawns
    SET expires_at = NOW() + INTERVAL '24 hours'
    WHERE gym_id = p_gym_id
      AND expires_at > NOW();
    RETURN existing_count;
  END IF;
  
  -- Get all epic/legendary creature IDs
  SELECT ARRAY_AGG(id ORDER BY id) INTO all_creatures
  FROM creature_types
  WHERE rarity IN ('epic', 'legendary');
  
  IF all_creatures IS NULL OR array_length(all_creatures, 1) = 0 THEN
    RETURN 0;
  END IF;
  
  -- Create hash from gym ID for consistent selection
  gym_hash := ABS(('x' || SUBSTR(MD5(p_gym_id::text), 1, 8))::bit(32)::int);
  selected_creature_id := all_creatures[(gym_hash % array_length(all_creatures, 1)) + 1];
  
  -- Spawn creature at gym location
  INSERT INTO spawns (
    creature_type_id,
    location,
    gym_id,
    in_park,
    expires_at
  )
  VALUES (
    selected_creature_id,
    ST_SetSRID(
      ST_MakePoint(
        spawn_lon + (RANDOM() - 0.5) * 0.0001,
        spawn_lat + (RANDOM() - 0.5) * 0.0001
      ),
      4326
    ),
    p_gym_id,
    FALSE,
    NOW() + INTERVAL '24 hours'
  );
  
  spawn_count := 1;
  RETURN spawn_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up gyms with multiple spawns (keep only the first one)
CREATE OR REPLACE FUNCTION cleanup_extra_gym_spawns()
RETURNS VOID AS $$
DECLARE
  gym_record RECORD;
  spawn_record RECORD;
  spawns_to_delete UUID[];
BEGIN
  -- Loop through all gyms
  FOR gym_record IN
    SELECT id
    FROM gyms
  LOOP
    -- Get all active spawns for this gym, ordered by spawned_at
    spawns_to_delete := ARRAY[]::UUID[];
    
    -- Get spawn IDs, keeping only the first one
    FOR spawn_record IN
      SELECT id, ROW_NUMBER() OVER (ORDER BY spawned_at ASC) as row_num
      FROM spawns
      WHERE gym_id = gym_record.id
        AND expires_at > NOW()
      ORDER BY spawned_at ASC
    LOOP
      -- Keep the first spawn, delete the rest
      IF spawn_record.row_num > 1 THEN
        spawns_to_delete := array_append(spawns_to_delete, spawn_record.id);
      END IF;
    END LOOP;
    
    -- Delete extra spawns
    IF array_length(spawns_to_delete, 1) > 0 THEN
      DELETE FROM spawns
      WHERE id = ANY(spawns_to_delete);
      
      RAISE NOTICE 'Deleted % extra spawns from gym: %', array_length(spawns_to_delete, 1), gym_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Clean up any gyms with multiple spawns, then redistribute
SELECT cleanup_extra_gym_spawns();
SELECT redistribute_gym_creatures();
