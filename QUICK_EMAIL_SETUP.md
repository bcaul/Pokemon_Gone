# Quick Email Setup - Using Your Existing Supabase Project

## TL;DR - Use Your Existing Project!

**You don't need a new Supabase project.** Edge functions are part of your existing project. Just deploy the function to the same project your app is using.

## Quick Steps

### 1. Install Supabase CLI (if needed)

**Windows - Using Scoop (Recommended):**
```powershell
# Install Scoop (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows - Using Chocolatey:**
```powershell
choco install supabase
```

**Windows - Using npx (no installation):**
Just use `npx supabase@latest` instead of `supabase` in all commands below.

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

### 2. Login
```bash
supabase login
```

### 3. Link Your Existing Project
```bash
# Get your project Reference ID from: Supabase Dashboard > Settings > General
# It looks like: abcdefghijklmnop

# If you installed via Scoop/Chocolatey:
supabase link --project-ref YOUR_PROJECT_REF_ID

# If using npx (Windows):
npx supabase@latest link --project-ref YOUR_PROJECT_REF_ID
```

### 4. Get Resend API Key
- Sign up at [resend.com](https://resend.com)
- Create API key in dashboard
- Copy the key

### 5. Set Secret in Your Existing Project
```bash
# If you installed via Scoop/Chocolatey:
supabase secrets set RESEND_API_KEY=re_your_actual_key_here

# If using npx (Windows):
npx supabase@latest secrets set RESEND_API_KEY=re_your_actual_key_here
```

### 6. Deploy Function to Your Existing Project
```bash
# If you installed via Scoop/Chocolatey:
supabase functions deploy send-voucher-email

# If using npx (Windows):
npx supabase@latest functions deploy send-voucher-email
```

### 7. Done!
Your app can now send emails. The function is part of your existing Supabase project.

## Verify It's Working

1. Your app is already connected to your Supabase project (via `VITE_SUPABASE_URL`)
2. The edge function is now deployed to that same project
3. When you call `supabase.functions.invoke('send-voucher-email')` in your app, it will use the function in your existing project

## Where is Everything?

- **Your Database**: Already in your existing Supabase project ✅
- **Your Migrations**: Already in your existing Supabase project ✅
- **Your Edge Function**: Now deployed to your existing Supabase project ✅
- **Your App**: Already connected to your existing Supabase project ✅

Everything is in one place - your existing Supabase project!

## Troubleshooting

**Q: Do I need to change my .env file?**
A: No! Your existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are still the same.

**Q: Will this affect my existing data?**
A: No! Edge functions don't touch your database. They're just serverless functions.

**Q: Can I see the function in my Supabase dashboard?**
A: Yes! Go to your Supabase dashboard > Edge Functions to see it.

**Q: What if I have multiple Supabase projects?**
A: Make sure you link to the correct one (the one your app is using). Check your `.env` file for `VITE_SUPABASE_URL` to confirm which project you're using.

