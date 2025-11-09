// Supabase Edge Function to send voucher emails via Resend
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const resend = new Resend(RESEND_API_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body with better error handling
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { voucher_id, user_email, voucher_code, prize_description, business_name, redemption_location, expires_at } = requestBody

    // Validate required fields with detailed error messages
    const missingFields = []
    if (!voucher_id) missingFields.push('voucher_id')
    if (!user_email) missingFields.push('user_email')
    if (!voucher_code) missingFields.push('voucher_code')
    if (!prize_description) missingFields.push('prize_description')
    if (!business_name) missingFields.push('business_name')

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing_fields: missingFields,
          received: {
            voucher_id: !!voucher_id,
            user_email: !!user_email,
            voucher_code: !!voucher_code,
            prize_description: !!prize_description,
            business_name: !!business_name
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY || RESEND_API_KEY.trim() === '') {
      console.error('RESEND_API_KEY is not set in environment variables')
      // Return a more helpful error message that the client can display
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          message: 'RESEND_API_KEY environment variable is not set. Please configure Resend API key in Supabase secrets.',
          action_required: 'Set up Resend API key in Supabase dashboard > Settings > Edge Functions > Secrets',
          setup_url: 'https://resend.com',
          code: 'EMAIL_NOT_CONFIGURED'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Voucher - WanderBeasts</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #7e9278 0%, #5b695d 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .voucher-code {
            background: #f9f9f9;
            border: 3px dashed #7e9278;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
            border-radius: 10px;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: #7e9278;
            letter-spacing: 6px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
          }
          .prize {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
          }
          .prize h3 {
            margin-top: 0;
            color: #856404;
          }
          .business-info {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
          }
          .business-info h3 {
            margin-top: 0;
            color: #0d47a1;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .expiry-notice {
            background: #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
            color: #856404;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>You've completed a challenge and earned a reward!</p>
          </div>
          
          <h2 style="color: #333; margin-top: 0;">Your Voucher</h2>
          <p>You've successfully completed a challenge from <strong>${business_name}</strong> and earned a reward!</p>
          
          <div class="voucher-code">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Voucher Code</p>
            <div class="code">${voucher_code}</div>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Show this code to redeem your reward</p>
          </div>
          
          <div class="prize">
            <h3 style="margin-top: 0;">Your Reward:</h3>
            <p style="font-size: 18px; margin: 0; color: #333;">${prize_description}</p>
          </div>
          
          <div class="business-info">
            <h3 style="margin-top: 0;">Redeem at:</h3>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #333;">${business_name}</p>
            ${redemption_location ? `<p style="margin: 5px 0; color: #666;">${redemption_location}</p>` : ''}
          </div>
          
          ${expires_at ? `
            <div class="expiry-notice">
              ⏰ This voucher expires on ${new Date(expires_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          ` : ''}
          
          <p style="margin-top: 30px; color: #666;">
            <strong>How to redeem:</strong><br>
            Visit ${business_name} and show them your voucher code (${voucher_code}) to claim your reward!
          </p>
          
          <div class="footer">
            <p>Thank you for playing <strong>WanderBeasts</strong>!</p>
            <p>If you have any questions, please contact the business directly.</p>
            <p style="margin-top: 15px; color: #999;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email via Resend
    let emailData
    try {
      const { data, error } = await resend.emails.send({
        from: 'WanderBeasts <onboarding@resend.dev>', // Use Resend's test domain by default
        to: [user_email],
        subject: `🎉 You've earned a reward from ${business_name}!`,
        html: emailHtml,
      })

      if (error) {
        console.error('Resend API error:', JSON.stringify(error, null, 2))
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email via Resend',
            details: error,
            message: error.message || 'Unknown Resend API error',
            suggestion: 'Check Resend API key, domain verification, and API limits'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      emailData = data
      console.log('Email sent successfully via Resend:', emailData?.id)
    } catch (resendError) {
      console.error('Exception while calling Resend API:', resendError)
      return new Response(
        JSON.stringify({ 
          error: 'Exception while sending email',
          details: resendError.message,
          stack: resendError.stack
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: emailData?.id,
        voucher_id: voucher_id,
        user_email: user_email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error in send-voucher-email function:', error)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        details: error.toString(),
        type: error.constructor.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

