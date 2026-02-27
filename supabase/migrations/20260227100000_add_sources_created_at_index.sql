-- ============================================================================
-- Migration: Add created_at index on sources table
-- Sprint: HHR-173 (Bug fixes)
-- Issue: #8 (Slow Document List Loading), #13 (Missing created_at index)
--
-- The useDocuments.tsx query sorts by created_at DESC and filters by
-- type='pdf' + processing_status IN ('completed','processing','pending').
-- These indexes cover the query plan and eliminate sequential scans.
-- ============================================================================

-- Index for ORDER BY created_at DESC (covers document list sorting)
CREATE INDEX IF NOT EXISTS idx_sources_created_at
  ON public.sources(created_at DESC);

-- Composite index matching the full query filter in useDocuments.tsx:
--   .eq('type', 'pdf')
--   .in('processing_status', ['completed', 'processing', 'pending'])
--   .order('created_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_sources_type_status_created
  ON public.sources(type, processing_status, created_at DESC);
