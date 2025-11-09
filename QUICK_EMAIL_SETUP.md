# Quick Email Setup Guide

## The Problem
You're getting a 500 error when trying to send voucher emails. This is because the Resend API key is not configured.

## Quick Fix (5 minutes)

### Step 1: Get a Resend API Key (Free)
1. Go to https://resend.com
2. Sign up (it's free - 3,000 emails/month)
3. Go to **API Keys** in the dashboard
4. Click **Create API Key**
5. Name it "WanderBeasts" (or anything)
6. Copy the API key (starts with `re_`)

### Step 2: Set the API Key in Supabase

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **Edge Functions** > **Secrets**
4. Click **Add Secret**
5. Name: `RESEND_API_KEY`
6. Value: Paste your Resend API key
7. Click **Save**

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from Supabase dashboard > Settings > General)
supabase link --project-ref your-project-ref

# Set the secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Step 3: Deploy the Edge Function

```bash
# Make sure you're in the project directory
cd C:\Users\taram\WanderBeasts

# Deploy the function
supabase functions deploy send-voucher-email
```

### Step 4: Test It
1. Complete a business challenge in your app
2. Check your email inbox
3. You should receive an email with your voucher code and prize details!

## That's It!

Once the API key is set and the function is deployed, emails will work automatically. The function uses Resend's test domain (`onboarding@resend.dev`) so you don't need to verify a domain for testing.

## Troubleshooting

**Still getting 500 errors?**
1. Check Supabase logs: Dashboard > Edge Functions > Logs
2. Make sure the secret is named exactly `RESEND_API_KEY`
3. Make sure the function is deployed: `supabase functions list`
4. Check that your Resend API key is valid in the Resend dashboard

**Emails going to spam?**
- For production, verify your domain in Resend
- Update the `from` email in `supabase/functions/send-voucher-email/index.ts` to use your verified domain

## Fallback: Voucher Details in App

Even if email fails, your voucher details are always visible in the **Vouchers** section of the app. You can:
- See your voucher code
- See your prize description
- See where to redeem it
- Use the app as proof of your prize

The email is just a convenience - all voucher information is stored in the database and shown in the app!
