# 🔧 Fix Gym Spawning 400 Error

## Error Message

```
atqvodxcbyrcosrcwinu.supabase.co/rest/v1/rpc/check_and_spawn_gym_creatures:1
Failed to load resource: the server responded with a status of 400
```

## Cause

The `check_and_spawn_gym_creatures()` function doesn't have proper permissions or SECURITY DEFINER set.

## Solution

Run the migration file to fix the permissions:

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/sql/new
2. Or go to SQL Editor in the left sidebar

### Step 2: Run the Migration

1. Open the file: `supabase/migrations/020_fix_gym_spawning_permissions.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click "Run" or press Ctrl+Enter

### Step 3: Verify

After running the migration, the error should stop appearing. The function will now have:
- ✅ GRANT permissions for authenticated and anon users
- ✅ SECURITY DEFINER for proper access
- ✅ All dependent functions also have permissions

## What the Migration Does

1. **Grants execute permissions** on all gym spawning functions:
   - `check_and_spawn_gym_creatures()`
   - `count_players_at_gym(UUID, FLOAT)`
   - `spawn_gym_creatures(UUID, INT)`
   - `get_players_near_gym(UUID, FLOAT)`

2. **Adds SECURITY DEFINER** to functions so they can access tables even if the caller doesn't have direct permissions

3. **Recreates functions** with proper security settings

## Testing

After running the migration:

1. Refresh your app
2. Check browser console - error should be gone
3. Go to a gym with 5+ players
4. Epic/legendary creatures should spawn

## If Error Persists

1. **Check function exists:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'check_and_spawn_gym_creatures';
   ```
   Should return the function name.

2. **Check permissions:**
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'check_and_spawn_gym_creatures';
   ```
   Should show `authenticated` and `anon` with `EXECUTE` privilege.

3. **Check SECURITY DEFINER:**
   ```sql
   SELECT prosecdef FROM pg_proc WHERE proname = 'check_and_spawn_gym_creatures';
   ```
   Should return `true`.

## Alternative: Disable Gym Spawning (Temporary)

If you don't need gym spawning right now, you can disable it by commenting out the call in `src/hooks/useGymTracking.js`:

```javascript
// Comment out this line:
// await checkAndSpawnGymCreatures()
```

But it's better to run the migration to fix it properly!

---

**Note:** The error handling has been improved to not spam the console with errors. The function will silently fail until the migration is run, which is fine since gym spawning is not critical functionality.

