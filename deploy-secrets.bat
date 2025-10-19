@echo off
REM CopilotKit Cloud Deployment - Set Supabase Secrets
REM Date: January 17, 2025
REM Purpose: Configure all required secrets for copilotkit-adapter edge function

echo.
echo 🚀 Setting up Supabase secrets for CopilotKit Cloud integration...
echo.

REM n8n Webhook URLs (Role-based chat)
echo 📝 Setting n8n webhook URLs...
call supabase secrets set BOARD_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/01c03d10-5f14-4ac5-ba2d-1a7b0361bb38"
call supabase secrets set EXECUTIVE_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/705f01a7-0cc9-41c4-8ecb-20c6e7f8f0e3"
call supabase secrets set NOTEBOOK_CHAT_URL="https://n8n-prod.coralshades.ai/webhook/2fabf43f-6e6e-424b-8e93-9150e9ce7d6c"

REM n8n Authentication
echo 🔐 Setting authentication token...
call supabase secrets set NOTEBOOK_GENERATION_AUTH="Coral@123"

REM OpenAI API Key
echo 🤖 Setting OpenAI API key...
call supabase secrets set OPENAI_API_KEY="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"

echo.
echo ✅ Secrets configured successfully!
echo.
echo 📋 Verifying secrets...
call supabase secrets list

echo.
echo 🎯 Next steps:
echo 1. Deploy edge function: supabase functions deploy copilotkit-adapter
echo 2. Test the deployment with curl or Postman
echo 3. Deploy frontend: npm run build
echo.
pause
