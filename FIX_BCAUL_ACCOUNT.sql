-- Fix Bcaul account sign-in issues
-- This script helps diagnose and fix authentication issues

-- 1. Check if the user account exists
SELECT 
  'User Account Status' as check_type,
  p.username,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.last_sign_in_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN 'Email not verified'
    ELSE 'Email verified'
  END as email_status
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE LOWER(p.username) = 'bcaul'
   OR LOWER(u.email) = 'bcaulfield68@gmail.com';

-- 2. If account exists but email is not confirmed, you can manually confirm it
-- (Run this only if you need to manually verify the email)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE email = 'bcaulfield68@gmail.com';

-- 3. Check if profile exists
SELECT 
  'Profile Status' as check_type,
  p.username,
  p.total_catches,
  p.unique_catches,
  p.role
FROM profiles p
WHERE LOWER(p.username) = 'bcaul';

-- 4. Reset password (if needed)
-- You can reset the password through Supabase dashboard or use this:
-- In Supabase Dashboard: Authentication > Users > Find user > Reset Password

-- 5. Create account if it doesn't exist (requires Supabase Admin API)
-- This would need to be done through Supabase Dashboard or Admin API
-- Steps:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter email: bcaulfield68@gmail.com
-- 4. Set password: RedBull_27
-- 5. Auto-confirm email (for development)
-- 6. Create profile with username: Bcaul

-- 6. Verify the account can sign in by checking auth setup
SELECT 
  'Auth Configuration' as check_type,
  'Check Supabase Auth settings' as note,
  'Email confirmations may be enabled' as possible_issue;

