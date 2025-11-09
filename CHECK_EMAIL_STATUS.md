# 📧 Check Email Status - Quick Guide

## Problem
You're getting "✅ Email sent!" but no email arrives.

## Quick Checks

### 1. Check Browser Console (F12)

1. Open DevTools (F12)
2. Go to Console tab
3. Try sending an email voucher
4. Look for:
   - `Email sent successfully with messageId: ...` ✅ Good - email was sent
   - `Email function returned success but no messageId` ⚠️ Problem - email might not have been sent
   - Any error messages ❌ Problem - check the error

### 2. Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions/send-voucher-email
2. Click "Logs" tab
3. Try sending an email voucher
4. Look for:
   - `Email sent successfully via Resend: { messageId: '...' }` ✅ Good
   - `Resend returned success but no message ID` ⚠️ Problem
   - `Resend API error:` ❌ API issue
   - `RESEND_API_KEY is not set` ❌ Key missing

### 3. Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Check if emails appear in the list
3. Look for:
   - Your emails in "Sent" ✅ Good - email was sent
   - Emails in "Failed" ❌ Problem - check error
   - No emails ⚠️ Problem - emails aren't being sent

### 4. Check Your Email

1. Check inbox
2. Check spam/junk folder
3. Search for: "You've earned a reward"
4. Check email from: `onboarding@resend.dev`

### 5. Verify Resend API Key

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions
2. Click "Secrets" tab
3. Verify `RESEND_API_KEY` exists
4. Check it's set to: `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`

## Common Issues

### ✅ Success with messageId but no email
- **Likely cause:** Email in spam folder or email provider blocking
- **Solution:** Check spam folder, mark as not spam, check Resend Dashboard

### ⚠️ Success but no messageId
- **Likely cause:** Resend API issue or invalid API key
- **Solution:** Check Resend API key, check Edge Function logs, check Resend Dashboard

### ❌ Error in logs
- **Likely cause:** API key invalid, rate limit exceeded, or domain issue
- **Solution:** Check error message in logs, verify API key, check Resend account status

## Test Resend API Key

Test the API key directly:

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

Replace `your-email@example.com` with your actual email address.

If this works, you'll get a response with a message ID, and you should receive the email.

## Next Steps

Based on what you find:

1. **If you see messageId in logs:** Email was sent - check spam folder
2. **If you don't see messageId:** Check Resend API key and Edge Function logs
3. **If you see errors:** Check the error message and fix accordingly
4. **If Resend Dashboard shows emails:** Email was sent - check your email provider

For more details, see `DEBUG_EMAIL_ISSUES.md`.

