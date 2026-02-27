import { useState, useCallback, useMemo } from 'react';
import { Document } from './useDocuments';
import { isPolicyOutdated } from '@/lib/policyDateUtils';

export interface DocumentFilters {
  search: string;
  roles: string[];
  policyTypes: string[];
  statuses: string[];
  showOutdatedOnly: boolean;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

const INITIAL_FILTERS: DocumentFilters = {
  search: '',
  roles: [],
  policyTypes: [],
  statuses: [],
  showOutdatedOnly: false,
  dateRange: {
    start: null,
    end: null,
  },
};

export const useDocumentFilters = () => {
  const [filters, setFilters] = useState<DocumentFilters>(INITIAL_FILTERS);

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof DocumentFilters>(
    key: K,
    value: DocumentFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Clear individual filter
  const clearFilter = useCallback((key: keyof DocumentFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: INITIAL_FILTERS[key],
    }));
  }, []);

  // Apply filters to documents
  const filterDocuments = useCallback((documents: Document[]) => {
    return documents.filter(doc => {
      // Search filter
      if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Role filter
      if (filters.roles.length > 0 && !filters.roles.includes(doc.target_role)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(doc.processing_status)) {
        return false;
      }

      // Outdated filter
      if (filters.showOutdatedOnly) {
        const isOutdated = isPolicyOutdated(doc.policyDate);
        if (!isOutdated) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const docDate = new Date(doc.created_at);
        if (filters.dateRange.start && docDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && docDate > filters.dateRange.end) return false;
      }

      return true;
    });
  }, [filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.roles.length > 0) count++;
    if (filters.policyTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.showOutdatedOnly) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  // Get active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.search) {
      chips.push({
        key: 'search',
        label: `Search: "${filters.search}"`,
        onRemove: () => clearFilter('search'),
      });
    }

    filters.roles.forEach(role => {
      chips.push({
        key: `role-${role}`,
        label: `Role: ${role}`,
        onRemove: () => updateFilter('roles', filters.roles.filter(r => r !== role)),
      });
    });

    filters.statuses.forEach(status => {
      chips.push({
        key: `status-${status}`,
        label: `Status: ${status}`,
        onRemove: () => updateFilter('statuses', filters.statuses.filter(s => s !== status)),
      });
    });

    if (filters.showOutdatedOnly) {
      chips.push({
        key: 'outdated',
        label: 'Outdated policies only',
        onRemove: () => updateFilter('showOutdatedOnly', false),
      });
    }

    if (filters.dateRange.start) {
      chips.push({
        key: 'date-start',
        label: `From: ${filters.dateRange.start.toLocaleDateString()}`,
        onRemove: () => updateFilter('dateRange', { ...filters.dateRange, start: null }),
      });
    }

    if (filters.dateRange.end) {
      chips.push({
        key: 'date-end',
        label: `To: ${filters.dateRange.end.toLocaleDateString()}`,
        onRemove: () => updateFilter('dateRange', { ...filters.dateRange, end: null }),
      });
    }

    return chips;
  }, [filters, clearFilter, updateFilter]);

  return {
    filters,
    updateFilter,
    clearFilters,
    clearFilter,
    filterDocuments,
    activeFilterCount,
    activeFilterChips,
  };
};
