# How to Sign In with Bcaul Account

## Important: Use Email, Not Username

The sign-in form requires your **email address**, not your username. 

## Sign-In Credentials

- **Email:** `bcaulfield68@gmail.com`
- **Password:** `RedBull_27`
- **Username:** `Bcaul` (this is just for display, not for login)

## Steps to Sign In

1. Go to the login page
2. Make sure "Sign In" tab is selected (not "Sign Up")
3. Enter your **email**: `bcaulfield68@gmail.com`
4. Enter your **password**: `RedBull_27`
5. Click "Sign In"

## Common Issues

### Issue: "Invalid email or password"
- **Solution:** Make sure you're using the email address, not the username
- Double-check the password is correct (case-sensitive)
- Make sure you're on the "Sign In" tab, not "Sign Up"

### Issue: "Email not confirmed"
- **Solution:** Check your email inbox for a verification link
- Click the verification link in the email
- If you don't see the email, check your spam folder
- You may need to request a new verification email

### Issue: "User not found"
- **Solution:** The account might not exist yet
- Try signing up first with the same email
- Or the account might need to be created in the database

## If You Can't Remember Your Password

If you've forgotten your password, you can reset it through Supabase:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Find the user with email `bcaulfield68@gmail.com`
4. Click "Reset Password" to send a password reset email

## Creating a New Account (If Needed)

If the account doesn't exist, you can create it:

1. Click the "Sign Up" tab
2. Enter:
   - **Username:** `Bcaul`
   - **Email:** `bcaulfield68@gmail.com`
   - **Password:** `RedBull_27`
3. Click "Create Account"
4. Check your email for verification link
5. After verification, sign in with your email and password

## Checking if Account Exists

To check if the account exists in the database, run this SQL query in Supabase SQL Editor:

```sql
-- Check if user exists
SELECT 
  p.username,
  u.email,
  u.email_confirmed_at,
  u.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE LOWER(p.username) = 'bcaul'
   OR LOWER(u.email) = 'bcaulfield68@gmail.com';
```

## Troubleshooting

If you're still having issues:

1. **Clear browser cache and cookies**
2. **Try a different browser**
3. **Check browser console for errors** (F12 > Console)
4. **Verify Supabase connection** - make sure your `.env` file has the correct Supabase URL and anon key
5. **Check if email verification is required** - you may need to disable email verification in Supabase settings for development

## Development: Disable Email Verification

If you're in development and want to skip email verification:

1. Go to Supabase Dashboard
2. Navigate to Authentication > Settings
3. Disable "Enable email confirmations" (for development only)
4. Save changes
5. Try signing in again

