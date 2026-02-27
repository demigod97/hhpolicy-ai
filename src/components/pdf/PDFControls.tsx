import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Search as SearchIcon,
} from 'lucide-react';

interface PDFControlsProps {
  currentPage: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownload: () => void;
  onPrint: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  currentPage,
  numPages,
  scale,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownload,
  onPrint,
  searchText,
  onSearchChange,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-3 flex-wrap">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={numPages}
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm text-gray-600">of {numPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onZoomOut} disabled={scale <= 0.5}>
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="text-sm text-gray-600 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <Button variant="outline" size="sm" onClick={onZoomIn} disabled={scale >= 2.0}>
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onResetZoom}>
          Reset
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Search */}
      <div className="flex-1 min-w-[200px] max-w-[300px]">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search in document..."
            className="pl-9 h-8"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Document Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
