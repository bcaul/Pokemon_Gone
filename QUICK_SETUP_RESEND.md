# 🚀 Quick Setup: Resend API Key (Dashboard Method)

## Problem
CLI access requires admin privileges you don't have. Use the Dashboard instead.

## Solution: Use Supabase Dashboard

### 1. Add the Secret (2 minutes)

**Direct Link:** https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions

1. Click **"Secrets"** tab
2. Click **"Add Secret"**
3. Enter:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
4. Click **"Save"**

✅ **Done!** The API key is now in Supabase.

### 2. Check if Function is Deployed

**Direct Link:** https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions

- Look for `send-voucher-email` in the list
- If it's there, you're all set!
- If it's not there, see "Deploy Function" below

### 3. Deploy Function (if needed)

If the function isn't deployed, you have two options:

**Option A: Ask Project Owner**
Ask them to run:
```bash
npx supabase@latest functions deploy send-voucher-email
```

**Option B: Check Dashboard**
Some Supabase projects allow deploying functions directly from the dashboard.

### 4. Test It!

1. Complete a business challenge in your app
2. Go to Vouchers section
3. Click "Send Email" on a voucher
4. Check your email inbox! 📧

## Your Resend API Key
```
re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV
```

## Troubleshooting

**Can't access Dashboard?**
- Make sure you're logged into the correct Supabase account
- Verify you have access to the project

**Secret not saving?**
- Check that the name is exactly `RESEND_API_KEY` (case-sensitive)
- Make sure you have permission to edit secrets (may need Owner/Admin role)

**Function not working?**
- Check Edge Function logs: Dashboard > Edge Functions > send-voucher-email > Logs
- Verify the secret is set correctly
- Make sure the function is deployed

---

**That's it!** Once you add the secret via Dashboard, email functionality will work. 🎉

