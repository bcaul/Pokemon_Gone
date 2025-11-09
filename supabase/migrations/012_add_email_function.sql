-- ============================================================================
-- Email Function Migration
-- Adds function to send voucher emails (placeholder - integrate with email service)
-- ============================================================================

-- Function to send voucher email
-- Note: This is a placeholder. In production, integrate with:
-- - Supabase Edge Functions + Resend/SendGrid
-- - Or use Supabase's built-in email (if available)
-- - Or call external API

CREATE OR REPLACE FUNCTION send_voucher_email(
  p_voucher_id UUID,
  p_user_email TEXT,
  p_subject TEXT,
  p_body TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Placeholder function - actual email sending should be done via:
  -- 1. Supabase Edge Function that calls Resend/SendGrid
  -- 2. Or use Supabase's email service (if configured)
  -- 3. Or external API call
  
  -- For now, just log that email should be sent
  -- In production, implement actual email sending here
  
  -- Update voucher to mark email as sent
  UPDATE vouchers
  SET 
    email_sent = TRUE,
    email_sent_at = NOW()
  WHERE id = p_voucher_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_voucher_email(UUID, TEXT, TEXT, TEXT) TO authenticated;

