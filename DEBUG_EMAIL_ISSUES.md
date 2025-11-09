# 🔍 Debug Email Issues

## Problem: Success Message But No Email

You're getting the success message "✅ Email sent! Check your inbox for your voucher details." but not receiving emails.

## Possible Causes

### 1. Resend API Key Not Set or Invalid

**Check:**
- Go to Supabase Dashboard > Settings > Edge Functions > Secrets
- Verify `RESEND_API_KEY` exists and is set to: `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
- Check Resend Dashboard: https://resend.com/api-keys to verify the key is active

### 2. Email Going to Spam

**Check:**
- Check your spam/junk folder
- The email is sent from `onboarding@resend.dev` (Resend's test domain)
- Subject: `🎉 You've earned a reward from [Business Name]!`

### 3. Resend Domain Not Verified

**Issue:**
- The function uses `onboarding@resend.dev` which should work without verification
- But if Resend has restrictions, emails might not be sent

**Solution:**
- Check Resend Dashboard: https://resend.com/domains
- Verify your account allows sending from `onboarding@resend.dev`
- If not, you may need to verify a domain

### 4. Resend API Limits Exceeded

**Check:**
- Go to Resend Dashboard: https://resend.com
- Check your usage and limits
- Free tier: 3,000 emails/month
- If exceeded, you'll need to upgrade or wait for reset

### 5. Function Returning Success But Email Not Sent

**Check Edge Function Logs:**
1. Go to Supabase Dashboard > Edge Functions > send-voucher-email
2. Click on "Logs" tab
3. Look for errors or warnings
4. Check if `messageId` is being returned

**What to look for:**
- `Email sent successfully via Resend: { messageId: '...' }` - Good!
- `Resend returned success but no message ID` - Problem!
- `Resend API error:` - API issue
- `RESEND_API_KEY is not set` - Key missing

## Debugging Steps

### Step 1: Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions/send-voucher-email
2. Click "Logs" tab
3. Try sending an email voucher
4. Check the logs for:
   - `Email sent successfully via Resend:` - Should show messageId
   - Any errors or warnings

### Step 2: Verify Resend API Key

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions
2. Click "Secrets" tab
3. Verify `RESEND_API_KEY` exists
4. Check the value (should start with `re_`)

### Step 3: Test Resend API Key

You can test the API key directly:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test email from Resend</p>"
  }'
```

If this works, the API key is valid. If it fails, check the error message.

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try sending an email voucher
4. Look for:
   - `Email sent successfully with messageId: ...` - Good!
   - `Email function returned success but no messageId` - Problem!
   - Any error messages

### Step 5: Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Check if emails are being sent
3. Look for:
   - Successful sends (should show your emails)
   - Failed sends (will show errors)
   - Rate limits (if exceeded)

## Common Issues and Solutions

### Issue: "Resend returned success but no message ID"

**Cause:** Resend API returned success but didn't provide a message ID, which means the email wasn't actually sent.

**Solution:**
1. Check Resend API key is valid
2. Check Resend account status
3. Verify domain verification (if using custom domain)
4. Check API limits

### Issue: Emails in Spam

**Cause:** Emails from `onboarding@resend.dev` might be flagged as spam.

**Solution:**
1. Check spam folder
2. Mark as "Not Spam"
3. Add `onboarding@resend.dev` to contacts
4. For production, verify your own domain in Resend

### Issue: "RESEND_API_KEY is not set"

**Cause:** The secret is not set in Supabase.

**Solution:**
1. Go to Supabase Dashboard > Settings > Edge Functions > Secrets
2. Add secret: `RESEND_API_KEY` = `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
3. Redeploy the function (if needed)

### Issue: Rate Limit Exceeded

**Cause:** You've exceeded Resend's free tier limit (3,000 emails/month).

**Solution:**
1. Check Resend Dashboard for usage
2. Wait for monthly reset
3. Upgrade Resend plan if needed

## Improved Error Handling

The code has been updated to:
1. ✅ Check for `messageId` in response (proves email was sent)
2. ✅ Log detailed information about email sends
3. ✅ Warn if success but no messageId
4. ✅ Only mark email as sent if we have messageId

## Next Steps

1. **Check Edge Function Logs** - See what's actually happening
2. **Verify Resend API Key** - Make sure it's set correctly
3. **Test Resend API** - Test the key directly
4. **Check Resend Dashboard** - See if emails are being sent
5. **Check Spam Folder** - Emails might be there

## Quick Test

Try sending an email voucher and check:

1. **Browser Console:** Look for `Email sent successfully with messageId: ...`
2. **Edge Function Logs:** Look for `Email sent successfully via Resend: { messageId: '...' }`
3. **Resend Dashboard:** Check if email appears in sent emails
4. **Your Email:** Check inbox and spam folder

If you see the messageId in logs but no email, it's likely:
- Going to spam
- Resend domain issue
- Email provider blocking

If you don't see messageId, the email wasn't actually sent (check Resend API key and limits).

