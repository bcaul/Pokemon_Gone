# PowerShell script to set Resend API Key in Supabase
# This script will guide you through setting up the Resend API key for email functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resend API Key Setup for WanderBeasts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiKey = "re_JCgWVbVq_65th8zQjtjRLz6Apc9Wu3daV"
$projectRef = "tlfrdeutculixxegeyhv"

Write-Host "Resend API Key: $apiKey" -ForegroundColor Green
Write-Host "Supabase Project Ref: $projectRef" -ForegroundColor Green
Write-Host ""

Write-Host "Setting up Resend API Key in Supabase..." -ForegroundColor Yellow
Write-Host ""

# Method 1: Try using Supabase CLI (if logged in)
Write-Host "Method 1: Using Supabase CLI" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

# Check if user is logged in by trying to set the secret
Write-Host "Attempting to set secret via CLI..." -ForegroundColor Yellow

$result = npx supabase@latest secrets set RESEND_API_KEY=$apiKey 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully set Resend API key via CLI!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Deploy the Edge Function" -ForegroundColor Yellow
    Write-Host "Run: npx supabase@latest functions deploy send-voucher-email" -ForegroundColor White
    exit 0
} else {
    Write-Host "❌ CLI method failed (you may need to login first)" -ForegroundColor Red
    Write-Host ""
}

# Method 2: Provide instructions for Supabase Dashboard
Write-Host "Method 2: Using Supabase Dashboard (RECOMMENDED)" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "Follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef/settings/functions" -ForegroundColor White
Write-Host ""
Write-Host "2. Click on the 'Secrets' tab" -ForegroundColor White
Write-Host ""
Write-Host "3. Click 'Add Secret' button" -ForegroundColor White
Write-Host ""
Write-Host "4. Enter the following:" -ForegroundColor White
Write-Host "   Name: RESEND_API_KEY" -ForegroundColor Green
Write-Host "   Value: $apiKey" -ForegroundColor Green
Write-Host ""
Write-Host "5. Click 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "6. Deploy the Edge Function:" -ForegroundColor Yellow
Write-Host "   Run: npx supabase@latest login" -ForegroundColor White
Write-Host "   Then: npx supabase@latest link --project-ref $projectRef" -ForegroundColor White
Write-Host "   Then: npx supabase@latest functions deploy send-voucher-email" -ForegroundColor White
Write-Host ""

# Copy API key to clipboard if possible
try {
    $apiKey | Set-Clipboard
    Write-Host "✅ API key copied to clipboard!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  Could not copy to clipboard. Please copy manually: $apiKey" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete Instructions Provided" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

