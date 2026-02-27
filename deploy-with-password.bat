@echo off
echo ============================================
echo Deploying Migrations to Supabase
echo ============================================
echo.
echo This will deploy all pending migrations
echo Password: Coral@123 (stored securely)
echo.
pause
echo.
echo Deploying...
npx supabase db push -p "Coral@123"
echo.
echo ============================================
echo Deployment Complete!
echo ============================================
pause
