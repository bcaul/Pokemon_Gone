/**
 * Email functionality for sending vouchers
 * Uses Supabase Edge Functions + Resend for email delivery
 */

import { supabase } from './supabase.js'

/**
 * Send voucher email to user via Supabase Edge Function
 * This function calls the send-voucher-email edge function
 */
export async function sendVoucherEmail(voucherId) {
  try {
    // Get voucher details with user and business info
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers')
      .select(`
        *,
        challenges (name, description),
        businesses (business_name, business_type, address),
        profiles:user_id (username)
      `)
      .eq('id', voucherId)
      .single()

    if (voucherError) throw voucherError

    // Get user email from auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    const userEmail = user.email
    if (!userEmail) throw new Error('User email not found')

    // Call Supabase Edge Function to send email
    const response = await supabase.functions.invoke('send-voucher-email', {
      body: {
        voucher_id: voucherId,
        user_email: userEmail,
        voucher_code: voucher.voucher_code,
        prize_description: voucher.prize_description,
        business_name: voucher.businesses?.business_name || 'Business',
        redemption_location: voucher.redemption_location,
        expires_at: voucher.expires_at,
      },
    })
    
    const responseData = response.data
    const responseError = response.error

    // Check for errors in the response
    if (responseError) {
      // Extract error details from response
      let errorMessage = responseError.message || 'Unknown error'
      let errorDetails = null
      let errorCode = null
      
      // Check responseError.context (Supabase FunctionsHttpError structure)
      if (responseError.context) {
        try {
          errorDetails = typeof responseError.context === 'string' 
            ? JSON.parse(responseError.context) 
            : responseError.context
          if (errorDetails.error || errorDetails.message) {
            errorMessage = errorDetails.error || errorDetails.message || errorMessage
          }
          if (errorDetails.code) {
            errorCode = errorDetails.code
          }
        } catch (e) {
          errorDetails = responseError.context
        }
      }
      
      // Check responseError.error (alternative error location)
      if (responseError.error) {
        if (typeof responseError.error === 'object') {
          errorDetails = responseError.error
          if (errorDetails.error || errorDetails.message) {
            errorMessage = errorDetails.error || errorDetails.message || errorMessage
          }
          if (errorDetails.code) {
            errorCode = errorDetails.code
          }
        } else if (typeof responseError.error === 'string') {
          errorMessage = responseError.error
        }
      }
      
      // Check if error message or code indicates configuration issue
      const isConfigError = errorCode === 'EMAIL_NOT_CONFIGURED' ||
                           errorMessage.includes('RESEND_API_KEY') || 
                           errorMessage.includes('not configured') || 
                           errorMessage.includes('Email service not configured') ||
                           errorMessage.includes('EMAIL_NOT_CONFIGURED')
      
      if (isConfigError) {
        const configError = new Error('EMAIL_NOT_CONFIGURED')
        configError.details = errorDetails || responseError
        throw configError
      }
      
      if (errorMessage.includes('Missing required fields')) {
        throw new Error('Invalid email request. Please try again or contact support.')
      }
      
      // Generic error - provide helpful message with voucher info
      throw new Error(`Failed to send email: ${errorMessage}. Your voucher code (${voucher.voucher_code}) and prize details are shown in the app and can be used as proof.`)
    }
    
    // Check if the response data indicates an error
    if (responseData && responseData.error) {
      // Check if it's a configuration error
      if (responseData.code === 'EMAIL_NOT_CONFIGURED' || 
          responseData.error.includes('not configured') || 
          responseData.error.includes('RESEND_API_KEY')) {
        const configError = new Error('EMAIL_NOT_CONFIGURED')
        configError.details = responseData
        throw configError
      }
      
      throw new Error(responseData.error || responseData.message || 'Failed to send email')
    }

    // Update voucher to indicate email was sent (only if we got a successful response)
    if (responseData && !responseData.error) {
      const { error: updateError } = await supabase
        .from('vouchers')
        .update({ 
          email_sent: true, 
          email_sent_at: new Date().toISOString() 
        })
        .eq('id', voucherId)

      if (updateError) {
        console.error('Error updating voucher email status:', updateError)
        // Don't throw - email was sent, just couldn't update status
      }
    }

    return { success: true, data: responseData }
  } catch (error) {
    console.error('Error sending voucher email:', error)
    throw error
  }
}

/**
 * Create email template for voucher
 */
function createVoucherEmailTemplate(voucher, userEmail) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7e9278 0%, #5b695d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .voucher-code { background: white; border: 3px dashed #7e9278; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
        .code { font-size: 32px; font-weight: bold; color: #7e9278; letter-spacing: 4px; font-family: monospace; }
        .prize { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>You've completed a challenge and earned a reward!</p>
        </div>
        <div class="content">
          <h2>Your Voucher</h2>
          <p>You've successfully completed the challenge: <strong>${voucher.challenges?.name || 'Challenge'}</strong></p>
          
          <div class="voucher-code">
            <p style="margin: 0 0 10px 0; color: #666;">Voucher Code</p>
            <div class="code">${voucher.voucher_code}</div>
          </div>
          
          <div class="prize">
            <h3 style="margin-top: 0;">Your Reward:</h3>
            <p style="font-size: 18px; margin: 0;">${voucher.prize_description}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Redeem at:</h3>
            <p style="margin: 5px 0;"><strong>${voucher.businesses?.business_name || 'Business'}</strong></p>
            ${voucher.redemption_location ? `<p style="margin: 5px 0; color: #666;">${voucher.redemption_location}</p>` : ''}
          </div>
          
          ${voucher.expires_at ? `<p style="color: #666; font-size: 14px;">This voucher expires on ${new Date(voucher.expires_at).toLocaleDateString()}</p>` : ''}
          
          <p style="margin-top: 30px;">Show this voucher code to the business to redeem your reward!</p>
        </div>
        <div class="footer">
          <p>Thank you for playing WanderBeasts!</p>
          <p>If you have any questions, please contact the business directly.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send voucher email for a specific voucher (can be called from UI)
 */
export async function resendVoucherEmail(voucherId) {
  return sendVoucherEmail(voucherId)
}

