# Quick Guide: Deploy Email Function (Windows)

Since Supabase CLI can't be installed via `npm install -g`, here are the easiest options:

## Option 1: Use npx (Easiest - No Installation) ✅

You can use `npx` to run Supabase CLI without installing it globally:

```powershell
# 1. Login to Supabase (will open browser)
npx supabase@latest login

# 2. Link your project
#    Get your project ref from: Supabase Dashboard > Settings > General > Reference ID
npx supabase@latest link --project-ref YOUR_PROJECT_REF

# 3. Set the Resend API key (if you want to use CLI instead of Dashboard)
npx supabase@latest secrets set RESEND_API_KEY=your_resend_api_key_here

# 4. Deploy the function
npx supabase@latest functions deploy send-voucher-email
```

## Option 2: Use Supabase Dashboard (Even Easier) ✅✅

**You don't need the CLI at all if you:**

1. **Set the API key via Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **Settings** > **Edge Functions** > **Secrets**
   - Add secret: `RESEND_API_KEY` = `your_api_key`

2. **Deploy via Dashboard:**
   - Go to **Edge Functions** in the left sidebar
   - Click **Create a new function**
   - Or if the function already exists, you can upload the code manually
   - Copy the code from `supabase/functions/send-voucher-email/index.ts`
   - Paste it into the Dashboard editor
   - Click **Deploy**

## Option 3: Install via Scoop (For Repeated Use)

If you'll be using Supabase CLI frequently:

```powershell
# 1. Install Scoop (Windows package manager)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. Add Supabase bucket
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# 3. Install Supabase CLI
scoop install supabase

# 4. Now you can use supabase commands normally
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase functions deploy send-voucher-email
```

## Recommendation

**Use Option 2 (Dashboard) - RECOMMENDED** ✅

It's the easiest and doesn't require any CLI installation or terminal commands. You just:
1. Set the secret in the Dashboard (Settings > Edge Functions > Secrets)
2. Copy/paste the function code in the Dashboard (Edge Functions > Create/Edit function)
3. Deploy from the Dashboard (click Deploy button)

That's it! No CLI needed, no terminal commands, no installation. Just use the web interface.

**Note:** If you want to use the CLI (Option 1 or 3), you'll need to run the login command in an interactive terminal (not through automation), as it requires browser authentication.

