# 🔧 Fix Console Errors

This document explains the errors you're seeing and how to fix them.

## 1. ✅ Email Voucher CORS Error (FIXED - Needs Deployment)

### Error:
```
CORS policy: Response to preflight request doesn't pass access control check
Failed to fetch at '.../functions/v1/send-voucher-email'
```

### Cause:
The Edge Function `send-voucher-email` is not deployed yet.

### Solution:
1. **Add Resend API Key** to Supabase secrets (if not done):
   - Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions
   - Click "Secrets" tab
   - Add secret: `RESEND_API_KEY` = `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`

2. **Deploy the Edge Function**:
   - See `DEPLOY_EDGE_FUNCTION.md` for detailed instructions
   - Ask project owner to deploy, or use Dashboard if available

3. **Test**: After deployment, try sending an email voucher again

### Status:
- ✅ Code is ready (`supabase/functions/send-voucher-email/index.ts`)
- ✅ Error handling improved
- ⏳ Waiting for deployment

---

## 2. ⚠️ Gym Spawning 400 Error (FIXED - Needs Migration)

### Error:
```
atqvodxcbyrcosrcwinu.supabase.co/rest/v1/rpc/check_and_spawn_gym_creatures:1
Failed to load resource: the server responded with a status of 400
```

### Cause:
The function `check_and_spawn_gym_creatures()` doesn't have proper permissions or SECURITY DEFINER.

### Solution:
Run the migration file: `supabase/migrations/020_fix_gym_spawning_permissions.sql`

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Copy the contents of `020_fix_gym_spawning_permissions.sql`
3. Run it
4. This will:
   - Add GRANT permissions for the functions
   - Add SECURITY DEFINER to ensure proper access
   - Fix the 400 error

### Status:
- ✅ Migration file created
- ⏳ Needs to be run in Supabase

---

## 3. ℹ️ Gemini API 404 Error (Expected - API Disabled)

### Error:
```
models/gemini-1.5-flash-latest is not found for API version v1
```

### Cause:
The Gemini API is disabled or the model name is incorrect. This is expected if you're not using Gemini.

### Solution:
- This is not critical - the app will work without AI recommendations
- If you want to enable it, check `GEMINI_API_DISABLED.md`
- The error is handled gracefully and won't break the app

### Status:
- ✅ Error is handled gracefully
- ℹ️ Not critical - app works without it

---

## 4. ℹ️ Overpass API 504 Timeout (External Service)

### Error:
```
overpass-api.de/api/interpreter:1 Failed to load resource: 504 (Gateway Timeout)
```

### Cause:
The OpenStreetMap Overpass API is temporarily unavailable or slow. This is an external service issue.

### Solution:
- This is handled gracefully - the app will retry
- Park detection will work when the API is available
- Not critical - app works without park detection

### Status:
- ✅ Error is handled gracefully
- ℹ️ External service issue - not your fault

---

## 5. ℹ️ Mapbox Warnings (Cosmetic)

### Warnings:
```
"featureNamespace place-A of featureset place-labels's selector is not associated to the same source"
"Ignoring unknown image variable 'background'"
```

### Cause:
These are Mapbox style warnings, not errors. They don't affect functionality.

### Solution:
- These are cosmetic warnings
- The map still works correctly
- You can ignore them

### Status:
- ✅ Map works correctly
- ℹ️ Cosmetic warnings only

---

## Summary

### Critical Issues (Need Action):
1. **Email Function**: Deploy the Edge Function (see `DEPLOY_EDGE_FUNCTION.md`)
2. **Gym Spawning**: Run migration `020_fix_gym_spawning_permissions.sql`

### Non-Critical Issues (Can Ignore):
3. **Gemini API**: Expected if disabled
4. **Overpass API**: External service issue
5. **Mapbox Warnings**: Cosmetic only

---

## Quick Fix Checklist

- [ ] Add RESEND_API_KEY to Supabase secrets
- [ ] Deploy send-voucher-email Edge Function
- [ ] Run migration `020_fix_gym_spawning_permissions.sql`
- [ ] Test email voucher functionality
- [ ] Test gym spawning (should work after migration)

---

## Next Steps

1. **Deploy Email Function**: See `DEPLOY_EDGE_FUNCTION.md`
2. **Fix Gym Spawning**: Run the migration in Supabase SQL Editor
3. **Test**: Verify both features work after fixes

All other errors are either handled gracefully or are cosmetic warnings that don't affect functionality.

