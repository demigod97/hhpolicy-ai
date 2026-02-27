import { useState, useCallback, useMemo } from 'react';
import { Document } from './useDocuments';

export type SortColumn = 'title' | 'policyDate' | 'target_role' | 'processing_status' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface DocumentSort {
  column: SortColumn;
  direction: SortDirection;
}

export interface DocumentTableState {
  selectedRows: Set<string>;
  sort: DocumentSort;
  page: number;
  pageSize: number;
}

const INITIAL_STATE: DocumentTableState = {
  selectedRows: new Set(),
  sort: {
    column: 'created_at',
    direction: 'desc',
  },
  page: 1,
  pageSize: 25,
};

export const useDocumentTable = () => {
  // Load sort from localStorage
  const [state, setState] = useState<DocumentTableState>(() => {
    const savedSort = localStorage.getItem('documentTableSort');
    const savedPageSize = localStorage.getItem('documentTablePageSize');

    return {
      ...INITIAL_STATE,
      sort: savedSort ? JSON.parse(savedSort) : INITIAL_STATE.sort,
      pageSize: savedPageSize ? parseInt(savedPageSize, 10) : INITIAL_STATE.pageSize,
    };
  });

  // Sort handlers
  const handleSort = useCallback((column: SortColumn) => {
    setState(prev => {
      const newDirection =
        prev.sort.column === column && prev.sort.direction === 'asc'
          ? 'desc'
          : 'asc';

      const newSort = { column, direction: newDirection };

      // Persist to localStorage
      localStorage.setItem('documentTableSort', JSON.stringify(newSort));

      return {
        ...prev,
        sort: newSort,
        page: 1, // Reset to first page when sorting
      };
    });
  }, []);

  // Selection handlers
  const toggleRowSelection = useCallback((id: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedRows);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { ...prev, selectedRows: newSelected };
    });
  }, []);

  const toggleAllRows = useCallback((documentIds: string[]) => {
    setState(prev => {
      const allSelected = documentIds.every(id => prev.selectedRows.has(id));
      const newSelected = new Set(prev.selectedRows);

      if (allSelected) {
        // Deselect all
        documentIds.forEach(id => newSelected.delete(id));
      } else {
        // Select all
        documentIds.forEach(id => newSelected.add(id));
      }

      return { ...prev, selectedRows: newSelected };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedRows: new Set() }));
  }, []);

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    localStorage.setItem('documentTablePageSize', pageSize.toString());
    setState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Sort documents
  const sortDocuments = useCallback((documents: Document[]) => {
    const { column, direction } = state.sort;

    return [...documents].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (column) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'policyDate':
          aVal = a.policyDate || '';
          bVal = b.policyDate || '';
          break;
        case 'target_role':
          aVal = a.target_role;
          bVal = b.target_role;
          break;
        case 'processing_status':
          aVal = a.processing_status;
          bVal = b.processing_status;
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [state.sort]);

  // Paginate documents
  const paginateDocuments = useCallback((documents: Document[]) => {
    const startIndex = (state.page - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return documents.slice(startIndex, endIndex);
  }, [state.page, state.pageSize]);

  return {
    ...state,
    handleSort,
    toggleRowSelection,
    toggleAllRows,
    clearSelection,
    setPage,
    setPageSize,
    sortDocuments,
    paginateDocuments,
  };
};
