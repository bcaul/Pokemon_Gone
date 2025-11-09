-- ============================================================================
-- Business System Migration
-- Adds business accounts, business challenges, vouchers, and email functionality
-- ============================================================================

-- Add role field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player' CHECK (role IN ('player', 'business', 'admin'));

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT, -- e.g., 'restaurant', 'cafe', 'shop', 'attraction'
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS businesses_user_id_idx ON businesses(user_id);
CREATE INDEX IF NOT EXISTS businesses_active_idx ON businesses(active);

-- Add business_id to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS prize_description TEXT,
ADD COLUMN IF NOT EXISTS prize_email_template TEXT,
ADD COLUMN IF NOT EXISTS prize_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS challenges_business_id_idx ON challenges(business_id);

-- Vouchers table (tickets/rewards)
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  voucher_code TEXT UNIQUE NOT NULL, -- Unique code for redemption
  prize_description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  redemption_location TEXT, -- Where to redeem (business address or instructions)
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS vouchers_user_id_idx ON vouchers(user_id);
CREATE INDEX IF NOT EXISTS vouchers_business_id_idx ON vouchers(business_id);
CREATE INDEX IF NOT EXISTS vouchers_challenge_id_idx ON vouchers(challenge_id);
CREATE INDEX IF NOT EXISTS vouchers_status_idx ON vouchers(status);
CREATE INDEX IF NOT EXISTS vouchers_voucher_code_idx ON vouchers(voucher_code);

-- Function to generate unique voucher code
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    v_code := UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || NOW()::TEXT),
        1, 8
      )
    );
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM vouchers WHERE voucher_code = v_code) INTO v_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to create voucher when challenge is completed
CREATE OR REPLACE FUNCTION create_voucher_on_challenge_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge challenges%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_voucher_code TEXT;
  v_user_email TEXT;
BEGIN
  -- Only create voucher if challenge was just completed (was false, now true)
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
    -- Get challenge details
    SELECT * INTO v_challenge FROM challenges WHERE id = NEW.challenge_id;
    
    -- Only create voucher if challenge has a business and prize
    IF v_challenge.business_id IS NOT NULL AND v_challenge.prize_description IS NOT NULL THEN
      -- Get business details
      SELECT * INTO v_business FROM businesses WHERE id = v_challenge.business_id;
      
      -- Get user email
      SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.user_id;
      
      -- Generate voucher code
      v_voucher_code := generate_voucher_code();
      
      -- Create voucher
      INSERT INTO vouchers (
        challenge_id,
        business_id,
        user_id,
        voucher_code,
        prize_description,
        expires_at,
        redemption_location
      ) VALUES (
        NEW.challenge_id,
        v_challenge.business_id,
        NEW.user_id,
        v_voucher_code,
        v_challenge.prize_description,
        v_challenge.prize_expires_at,
        COALESCE(v_business.address, 'Visit ' || v_business.business_name || ' to redeem')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create vouchers when challenges are completed
DROP TRIGGER IF EXISTS trigger_create_voucher_on_completion ON user_challenges;
CREATE TRIGGER trigger_create_voucher_on_completion
  AFTER UPDATE ON user_challenges
  FOR EACH ROW
  WHEN (NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE))
  EXECUTE FUNCTION create_voucher_on_challenge_completion();

-- RLS Policies for businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses are viewable by everyone"
  ON businesses FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Businesses can insert their own business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Businesses can update their own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for vouchers
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vouchers"
  ON vouchers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Businesses can view vouchers for their challenges"
  ON vouchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = vouchers.business_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert vouchers"
  ON vouchers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Businesses can update voucher status (redeem)"
  ON vouchers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = vouchers.business_id 
      AND user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_voucher_code() TO authenticated;
GRANT EXECUTE ON FUNCTION create_voucher_on_challenge_completion() TO authenticated;

