-- ============================================================================
-- Increase Geckrow Spawn Rate
-- Updates the base_spawn_rate for Geckrow to make it spawn more frequently
-- ============================================================================

-- Increase Geckrow's base_spawn_rate from 0.08 to 0.15 (almost double)
UPDATE creature_types
SET base_spawn_rate = 0.15,
    park_boost_multiplier = 2.5
WHERE name = 'Geckrow';

-- Verify the update
DO $$
DECLARE
  v_geckrow_rate FLOAT;
BEGIN
  SELECT base_spawn_rate INTO v_geckrow_rate
  FROM creature_types
  WHERE name = 'Geckrow';
  
  IF v_geckrow_rate IS NULL THEN
    RAISE NOTICE 'Geckrow not found in creature_types table';
  ELSE
    RAISE NOTICE 'Geckrow spawn rate updated to: %', v_geckrow_rate;
  END IF;
END $$;

