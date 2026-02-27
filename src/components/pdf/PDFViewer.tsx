import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFControls } from './PDFControls';
import { usePDFViewer } from '@/hooks/usePDFViewer';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - use new() syntax to enable bundler to resolve worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onCitationJump?: (pageNumber: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  fileName,
  onCitationJump,
}) => {
  const {
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
  } = usePDFViewer();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLoadSuccess = (pdf: any) => {
    onDocumentLoadSuccess(pdf);
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. The file may be corrupted or inaccessible.');
    setIsLoading(false);
  };

  // Listen for citation jumps from chat
  React.useEffect(() => {
    if (onCitationJump) {
      goToPage(onCitationJump);
    }
  }, [onCitationJump, goToPage]);

  return (
    <div className="h-full flex flex-col bg-gray-100">

      {/* Controls */}
      <PDFControls
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onPageChange={goToPage}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onDownload={handleDownload}
        onPrint={handlePrint}
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};
