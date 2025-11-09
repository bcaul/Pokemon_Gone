# Resend API Key Setup - Quick Guide

## API Key Information

**Resend API Key:** `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`  
**Supabase Project Ref:** `tlfrdeutculixxegeyhv`

## Quick Setup (5 minutes)

### Option 1: Using Supabase Dashboard (EASIEST - Recommended)

1. **Go to Supabase Dashboard:**
   - Open: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions

2. **Navigate to Secrets:**
   - Click on the **"Secrets"** tab

3. **Add the Secret:**
   - Click **"Add Secret"** button
   - **Name:** `RESEND_API_KEY` (exactly as shown, case-sensitive)
   - **Value:** `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
   - Click **"Save"**

4. **Deploy the Edge Function:**
   ```powershell
   # Login to Supabase (will open browser)
   npx supabase@latest login
   
   # Link your project
   npx supabase@latest link --project-ref tlfrdeutculixxegeyhv
   
   # Deploy the function
   npx supabase@latest functions deploy send-voucher-email
   ```

### Option 2: Using PowerShell Script

Run the provided script:
```powershell
.\set-resend-api-key.ps1
```

The script will:
- Try to set the secret via CLI (if you're logged in)
- Provide step-by-step instructions for the Dashboard method
- Copy the API key to your clipboard

### Option 3: Using Supabase CLI Only

```powershell
# 1. Login to Supabase (will open browser)
npx supabase@latest login

# 2. Link your project
npx supabase@latest link --project-ref tlfrdeutculixxegeyhv

# 3. Set the secret
npx supabase@latest secrets set RESEND_API_KEY=re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV

# 4. Deploy the Edge Function
npx supabase@latest functions deploy send-voucher-email
```

## Verify Setup

1. **Check the secret is set:**
   - Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions
   - Click "Secrets" tab
   - You should see `RESEND_API_KEY` in the list

2. **Test email functionality:**
   - Complete a business challenge in your app
   - Click "Send Email" on a voucher
   - Check your email inbox for the voucher

## Troubleshooting

### "Access token not provided" error
- Run `npx supabase@latest login` first
- This will open a browser to authenticate

### "Function not found" error
- Make sure the Edge Function is deployed
- Run: `npx supabase@latest functions deploy send-voucher-email`

### Emails still not sending
- Check Supabase logs: Dashboard > Edge Functions > Logs > send-voucher-email
- Verify the secret name is exactly `RESEND_API_KEY` (case-sensitive)
- Verify the API key is valid in Resend dashboard: https://resend.com/api-keys

### Secret not showing in Dashboard
- Make sure you're viewing the correct project
- Refresh the page
- Check that you have the correct permissions

## What This Enables

Once set up, the email voucher functionality will:
- ✅ Send beautiful HTML emails with voucher codes
- ✅ Include prize descriptions and business information
- ✅ Show redemption locations and expiration dates
- ✅ Use Resend's reliable email delivery service
- ✅ Work automatically when users complete challenges

## Next Steps

After setting up the API key:
1. Deploy the Edge Function (if not already deployed)
2. Test by completing a business challenge
3. Verify emails are being sent successfully
4. (Optional) Verify your domain in Resend for production use

## Support

If you encounter issues:
1. Check the Supabase Edge Function logs
2. Verify the Resend API key is active in Resend dashboard
3. Ensure the Edge Function is deployed and up-to-date
4. Check that all required fields are being passed to the function

---

**Note:** The API key is now configured and ready to use. The Edge Function at `supabase/functions/send-voucher-email/index.ts` is already set up to use this key once it's added to Supabase secrets.

