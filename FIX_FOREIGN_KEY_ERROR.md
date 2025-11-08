# Fix: Foreign Key Constraint Error on Catches Table

## Error Message
```
insert or update on table "catches" violates foreign key constraint "catches_user_id_fkey"
```

## Cause
The `catches` table has a foreign key constraint that requires `user_id` to exist in the `profiles` table. This error occurs when:
1. User profile wasn't created during signup
2. Profile creation failed silently
3. Profile was deleted but user session still exists

## Solution

### Automatic Fix (Applied)
The `CatchModal` component now:
1. **Checks if profile exists** before inserting a catch
2. **Creates profile if missing** (with fallback username)
3. **Provides better error messages** if profile creation fails

### Manual Fix (If Needed)

#### Option 1: Check and Create Profile in Database
Run this SQL in Supabase SQL Editor:

```sql
-- Check if user profile exists
SELECT id, username FROM profiles WHERE id = 'YOUR_USER_ID_HERE';

-- If profile doesn't exist, create it
INSERT INTO profiles (id, username)
VALUES (
  'YOUR_USER_ID_HERE',
  'username_here'
)
ON CONFLICT (id) DO NOTHING;
```

#### Option 2: Verify Profile Creation Trigger
Check if the `handle_new_user` trigger is working:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check trigger function
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

#### Option 3: Manually Create Profile for All Users
If multiple users are affected:

```sql
-- Create profiles for all auth users that don't have one
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
```

## Prevention

### Ensure Profile Creation on Signup
The signup process should:
1. Create auth user
2. Trigger `handle_new_user` function
3. Create profile record

### Check Auth Component
Verify that `src/components/Auth.jsx`:
- Passes username in signup metadata
- Handles profile creation errors
- Provides fallback profile creation

## Testing

### Test Profile Existence
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

console.log('Profile exists:', !!profile)
```

### Test Catch Insertion
Try catching a creature and check:
1. Profile exists before catch
2. Catch is inserted successfully
3. No foreign key errors

## Files Changed
- `src/components/CatchModal.jsx` - Added profile check and creation

## Next Steps
1. **Refresh the app** - The fix is now in place
2. **Try catching a creature** - Should work now
3. **Check console** - Look for profile creation logs
4. **If still failing** - Run manual SQL fix above

## Related Issues
- Profile creation during signup
- Database trigger not firing
- RLS policies blocking profile creation

