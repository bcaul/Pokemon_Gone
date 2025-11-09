-- Verify or create Bcaul account for sign-in
-- This script helps diagnose account issues and provides instructions

-- Step 1: Check if the account exists in auth.users and profiles
SELECT 
  '=== ACCOUNT STATUS ===' as status,
  p.username,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.last_sign_in_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ Account does not exist in auth.users'
    WHEN u.email_confirmed_at IS NULL THEN '⚠️ Account exists but email not verified'
    WHEN p.id IS NULL THEN '⚠️ Account exists but profile missing'
    ELSE '✅ Account exists and is verified'
  END as account_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE LOWER(u.email) = 'bcaulfield68@gmail.com'
   OR LOWER(p.username) = 'bcaul';

-- Step 2: If account doesn't exist, you need to create it through Supabase Dashboard
-- Instructions:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter:
--    - Email: bcaulfield68@gmail.com
--    - Password: RedBull_27
--    - Auto Confirm User: Yes (to skip email verification for development)
-- 4. After creating, run the profile creation script below

-- Step 3: Create profile if user exists but profile is missing
DO $$
DECLARE
  user_uuid UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE LOWER(email) = 'bcaulfield68@gmail.com'
  LIMIT 1;

  IF user_uuid IS NOT NULL THEN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_uuid) INTO profile_exists;
    
    IF NOT profile_exists THEN
      -- Create profile
      INSERT INTO profiles (id, username, created_at)
      VALUES (user_uuid, 'Bcaul', NOW())
      ON CONFLICT (id) DO UPDATE SET username = 'Bcaul';
      
      RAISE NOTICE 'Profile created for user: %', user_uuid;
    ELSE
      RAISE NOTICE 'Profile already exists for user: %', user_uuid;
    END IF;
  ELSE
    RAISE NOTICE 'User account not found. Please create it through Supabase Dashboard first.';
  END IF;
END $$;

-- Step 4: Manually verify email (for development - removes email verification requirement)
-- WARNING: Only use this in development, not production!
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE LOWER(email) = 'bcaulfield68@gmail.com';

-- Step 5: Verify final account status
SELECT 
  '=== FINAL ACCOUNT STATUS ===' as status,
  p.username,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_verified,
  p.id IS NOT NULL as profile_exists,
  CASE 
    WHEN u.id IS NULL THEN '❌ Account still does not exist - create through Supabase Dashboard'
    WHEN u.email_confirmed_at IS NULL THEN '⚠️ Email not verified - check email or disable verification in settings'
    WHEN p.id IS NULL THEN '⚠️ Profile missing - check profile creation trigger'
    ELSE '✅ Account is ready to use!'
  END as final_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE LOWER(u.email) = 'bcaulfield68@gmail.com';

-- Step 6: Sign-in instructions
SELECT 
  '=== SIGN-IN INSTRUCTIONS ===' as instructions,
  '1. Use EMAIL (not username) to sign in' as step1,
  '2. Email: bcaulfield68@gmail.com' as step2,
  '3. Password: RedBull_27' as step3,
  '4. Make sure "Sign In" tab is selected (not "Sign Up")' as step4;

