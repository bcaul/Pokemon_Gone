-- Migration: Add step tracking and badge system
-- Tracks total steps walked and awards badges for milestones

-- Add steps column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_steps INT DEFAULT 0;

-- Add total_distance_meters for accurate tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_distance_meters FLOAT DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_total_steps_idx ON profiles(total_steps DESC);

-- Badges table - defines available badges
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_emoji TEXT NOT NULL, -- Emoji for the badge
  step_milestone INT NOT NULL, -- Steps required to earn (e.g., 1000, 5000, 10000)
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges - tracks which badges users have earned
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id INT REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_id_idx ON user_badges(badge_id);

-- Function to update steps and check for badge rewards
CREATE OR REPLACE FUNCTION update_steps_and_check_badges(
  p_user_id UUID,
  p_distance_meters FLOAT
)
RETURNS TABLE (
  badges_earned INT[]
) AS $$
DECLARE
  v_steps_to_add INT;
  v_new_total_steps INT;
  v_new_total_distance FLOAT;
  v_badge_record RECORD;
  v_earned_badges INT[] := ARRAY[]::INT[];
BEGIN
  -- Convert distance to steps (approximately 1 step = 0.7 meters)
  v_steps_to_add := FLOOR(p_distance_meters / 0.7);
  
  -- Update total distance and steps
  UPDATE profiles
  SET 
    total_distance_meters = total_distance_meters + p_distance_meters,
    total_steps = total_steps + v_steps_to_add
  WHERE id = p_user_id
  RETURNING total_steps, total_distance_meters INTO v_new_total_steps, v_new_total_distance;
  
  -- Check for new badges earned
  FOR v_badge_record IN
    SELECT id, step_milestone
    FROM badges
    WHERE step_milestone <= v_new_total_steps
    AND id NOT IN (
      SELECT badge_id 
      FROM user_badges 
      WHERE user_id = p_user_id
    )
    ORDER BY step_milestone ASC
  LOOP
    -- Award the badge
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (p_user_id, v_badge_record.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    
    -- Add to earned badges array
    v_earned_badges := array_append(v_earned_badges, v_badge_record.id);
  END LOOP;
  
  RETURN QUERY SELECT v_earned_badges;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default step milestone badges
INSERT INTO badges (name, description, icon_emoji, step_milestone, rarity) VALUES
  ('First Steps', 'Walk your first 100 steps', '👣', 100, 'common'),
  ('Getting Started', 'Walk 500 steps', '🚶', 500, 'common'),
  ('On the Move', 'Walk 1,000 steps', '🏃', 1000, 'common'),
  ('Daily Walker', 'Walk 5,000 steps', '🚶‍♂️', 5000, 'uncommon'),
  ('Active Explorer', 'Walk 10,000 steps', '🥾', 10000, 'uncommon'),
  ('Marathon Walker', 'Walk 25,000 steps', '🏃‍♂️', 25000, 'rare'),
  ('Ultra Walker', 'Walk 50,000 steps', '🏃‍♀️', 50000, 'rare'),
  ('Legendary Walker', 'Walk 100,000 steps', '👟', 100000, 'epic'),
  ('Master Explorer', 'Walk 250,000 steps', '🗺️', 250000, 'epic'),
  ('Ultimate Wanderer', 'Walk 500,000 steps', '🌍', 500000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies for badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own badge inserts" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

