# ✅ Add Resend API Key via Supabase Dashboard

Since CLI access requires additional privileges, use the Dashboard method instead.

## Your Resend API Key
```
re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV
```

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Make sure you're logged into the account that owns the project
3. Select your project (or the one with ref: `tlfrdeutculixxegeyhv`)

### Step 2: Navigate to Edge Functions Settings
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **Edge Functions** in the settings menu
3. Click on the **Secrets** tab

### Step 3: Add the Resend API Key
1. Click the **"Add Secret"** button (or **"New Secret"**)
2. Enter the following:
   - **Name:** `RESEND_API_KEY` (exactly as shown, case-sensitive)
   - **Value:** `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
3. Click **"Save"** or **"Add Secret"**

### Step 4: Verify the Secret
- You should now see `RESEND_API_KEY` in the list of secrets
- The value will be hidden (showing as `••••••••`)

## That's It! 🎉

The API key is now configured. The Edge Function will automatically use it when sending emails.

## Verify the Edge Function is Deployed

1. Go to **Edge Functions** in the left sidebar (not Settings)
2. Look for `send-voucher-email` in the list
3. If it's not there, you may need to:
   - Ask the project owner to deploy it, OR
   - If you have access to a different account, deploy it from there

## Test the Email Functionality

1. Open your app
2. Complete a business challenge
3. Go to the Vouchers section
4. Click "Send Email" on a voucher
5. Check your email inbox!

## Troubleshooting

### "Secrets" tab not visible?
- Make sure you're in **Settings > Edge Functions > Secrets**
- You may need Owner or Admin permissions on the project

### "Add Secret" button not visible?
- You may not have permission to modify secrets
- Contact the project owner to add you as a collaborator with admin access

### Function not working after adding secret?
- Make sure the secret name is exactly `RESEND_API_KEY` (case-sensitive)
- Check the Edge Function logs: **Edge Functions > send-voucher-email > Logs**
- Verify the function is deployed and active

### Need to deploy the function?
If the function isn't deployed yet, you have two options:
1. **Ask the project owner** to deploy it using:
   ```bash
   npx supabase@latest functions deploy send-voucher-email
   ```
2. **Use the Dashboard** (if available):
   - Go to Edge Functions
   - Click "Deploy Function" or similar
   - Upload the function code from `supabase/functions/send-voucher-email/`

## Direct Links

- **Dashboard Secrets:** https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions
- **Edge Functions:** https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions

---

**Note:** The CLI permission error you're seeing is common when the project belongs to a different organization or you don't have admin access. The Dashboard method works for most users who can access the project settings.

