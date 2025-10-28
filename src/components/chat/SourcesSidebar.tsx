import React from 'react';
import { FileText } from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';

interface SourcesSidebarProps {
  chatSessionId?: string;
  onDocumentSelect?: (documentId: string) => void;
  selectedCitation?: {
    sourceId: string;
    linesFrom?: number;
    linesTo?: number;
  } | null;
  onCitationClose?: () => void;
}

export const SourcesSidebar: React.FC<SourcesSidebarProps> = ({
  chatSessionId,
  onDocumentSelect,
  selectedCitation,
  onCitationClose,
}) => {
  // Show citation viewer if citation is selected
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
