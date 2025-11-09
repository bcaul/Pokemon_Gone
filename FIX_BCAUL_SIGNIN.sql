-- Fix Bcaul account sign-in issues
-- This script helps diagnose and fix authentication problems

-- Step 1: Check if the account exists
SELECT 
  '=== ACCOUNT CHECK ===' as status,
  u.id as user_id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.last_sign_in_at,
  p.username,
  CASE 
    WHEN u.id IS NULL THEN '❌ Account does not exist'
    WHEN u.email_confirmed_at IS NULL THEN '⚠️ Email not verified'
    WHEN p.id IS NULL THEN '⚠️ Profile missing'
    ELSE '✅ Account exists'
  END as account_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE LOWER(u.email) = 'bcaulfield68@gmail.com'
   OR LOWER(p.username) = 'bcaul';

-- Step 2: If account exists but password is wrong, you can reset it
-- Option A: Reset through Supabase Dashboard (Recommended)
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find user with email: bcaulfield68@gmail.com
-- 3. Click on the user
-- 4. Click "Reset Password" button
-- 5. User will receive password reset email

-- Option B: Manually update password (requires service role - use with caution)
-- WARNING: This requires service role access and bypasses security
-- Only use this if you have admin access to the database
-- UPDATE auth.users
-- SET encrypted_password = crypt('RedBull_27', gen_salt('bf'))
-- WHERE email = 'bcaulfield68@gmail.com';

-- Step 3: If account doesn't exist, create it
-- You need to create it through Supabase Dashboard:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter:
--    - Email: bcaulfield68@gmail.com
--    - Password: RedBull_27
--    - Auto Confirm User: Yes (to skip email verification)
-- 4. Click "Create User"
-- 5. Then run the profile creation below

-- Step 4: Create profile if user exists but profile is missing
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE LOWER(email) = 'bcaulfield68@gmail.com'
  LIMIT 1;

  IF user_uuid IS NOT NULL THEN
    -- Create or update profile
    INSERT INTO profiles (id, username, created_at)
    VALUES (user_uuid, 'Bcaul', NOW())
    ON CONFLICT (id) DO UPDATE SET username = 'Bcaul';
    
    RAISE NOTICE 'Profile created/updated for user: %', user_uuid;
  ELSE
    RAISE NOTICE 'User account not found. Please create it through Supabase Dashboard first.';
  END IF;
END $$;

-- Step 5: Verify email is confirmed (for development)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE LOWER(email) = 'bcaulfield68@gmail.com';

-- Step 6: Final verification
SELECT 
  '=== FINAL STATUS ===' as status,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_verified,
  p.username,
  p.id IS NOT NULL as profile_exists,
  CASE 
    WHEN u.id IS NULL THEN '❌ Create account through Supabase Dashboard'
    WHEN u.email_confirmed_at IS NULL THEN '⚠️ Email verification disabled or pending'
    WHEN p.id IS NULL THEN '⚠️ Profile creation failed - check triggers'
    ELSE '✅ Ready to sign in!'
  END as final_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE LOWER(u.email) = 'bcaulfield68@gmail.com';

