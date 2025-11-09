# 🔧 Troubleshoot Email Issues

## Problem: "Email sent!" but no email arrives

## Step-by-Step Debugging

### Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Try sending an email voucher
4. Look for these messages:

**✅ Good signs:**
```
Email sent successfully with messageId: abc123...
Email send result: { success: true, data: { messageId: '...' } }
```

**⚠️ Warning signs:**
```
Email function returned success but no messageId: { ... }
```

**❌ Error signs:**
```
Error sending voucher email: ...
```

### Step 2: Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/functions/send-voucher-email
2. Click "Logs" tab
3. Try sending an email voucher
4. Look for these log messages:

**✅ Good signs:**
```
Attempting to send email via Resend: { to: '...', hasApiKey: true, ... }
Resend API response: { hasData: true, hasError: false, data: '{"id":"..."}' }
Email sent successfully via Resend: { messageId: '...', ... }
```

**⚠️ Warning signs:**
```
Resend returned success but no message ID. Full response: { ... }
```

**❌ Error signs:**
```
Resend API error: { ... }
RESEND_API_KEY is not set in environment variables
Exception while calling Resend API: ...
```

### Step 3: Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Login to your Resend account
3. Check the "Emails" section
4. Look for:
   - Your emails in the list ✅ Good - emails are being sent
   - Failed emails ❌ Problem - check error messages
   - No emails ⚠️ Problem - emails aren't reaching Resend

### Step 4: Verify Resend API Key

1. Go to: https://supabase.com/dashboard/project/tlfrdeutculixxegeyhv/settings/functions
2. Click "Secrets" tab
3. Verify `RESEND_API_KEY` exists
4. Check it's set to: `re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV`
5. Check Resend Dashboard: https://resend.com/api-keys to verify key is active

### Step 5: Check Your Email

1. Check inbox
2. Check spam/junk folder
3. Search for: "You've earned a reward"
4. Check email from: `onboarding@resend.dev`
5. Check email subject: `🎉 You've earned a reward from [Business Name]!`

## Common Issues and Solutions

### Issue 1: "Resend returned success but no message ID"

**Symptoms:**
- Success message appears
- No messageId in logs
- No email received

**Possible Causes:**
1. Invalid Resend API key
2. Resend API key not set
3. Resend account issue
4. Rate limit exceeded

**Solutions:**
1. Verify API key in Supabase secrets
2. Check Resend Dashboard for account status
3. Test API key directly (see below)
4. Check Resend usage/limits

### Issue 2: "Resend API error"

**Symptoms:**
- Error in Edge Function logs
- Error message about API key or domain

**Possible Causes:**
1. Invalid API key
2. Domain not verified
3. Rate limit exceeded
4. Account suspended

**Solutions:**
1. Verify API key is correct
2. Check Resend Dashboard for domain verification
3. Check Resend usage/limits
4. Contact Resend support if needed

### Issue 3: Email in Spam

**Symptoms:**
- MessageId appears in logs
- Email shows in Resend Dashboard
- But email not in inbox

**Solutions:**
1. Check spam/junk folder
2. Mark as "Not Spam"
3. Add `onboarding@resend.dev` to contacts
4. For production, verify your own domain

### Issue 4: No Logs at All

**Symptoms:**
- No logs in Edge Function
- Success message but no evidence

**Possible Causes:**
1. Function not deployed
2. Wrong function being called
3. Logs not loading

**Solutions:**
1. Verify function is deployed
2. Check function name matches
3. Refresh logs page
4. Try deploying function again

## Test Resend API Key

Test the API key directly using curl:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email from Resend",
    "html": "<p>This is a test email from Resend API.</p>"
  }'
```

Replace `your-email@example.com` with your actual email.

**Expected Response:**
```json
{
  "id": "abc123..."
}
```

If you get this response, the API key works and you should receive the email.

If you get an error, check the error message for details.

## Check Resend Account Status

1. Go to: https://resend.com
2. Login to your account
3. Check:
   - Account status (should be active)
   - API keys (should show your key)
   - Usage/limits (should have remaining quota)
   - Domains (if using custom domain)

## Next Steps

Based on what you find:

1. **If messageId appears in logs:**
   - Email was sent successfully
   - Check spam folder
   - Check Resend Dashboard to confirm
   - Email provider might be blocking it

2. **If no messageId but success:**
   - Check Resend API key
   - Check Edge Function logs for errors
   - Test API key directly
   - Check Resend account status

3. **If errors in logs:**
   - Read error message carefully
   - Check Resend API key
   - Check Resend account status
   - Check rate limits

4. **If no logs at all:**
   - Function might not be deployed
   - Check function deployment status
   - Try redeploying function

## Need More Help?

1. Check `DEBUG_EMAIL_ISSUES.md` for detailed troubleshooting
2. Check `CHECK_EMAIL_STATUS.md` for quick checks
3. Review Edge Function logs for specific error messages
4. Check Resend Dashboard for email status
5. Test API key directly to verify it works

