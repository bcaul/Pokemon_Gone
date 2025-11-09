# Email Setup Guide - Resend + Supabase Edge Functions

This guide will help you set up email functionality for the WanderBeasts business system using Resend and Supabase Edge Functions.

## Important: Use Your Existing Supabase Project

**You do NOT need to create a new Supabase project!** Edge functions are part of your existing Supabase project. You'll just be adding the email function to the same project you're already using.

## Prerequisites

- **Your existing Supabase project** (the one you're already using for WanderBeasts)
- Supabase CLI installed
- Resend account (free tier available)

## Step 1: Install Supabase CLI

**Windows Installation (Choose one method):**

### Option A: Using Scoop (Recommended for Windows)

1. Install Scoop (if you don't have it):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
   ```

2. Install Supabase CLI:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

### Option B: Using Chocolatey

1. Install Chocolatey (if you don't have it): https://chocolatey.org/install

2. Install Supabase CLI:
   ```powershell
   choco install supabase
   ```

### Option C: Using npm (via npx - no installation needed)

You can use `npx` to run Supabase CLI without installing it globally:
```bash
npx supabase@latest login
npx supabase@latest link --project-ref your-project-ref
npx supabase@latest functions deploy send-voucher-email
```

**Mac/Linux Installation:**

```bash
brew install supabase/tap/supabase
```

Or using npm (if supported):
```bash
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate with your Supabase account.

## Step 3: Link Your Existing Project

**This links to your EXISTING Supabase project** (the same one your app is using):

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your WanderBeasts project
3. Go to **Settings** > **General**
4. Find your **Reference ID** (it looks like: `abcdefghijklmnop`)
5. Run:

```bash
# Replace 'your-project-ref' with your actual Reference ID from step 4
supabase link --project-ref your-project-ref
```

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

This will connect your local codebase to your existing Supabase project. You're not creating anything new - just linking to what you already have!

## Step 4: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email
4. Go to API Keys in the dashboard
5. Create a new API key
6. Copy the API key (you'll need it in the next step)

## Step 5: Set Resend API Key as Secret

This adds the API key to your **existing Supabase project** (not a new one):

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Replace `re_your_api_key_here` with your actual Resend API key.

**Note:** This secret is stored in your existing Supabase project and will be available to all edge functions in that project.

## Step 6: Deploy the Edge Function

This deploys the function to your **existing Supabase project**:

```bash
# Make sure you're in the project root directory (where your supabase/ folder is)
supabase functions deploy send-voucher-email
```

**What this does:**
- Deploys the `send-voucher-email` function to your existing Supabase project
- The function will be accessible at: `https://your-project-ref.supabase.co/functions/v1/send-voucher-email`
- Your app (which is already connected to this project) can immediately use it

## Step 7: Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `wanderbeasts.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually a few minutes)
6. Once verified, update the `from` email in `supabase/functions/send-voucher-email/index.ts`:

```typescript
from: 'WanderBeasts <noreply@yourdomain.com>', // Replace with your verified domain
```

**Note**: For testing, you can use Resend's default domain, but it will show "via resend.dev" in the email.

## Step 8: Test the Function

### Option 1: Test Locally

```bash
# Start local Supabase (if not already running)
supabase start

# Serve the function locally
supabase functions serve send-voucher-email

# In another terminal, test it
curl -X POST http://localhost:54321/functions/v1/send-voucher-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "voucher_id": "test-id",
    "user_email": "your-email@example.com",
    "voucher_code": "TEST1234",
    "prize_description": "Free side dish",
    "business_name": "Test Restaurant",
    "redemption_location": "123 Main St",
    "expires_at": "2024-12-31T23:59:59Z"
  }'
```

Replace `YOUR_ANON_KEY` with your Supabase anon key (found in Settings > API).

### Option 2: Test from the App

1. Complete a business challenge in the app
2. Check if a voucher is created
3. Click "Send Email" on the voucher
4. Check your email inbox

## Step 9: Update Database Function (Optional)

The database trigger automatically creates vouchers, but you can also manually trigger email sending. Update the trigger in `011_add_business_system.sql` if you want emails to be sent automatically when vouchers are created.

Alternatively, emails can be sent manually from the Vouchers page by clicking "Send Email".

## Troubleshooting

### Error: "RESEND_API_KEY is not set"

**Solution**: Make sure you've set the secret:
```bash
supabase secrets set RESEND_API_KEY=your_key_here
```

Then redeploy:
```bash
supabase functions deploy send-voucher-email
```

### Error: "Function not found"

**Solution**: Make sure the function is deployed:
```bash
supabase functions deploy send-voucher-email
```

Check that the function exists:
```bash
supabase functions list
```

### Error: "Domain not verified"

**Solution**: 
- For testing, you can use Resend's default domain (emails will show "via resend.dev")
- For production, verify your domain in Resend dashboard

### Emails going to spam

**Solutions**:
1. Verify your domain in Resend
2. Set up SPF and DKIM records (Resend provides these)
3. Warm up your domain by sending a few emails first
4. Ask users to mark emails as "Not Spam"

### CORS errors

**Solution**: The edge function already includes CORS headers. If you're still getting errors, check:
1. That you're calling the function with the correct URL
2. That your Supabase project allows function invocations
3. Check browser console for specific error messages

## Production Checklist

- [ ] Resend API key set as secret
- [ ] Edge function deployed
- [ ] Domain verified in Resend
- [ ] `from` email updated to use verified domain
- [ ] Tested email sending from the app
- [ ] SPF/DKIM records set up (for better deliverability)
- [ ] Email template customized (if needed)
- [ ] Error handling tested

## Monitoring

Monitor your email sending:
1. **Resend Dashboard**: Check email logs, delivery rates, bounces
2. **Supabase Logs**: Check function invocations and errors
3. **Database**: Check `vouchers.email_sent` and `vouchers.email_sent_at` fields

## Cost

- **Resend Free Tier**: 3,000 emails/month, 100 emails/day
- **Resend Pro**: $20/month for 50,000 emails
- **Supabase Edge Functions**: Free tier includes 500,000 invocations/month

For most small to medium apps, the free tier should be sufficient.

## Alternative: Using SendGrid

If you prefer SendGrid over Resend:

1. Create a SendGrid account
2. Get your API key
3. Update the edge function to use SendGrid SDK:
   ```typescript
   import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0'
   sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY') || '')
   ```
4. Set the secret: `supabase secrets set SENDGRID_API_KEY=your_key`
5. Update the email sending code to use SendGrid's format

## Support

If you encounter issues:
1. Check Supabase function logs: `supabase functions logs send-voucher-email`
2. Check Resend dashboard for email status
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

