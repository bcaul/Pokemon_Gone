# Fixing Business Authentication Issues

## Common Issues and Solutions

### Issue 1: Profile Not Created Fast Enough

The profile trigger might take a moment to create the profile. The updated code now:
- Waits and retries up to 10 times for the profile to be created
- Falls back to manual profile creation if the trigger is slow
- Provides better error messages

### Issue 2: RLS Policies Blocking Business Creation

Make sure the migration `011_add_business_system.sql` has been run. It creates:
- RLS policies for businesses table
- Proper INSERT permissions for business creation

### Issue 3: Email Confirmation Required

If email confirmation is enabled in Supabase:
1. Check your email for the verification link
2. Click the link to verify your account
3. Then try signing in again

### Issue 4: Profile Role Not Set

The code now:
- Explicitly sets the role to 'business' after profile creation
- Handles cases where the profile might not exist yet
- Creates the profile manually if the trigger fails

## Testing the Fix

1. Try registering a new business account
2. Check the browser console for any errors
3. Check Supabase logs for database errors
4. Verify the profile was created with role='business'
5. Verify the business record was created

## Manual Fix (If Needed)

If registration still fails, you can manually fix it:

1. **Check if profile exists:**
```sql
SELECT * FROM profiles WHERE id = 'user-id-here';
```

2. **Update role if needed:**
```sql
UPDATE profiles SET role = 'business' WHERE id = 'user-id-here';
```

3. **Create business record:**
```sql
INSERT INTO businesses (user_id, business_name, business_type, email)
VALUES ('user-id-here', 'Business Name', 'restaurant', 'email@example.com');
```

## Debugging Steps

1. Open browser console (F12)
2. Try registering/signing in
3. Look for error messages
4. Check Network tab for failed API calls
5. Check Supabase dashboard logs

## Common Error Messages

- **"Failed to create business profile"**: RLS policy blocking insert, or profile doesn't exist
- **"This account is not a business account"**: Profile role is not set to 'business'
- **"Invalid email or password"**: Wrong credentials, or account doesn't exist
- **"Email not confirmed"**: Need to verify email first

