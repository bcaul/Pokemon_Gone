# Business System for WanderBeasts

This document describes the business/admin side of the WanderBeasts app, where businesses can create challenges with location-based rewards.

## Features

### For Businesses:
1. **Business Registration/Login** - Separate authentication for business accounts
2. **Create Challenges** - Set up location-based challenges with:
   - Challenge type (collect creatures, walk distance)
   - Target value (e.g., catch 5 creatures, walk 1000 meters)
   - Location and radius (using interactive map)
   - Prize description (e.g., "Free side dish")
   - Prize expiration date
   - Reward points
3. **Manage Challenges** - View all challenges, see completion stats, and deactivate challenges
4. **View Vouchers** - See all vouchers issued for your challenges and mark them as redeemed
5. **Business Settings** - Update business information (name, type, address, contact info)

### For Players:
1. **View Business Challenges** - See challenges from businesses with prize information
2. **Complete Challenges** - Complete challenges to earn vouchers
3. **View Vouchers** - Access all vouchers/tickets in the Vouchers tab
4. **Receive Email** - Get voucher codes via email when challenges are completed

## Database Schema

### New Tables:
- `businesses` - Business account information
- `vouchers` - Vouchers/tickets issued to players
- Updated `challenges` table with:
  - `business_id` - Link to business that created the challenge
  - `prize_description` - Description of the prize
  - `prize_expires_at` - When the prize expires
- Updated `profiles` table with:
  - `role` - 'player', 'business', or 'admin'

### Triggers:
- Automatic voucher creation when a business challenge is completed
- Voucher code generation (unique 8-character codes)

## Setup Instructions

### 1. Run Database Migrations

Run the migration files in order:
```bash
supabase migration up
```

Or manually run:
- `011_add_business_system.sql` - Creates businesses, vouchers, and triggers
- `012_add_email_function.sql` - Creates email function (placeholder)

### 2. Email Integration (Required for Production)

**Important: Use Your Existing Supabase Project!**

You don't need to create a new Supabase project. Edge functions are part of your existing project. Just deploy the function to the same project your app is already using.

**Quick Setup (Recommended: Resend + Supabase Edge Functions)**

See `EMAIL_SETUP_GUIDE.md` for detailed instructions, or `QUICK_EMAIL_SETUP.md` for a quick reference. Quick steps:

1. **Install Supabase CLI** (if not already installed):
   
   **Windows (using Scoop - Recommended):**
   ```powershell
   # Install Scoop first (if needed)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
   
   # Then install Supabase CLI
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```
   
   **Windows (using npx - no installation needed):**
   ```bash
   # Just use npx supabase@latest instead of supabase in all commands
   npx supabase@latest login
   ```
   
   **Mac/Linux:**
   ```bash
   brew install supabase/tap/supabase
   ```
   
   See `EMAIL_SETUP_GUIDE.md` for all installation options.

2. **Login and link your project**:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Create Resend account** and get API key:
   - Sign up at [resend.com](https://resend.com)
   - Create API key in dashboard

4. **Set Resend API key as secret**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```

5. **Deploy the edge function**:
   ```bash
   supabase functions deploy send-voucher-email
   ```

6. **Verify domain** (optional for production):
   - Add your domain in Resend dashboard
   - Update `from` email in `supabase/functions/send-voucher-email/index.ts`

The edge function is already created at `supabase/functions/send-voucher-email/index.ts` and the client code in `src/lib/email.js` is already configured to use it.

**For detailed setup instructions, see `EMAIL_SETUP_GUIDE.md`**

### 3. Access Business Dashboard

1. Navigate to `/business` in your browser
2. Register a new business account or sign in
3. You'll be redirected to `/business/dashboard`

## Usage

### Creating a Challenge (Business):

1. Sign in to the business dashboard
2. Click "Create Challenge" tab
3. Fill in challenge details:
   - Name: e.g., "Catch 5 Creatures at Whitworth Park"
   - Description: Optional description
   - Type: Collect creatures or Walk distance
   - Target: Number of creatures or meters
   - Location: Click on map to set challenge location
   - Radius: Distance from location (meters)
   - Prize: What the player gets (e.g., "Free side dish")
   - Expiration: When the prize expires (optional)
4. Click "Create Challenge"

### Completing a Challenge (Player):

1. View challenges on the map
2. Accept a business challenge
3. Complete the challenge requirements (catch creatures, walk distance)
4. When completed, a voucher is automatically created
5. Voucher code is sent via email (if email is configured)
6. View voucher in the "Vouchers" tab

### Redeeming a Voucher (Business):

1. Go to "Vouchers" tab in business dashboard
2. Find the voucher by code or customer name
3. Click "Mark as Redeemed" when customer uses the voucher
4. Voucher status updates to "redeemed"

## File Structure

### New Components:
- `src/components/BusinessAuth.jsx` - Business login/registration
- `src/components/BusinessDashboard.jsx` - Main business dashboard
- `src/components/CreateChallenge.jsx` - Challenge creation form with map
- `src/components/BusinessChallenges.jsx` - Challenge management
- `src/components/Vouchers.jsx` - Player voucher viewing

### New Libraries:
- `src/lib/email.js` - Email functionality (needs integration)

### Updated Files:
- `src/App.jsx` - Added business routes and role checking
- `src/components/BottomNav.jsx` - Added Vouchers tab
- `src/components/ChallengePanel.jsx` - Added prize display
- `src/hooks/useChallenges.js` - Added business and prize data

## Security

- Row Level Security (RLS) policies are set up for:
  - Businesses can only view/update their own business
  - Users can only view their own vouchers
  - Businesses can view vouchers for their challenges
- Business accounts are separated from player accounts via `role` field
- Voucher codes are unique and generated securely

## Future Enhancements

1. **Email Integration** - Complete email sending functionality
2. **QR Code Generation** - Generate QR codes for vouchers
3. **Analytics Dashboard** - Show challenge completion rates, popular challenges
4. **Multiple Prizes** - Support for multiple prize tiers
5. **Scheduled Challenges** - Challenges that activate at specific times
6. **Business Verification** - Verify business accounts before they can create challenges
7. **Challenge Templates** - Pre-made challenge templates for common scenarios

## Troubleshooting

### Vouchers not being created:
- Check that the challenge has `business_id` and `prize_description` set
- Verify the trigger is installed: `trigger_create_voucher_on_completion`
- Check database logs for errors

### Email not sending:
- Email functionality requires integration (see Email Integration section)
- Check that `email_sent` field is being updated
- Verify user email is correct in auth.users table

### Business account not working:
- Verify `role` field is set to 'business' in profiles table
- Check that business record exists in `businesses` table
- Ensure RLS policies allow business to access their data

## Support

For issues or questions, please check:
1. Database migration logs
2. Browser console for errors
3. Supabase logs for RPC function errors
4. Network tab for API errors

