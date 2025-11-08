-- Quick Fix: Create missing profiles
-- Run this in Supabase SQL Editor to fix the foreign key constraint error

-- Step 1: Create profiles for all auth users that don't have one
INSERT INTO profiles (id, username)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'username',
    split_part(email, '@', 1),
    'user_' || substring(id::text, 1, 8)
  ) as username
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify the fix
SELECT 
  au.id as auth_user_id,
  au.email,
  p.id as profile_id,
  p.username,
  CASE 
    WHEN p.id IS NULL THEN '❌ Missing Profile'
    ELSE '✅ Profile Exists'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Step 3: Check if trigger is working
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 4: Check if function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'handle_new_user';

