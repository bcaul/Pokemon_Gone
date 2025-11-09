# 🚀 Quick Setup: Resend API Key for Email Vouchers

## Your Resend API Key
```
re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV
```

## Supabase Project
```
Project Ref: tlfrdeutculixxegeyhv
```

## Fastest Method: Supabase Dashboard (2 minutes)

1. **Open this link:**
   https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions

2. **Click "Secrets" tab**

3. **Click "Add Secret"**

4. **Enter:**
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`

5. **Click "Save"**

✅ **Done!** The API key is now configured in Supabase.

## Deploy the Edge Function

After adding the secret, deploy the function:

```powershell
# 1. Login (opens browser)
npx supabase@latest login

# 2. Link project
npx supabase@latest link --project-ref tlfrdeutculixxegeyhv

# 3. Deploy function
npx supabase@latest functions deploy send-voucher-email
```

## Test It

1. Complete a business challenge in your app
2. Click "Send Email" on a voucher
3. Check your email inbox!

## Troubleshooting

**Can't access dashboard?**
- Make sure you're logged into the correct Supabase account
- Verify you have access to project `tlfrdeutculixxegeyhv`

**Function not found?**
- Deploy it: `npx supabase@latest functions deploy send-voucher-email`

**Emails not sending?**
- Check Supabase logs: Dashboard > Edge Functions > Logs
- Verify secret name is exactly `RESEND_API_KEY` (case-sensitive)

---

**That's it!** Your email voucher functionality is now ready to use. 🎉

