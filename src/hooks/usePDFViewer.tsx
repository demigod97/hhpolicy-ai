import { useState, useCallback } from 'react';

export const usePDFViewer = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [searchText, setSearchText] = useState<string>('');

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  }, [numPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 2.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const fitToWidth = useCallback(() => {
    // Calculate scale based on container width
    setScale(1.2); // Placeholder - calculate dynamically
  }, []);

  return {
    numPages,
    currentPage,
    scale,
    searchText,
    setSearchText,
    onDocumentLoadSuccess,
    goToPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToWidth,
  };
};
