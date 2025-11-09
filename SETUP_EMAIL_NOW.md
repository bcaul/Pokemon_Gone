# 🚨 URGENT: Email Setup Required

Your voucher emails are failing because the Resend API key is not configured. Here's how to fix it in 5 minutes:

## Step 1: Get Resend API Key (2 minutes)

1. Go to **https://resend.com**
2. Click **Sign Up** (it's FREE - 3,000 emails/month)
3. Verify your email
4. Go to **API Keys** in the dashboard
5. Click **Create API Key**
6. Name it "WanderBeasts"
7. **COPY THE API KEY** (starts with `re_`)

## Step 2: Set API Key in Supabase (2 minutes)

### Option A: Using Supabase Dashboard (EASIEST)

1. Go to **https://supabase.com/dashboard**
2. Select your project (the one you're using for WanderBeasts)
3. Go to **Settings** (gear icon in left sidebar)
4. Click **Edge Functions** in the settings menu
5. Click **Secrets** tab
6. Click **Add Secret** button
7. **Name**: `RESEND_API_KEY`
8. **Value**: Paste your Resend API key
9. Click **Save**

### Option B: Using Supabase CLI (Alternative)

**Note:** Supabase CLI cannot be installed via `npm install -g`. Use one of these methods:

**Method 1: Using npx (No installation needed)**
```bash
# Login (will open browser)
npx supabase@latest login

# Link your project (get project ref from Supabase dashboard > Settings > General)
npx supabase@latest link --project-ref YOUR_PROJECT_REF

# Set the secret
npx supabase@latest secrets set RESEND_API_KEY=your_resend_api_key_here
```

**Method 2: Install via Scoop (Windows)**
```powershell
# Install Scoop (if not installed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Then use supabase commands normally
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

## Step 3: Deploy Edge Function (1 minute)

**Option A: Using npx (No installation needed - RECOMMENDED)**
```bash
# Make sure you're in the project directory
cd C:\Users\taram\WanderBeasts

# Login first (if not already logged in)
npx supabase@latest login

# Link your project (get project ref from Supabase dashboard > Settings > General)
npx supabase@latest link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase@latest functions deploy send-voucher-email
```

**Option B: If you installed via Scoop**
```bash
# Make sure you're in the project directory
cd C:\Users\taram\WanderBeasts

# Deploy the function
supabase functions deploy send-voucher-email
```

## Step 4: Test It!

1. Complete a business challenge in your app
2. Check your email inbox
3. You should receive an email with your voucher code and prize details!

## That's It! 🎉

Once the API key is set and the function is deployed, emails will work automatically.

## Troubleshooting

**Still getting 500 errors?**
1. Check Supabase logs: Dashboard > Edge Functions > Logs > send-voucher-email
2. Make sure the secret is named exactly `RESEND_API_KEY` (case-sensitive)
3. Make sure the function is deployed: `supabase functions list`
4. Restart your dev server after deploying

**Function not found?**
- Make sure you've deployed it: `supabase functions deploy send-voucher-email`
- Check it exists: `supabase functions list`

**Can't access Supabase Dashboard?**
- Make sure you're logged into the correct Supabase account
- Check that you have access to the project

## Alternative: Use App as Proof (No Email Required)

Even without email, users can:
- ✅ See their voucher code in the **Vouchers** section
- ✅ See their prize description
- ✅ Use the app as proof when redeeming at businesses
- ✅ All voucher information is stored securely in the database

The email is just a convenience - the app works perfectly without it!

