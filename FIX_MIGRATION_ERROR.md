# Fix: Migration ON CONFLICT Error

## Error
```
ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## Cause
The migration used `ON CONFLICT (name) DO UPDATE` but the `creature_types` table doesn't have a unique constraint on the `name` column.

## Fix Applied

1. **Added unique constraint on name** (for data integrity):
   ```sql
   ALTER TABLE creature_types ADD CONSTRAINT creature_types_name_key UNIQUE (name);
   ```

2. **Removed ON CONFLICT clause** (not needed since we truncate first):
   - Since we use `TRUNCATE TABLE` before inserting, there are no conflicts
   - Removed the `ON CONFLICT` clause to avoid the error

## Updated Migration

The migration now:
1. Adds unique constraint on `name` (if it doesn't exist)
2. Truncates all tables (clears existing data)
3. Inserts all 100 creatures
4. Verifies the insert

## Running the Migration

1. Open Supabase SQL Editor
2. Run `supabase/migrations/006_replace_with_pokengine_creatures.sql`
3. Should complete without errors
4. Verify with the count query at the end

## Verification

After running the migration, you should see:
- 40 common creatures
- 30 uncommon creatures
- 20 rare creatures
- 8 epic creatures
- 2 legendary creatures
- Total: 100 creatures

## If You Still Get Errors

1. **Check if constraint already exists**:
   ```sql
   SELECT * FROM pg_constraint WHERE conname = 'creature_types_name_key';
   ```

2. **Manually add constraint if needed**:
   ```sql
   ALTER TABLE creature_types ADD CONSTRAINT creature_types_name_key UNIQUE (name);
   ```

3. **Check for duplicate names**:
   ```sql
   SELECT name, COUNT(*) 
   FROM creature_types 
   GROUP BY name 
   HAVING COUNT(*) > 1;
   ```

## Alternative: Simple Fix

If you just want to fix the error quickly, you can remove the `ON CONFLICT` clause entirely since we're truncating the table first anyway. The migration has been updated to do this.

