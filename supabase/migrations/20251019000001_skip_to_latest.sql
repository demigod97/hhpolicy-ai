-- ============================================================================
-- Migration: Mark all previous migrations as applied (skip to latest)
-- Epic 1.14: Document & Chat Architecture Restructure
-- Date: 2025-10-19
-- ============================================================================

-- This migration is intentionally empty.
-- It serves as a marker to skip all previous migrations that are already
-- applied to the database.

-- The Supabase migration system will record this migration as applied,
-- and we can then apply only the new migration (fix_chat_sessions_notebook_reference)

-- No changes needed - database is already up to date with previous migrations

SELECT 1; -- Dummy statement to make the migration valid
