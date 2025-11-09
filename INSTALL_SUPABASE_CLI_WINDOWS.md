# Installing Supabase CLI on Windows - Quick Fix

## The Problem
You tried `npm install -g supabase` but got an error saying it's not supported on Windows.

## Solution: Use npx (No Installation Needed!)

The easiest solution is to use `npx` which doesn't require any installation. Just use `npx supabase@latest` instead of `supabase` in all commands.

## Quick Steps

### 1. Login to Supabase
```bash
npx supabase@latest login
```

### 2. Link Your Project
```bash
npx supabase@latest link --project-ref YOUR_PROJECT_REF_ID
```
(Get your project ref ID from: Supabase Dashboard > Settings > General)

### 3. Set Resend API Key
```bash
npx supabase@latest secrets set RESEND_API_KEY=re_your_api_key_here
```

### 4. Deploy the Function
```bash
npx supabase@latest functions deploy send-voucher-email
```

That's it! No installation needed.

## Alternative: If You Want to Install Scoop

If you want to use Scoop (which we just installed), you need to:

1. **Close and reopen PowerShell** (to refresh PATH)
2. Then run:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```
3. Verify: `supabase --version`

After that, you can use `supabase` directly instead of `npx supabase@latest`.

## Recommendation

**Just use npx!** It's simpler and doesn't require closing/reopening terminals or managing installations. The commands are the same, just add `npx supabase@latest` at the beginning.

