# 🚀 Deploy Edge Function for Email Vouchers

## Current Status
The email voucher functionality is ready, but the Edge Function needs to be deployed.

## Problem
You're seeing this error:
```
CORS policy: Response to preflight request doesn't pass access control check
Failed to fetch at '.../functions/v1/send-voucher-email'
```

This means the Edge Function `send-voucher-email` is not deployed yet.

## Solution: Deploy the Function

### Step 1: Add Resend API Key (if not done yet)

1. Go to: **https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions**
2. Click **"Secrets"** tab
3. Click **"Add Secret"**
4. Enter:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
5. Click **"Save"**

### Step 2: Deploy the Edge Function

You have several options:

#### Option A: Using Supabase Dashboard (If Available)

1. Go to: **https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions**
2. Look for a **"Deploy Function"** or **"New Function"** button
3. If available, you can deploy directly from the dashboard
4. Function name: `send-voucher-email`
5. Upload or paste the code from `supabase/functions/send-voucher-email/index.ts`

#### Option B: Ask Project Owner to Deploy

If you don't have deployment permissions, ask the project owner to run:

```bash
# Login to Supabase
npx supabase@latest login

# Link the project
npx supabase@latest link --project-ref tlfrdeutculixxegeyhv

# Deploy the function
npx supabase@latest functions deploy send-voucher-email
```

#### Option C: Use Supabase CLI (If You Have Permissions)

```bash
# Make sure you're in the project directory
cd C:\Users\bcaul\WanderBeasts-2

# Login (if not already)
npx supabase@latest login

# Link project (if not already linked)
npx supabase@latest link --project-ref tlfrdeutculixxegeyhv

# Deploy the function
npx supabase@latest functions deploy send-voucher-email
```

### Step 3: Verify Deployment

1. Go to: **https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions**
2. You should see `send-voucher-email` in the list
3. Check that it shows as "Active" or "Deployed"

### Step 4: Test the Function

1. Open your app
2. Complete a business challenge to get a voucher
3. Go to the Vouchers section
4. Click "Send Email" on a voucher
5. Check your email inbox!

## Troubleshooting

### "Function not found" after deployment
- Wait a few minutes for the deployment to propagate
- Refresh the Supabase dashboard
- Check the function logs for errors

### "403 Forbidden" when deploying
- You don't have deployment permissions
- Ask the project owner to deploy it for you
- Or use the Dashboard method if available

### "RESEND_API_KEY not found" error
- Make sure you added the secret in Step 1
- Verify the secret name is exactly `RESEND_API_KEY` (case-sensitive)
- The secret should be visible in: Settings > Edge Functions > Secrets

### CORS errors persist
- The function might not be deployed yet
- Check that the function appears in the Edge Functions list
- Verify the function is active and not in an error state
- Check the function logs for startup errors

### Function deployed but emails not sending
- Check the function logs: Dashboard > Edge Functions > send-voucher-email > Logs
- Verify the RESEND_API_KEY is set correctly
- Check that the Resend API key is valid and active
- Verify you haven't exceeded Resend's rate limits

## Function Code Location

The Edge Function code is located at:
- `supabase/functions/send-voucher-email/index.ts`

This function:
- ✅ Handles CORS preflight requests
- ✅ Validates request parameters
- ✅ Creates beautiful HTML email templates
- ✅ Sends emails via Resend
- ✅ Returns proper error messages

## What Happens After Deployment

Once deployed:
1. ✅ Users can click "Send Email" on vouchers
2. ✅ Emails will be sent via Resend
3. ✅ Voucher codes and prize details will be included
4. ✅ Business information will be shown
5. ✅ Expiration dates will be displayed

## Alternative: Use App as Proof

Even without email, users can:
- ✅ See their voucher code in the Vouchers section
- ✅ See their prize description
- ✅ See business information
- ✅ Use the app as proof when redeeming at businesses

The email is just a convenience - all voucher information is stored in the database and shown in the app!

---

**Next Steps:**
1. Add the RESEND_API_KEY secret (Step 1)
2. Deploy the Edge Function (Step 2)
3. Test the functionality (Step 4)

If you need help, check the function logs in the Supabase Dashboard!

