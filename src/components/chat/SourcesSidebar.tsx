import React from 'react';
import { FileText, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentViewer } from './DocumentViewer';

interface SourcesSidebarProps {
  chatSessionId?: string;
  onDocumentSelect?: (documentId: string) => void;
  selectedCitation?: {
    sourceId: string;
    linesFrom?: number;
    linesTo?: number;
    source_url?: string;
    source_title?: string;
  } | null;
  onCitationClose?: () => void;
}

export const SourcesSidebar: React.FC<SourcesSidebarProps> = ({
  chatSessionId,
  onDocumentSelect,
  selectedCitation,
  onCitationClose,
}) => {
  // Show web citation panel if it's a web citation
  if (selectedCitation?.source_url) {
    return (
      <div className="h-full flex flex-col bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-green-50 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg text-gray-900">
                {selectedCitation.source_title || 'Fair Work Australia'}
              </h3>
            </div>
            {onCitationClose && (
              <Button variant="ghost" size="sm" onClick={onCitationClose}>
                ✕
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            This information was sourced from the Fair Work Australia website. Click below to view the full page.
          </p>
          <p className="text-xs text-gray-500 break-all mb-3">
            {selectedCitation.source_url}
          </p>
          <Button
            className="w-full gap-2"
            onClick={() => window.open(selectedCitation.source_url, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4" />
            Open on Fair Work website
          </Button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
          <Globe className="h-16 w-16 text-green-200 mb-4" />
          <p className="text-sm text-gray-500 text-center">
            Web citations open directly in your browser.
          </p>
        </div>
      </div>
    );
  }

  // Show document citation viewer if citation is selected
  if (selectedCitation) {
    return (
      <div className="h-full flex flex-col bg-white overflow-hidden">
        <DocumentViewer
          sourceId={selectedCitation.sourceId}
          linesFrom={selectedCitation.linesFrom}
          linesTo={selectedCitation.linesTo}
          onClose={onCitationClose}
          chatSessionId={chatSessionId}
        />
      </div>
    );
  }

  // Empty state when no citation selected
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 border-l border-gray-200 p-8">
      <FileText className="h-16 w-16 text-gray-300 mb-4" />
      <p className="text-sm font-medium text-gray-600 mb-2">No Citation Selected</p>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Click on a citation number in the chat to view the source document context
      </p>
    </div>
  );
};
