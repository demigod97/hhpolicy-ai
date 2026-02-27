import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search, Upload } from 'lucide-react';

interface DocumentTableEmptyProps {
  variant: 'no-documents' | 'no-results';
  onUploadClick?: () => void;
  onClearFilters?: () => void;
  canUpload?: boolean;
}

export const DocumentTableEmpty: React.FC<DocumentTableEmptyProps> = ({
  variant,
  onUploadClick,
  onClearFilters,
  canUpload = false,
}) => {
  if (variant === 'no-documents') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No policy documents available
        </h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md">
          {canUpload
            ? 'Upload your first policy document to get started.'
            : 'No documents have been uploaded yet.'}
        </p>
        {canUpload && onUploadClick && (
          <Button onClick={onUploadClick} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>
    );
  }

  // no-results variant
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No documents match your filters
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        Try adjusting your search criteria or filters.
      </p>
      {onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear All Filters
        </Button>
      )}
    </div>
  );
};
