# Troubleshooting Bcaul Sign-In Issues

## Current Error: "Invalid email or password"

This error means either:
1. The account doesn't exist
2. The password is incorrect
3. The account exists but there's a configuration issue

## Quick Fix Steps

### Step 1: Verify Account Exists

Run this in Supabase SQL Editor:
```sql
SELECT 
  u.email,
  u.email_confirmed_at,
  p.username
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE LOWER(u.email) = 'bcaulfield68@gmail.com';
```

### Step 2: Create Account (If It Doesn't Exist)

**Option A: Through Supabase Dashboard (Easiest)**
1. Go to Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"** or **"Invite User"**
4. Fill in:
   - **Email:** `bcaulfield68@gmail.com`
   - **Password:** `RedBull_27`
   - **Auto Confirm User:** ✅ Yes (to skip email verification)
5. Click **"Create User"**
6. The profile should be created automatically by trigger

**Option B: Through the App**
1. Go to the login page
2. Click **"Sign Up"** tab
3. Enter:
   - **Username:** `Bcaul`
   - **Email:** `bcaulfield68@gmail.com`
   - **Password:** `RedBull_27`
4. Click **"Create Account"**
5. If email verification is required, check your email

### Step 3: Reset Password (If Account Exists)

**Through Supabase Dashboard:**
1. Go to **Authentication > Users**
2. Find user with email `bcaulfield68@gmail.com`
3. Click on the user
4. Click **"Reset Password"** button
5. User will receive password reset email
6. Follow the link in email to set new password

**Or manually set password (Admin only):**
- Use the SQL script `FIX_BCAUL_SIGNIN.sql` (requires service role)

### Step 4: Disable Email Verification (For Development)

If email verification is blocking sign-in:

1. Go to Supabase Dashboard
2. Navigate to **Authentication > Settings**
3. Find **"Enable email confirmations"**
4. **Disable** it (for development only)
5. Save changes
6. Try signing in again

### Step 5: Verify Profile Exists

Run this to check/create profile:
```sql
-- Check if profile exists
SELECT * FROM profiles 
WHERE username = 'Bcaul' 
   OR id IN (SELECT id FROM auth.users WHERE email = 'bcaulfield68@gmail.com');

-- Create profile if missing
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE LOWER(email) = 'bcaulfield68@gmail.com';
  
  IF user_uuid IS NOT NULL THEN
    INSERT INTO profiles (id, username)
    VALUES (user_uuid, 'Bcaul')
    ON CONFLICT (id) DO UPDATE SET username = 'Bcaul';
  END IF;
END $$;
```

## Sign-In Credentials

Once the account is set up:
- **Email:** `bcaulfield68@gmail.com`
- **Password:** `RedBull_27` (or the password you set)
- **Username:** `Bcaul` (for display only, not for login)

## Common Issues & Solutions

### Issue: "Invalid email or password"
- ✅ **Solution:** Account might not exist - create it through Supabase Dashboard
- ✅ **Solution:** Password might be wrong - reset it through Dashboard
- ✅ **Solution:** Make sure you're using email, not username

### Issue: Account exists but can't sign in
- ✅ **Solution:** Check if email is verified
- ✅ **Solution:** Disable email verification in Supabase settings
- ✅ **Solution:** Check browser console for actual error (F12)

### Issue: Profile missing
- ✅ **Solution:** Run the profile creation SQL above
- ✅ **Solution:** Check if profile creation trigger is working

## Testing Sign-In

After fixing the account:

1. Go to login page
2. Make sure **"Sign In"** tab is selected
3. Enter:
   - **Email:** `bcaulfield68@gmail.com`
   - **Password:** `RedBull_27`
4. Click **"Sign In"**

## Still Having Issues?

1. **Check browser console** (F12 > Console) for actual error messages
2. **Check Supabase logs** in Dashboard > Logs > Auth
3. **Verify Supabase connection** - check `.env` file has correct credentials
4. **Try incognito/private browser** to rule out cache issues

