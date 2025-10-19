@echo off
echo ============================================
echo Deploying Migration: Epic 1.14 Database Fix
echo ============================================
echo.
echo This will deploy the migration to fix chat_sessions FK constraint
echo.
echo Migration file: 20251019000000_fix_chat_sessions_notebook_reference.sql
echo.
echo You will be prompted for your Supabase database password.
echo.
pause
echo.
echo Running migration...
npx supabase db push
echo.
echo ============================================
echo Migration deployment complete!
echo ============================================
pause
