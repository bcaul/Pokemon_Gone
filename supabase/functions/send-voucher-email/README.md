# Send Voucher Email Edge Function

This Supabase Edge Function sends voucher emails to players when they complete business challenges.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
supabase link --project-ref your-project-ref
```

### 4. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Copy the API key

### 5. Set Environment Variable

```bash
# Set the Resend API key as a Supabase secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### 6. Deploy the Function

```bash
supabase functions deploy send-voucher-email
```

### 7. Verify Domain (Optional but Recommended)

1. In Resend dashboard, go to Domains
2. Add your domain (e.g., wanderbeasts.com)
3. Verify the domain by adding DNS records
4. Update the `from` email in `index.ts` to use your verified domain:
   ```typescript
   from: 'WanderBeasts <noreply@yourdomain.com>'
   ```

## Testing

Test the function locally:

```bash
supabase functions serve send-voucher-email
```

Then call it:

```bash
curl -X POST http://localhost:54321/functions/v1/send-voucher-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "voucher_id": "test-id",
    "user_email": "test@example.com",
    "voucher_code": "ABC12345",
    "prize_description": "Free side dish",
    "business_name": "Test Restaurant",
    "redemption_location": "123 Main St",
    "expires_at": "2024-12-31T23:59:59Z"
  }'
```

## Usage

The function is called from the client-side code in `src/lib/email.js`. It expects:

- `voucher_id` - UUID of the voucher
- `user_email` - Email address of the user
- `voucher_code` - The voucher code to display
- `prize_description` - Description of the prize
- `business_name` - Name of the business
- `redemption_location` - Where to redeem (optional)
- `expires_at` - Expiration date (optional)

## Troubleshooting

- **Email not sending**: Check that RESEND_API_KEY is set correctly
- **Domain not verified**: Use a verified domain or Resend's test domain
- **CORS errors**: Check that CORS headers are properly set
- **Function not found**: Make sure the function is deployed

