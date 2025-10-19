
import React, { useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import NotebookHeader from '@/components/notebook/NotebookHeader';
import SourcesSidebar from '@/components/notebook/SourcesSidebar';
import ChatArea from '@/components/notebook/ChatArea';
import StudioSidebar from '@/components/notebook/StudioSidebar';
import MobileNotebookTabs from '@/components/notebook/MobileNotebookTabs';
import NotebookDebugPanel from '@/components/notebook/NotebookDebugPanel';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Citation } from '@/types/message';

// Lazy load CopilotKit component only when needed
const ChatAreaCopilotKit = lazy(() => import('@/components/notebook/ChatAreaCopilotKit'));

const Notebook = () => {
  const { id: notebookId } = useParams();
  const { notebooks } = useNotebooks();
  const { sources } = useSources(notebookId);
  const { flags } = useFeatureFlags();
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const isDesktop = useIsDesktop();

  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  // Dynamic width calculations for desktop - expand studio when editing notes
  const sourcesWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[25%]';
  const studioWidth = 'w-[30%]'; // Expanded width for note editing
  const chatWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[45%]';

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <NotebookHeader
        title={notebook?.title || 'New Chat'}
        notebookId={notebookId}
      />

      {isDesktop ? (
        // Desktop layout (3-column) - Each component wrapped in error boundary
        <div className="flex-1 flex overflow-hidden">
          <div className={`${sourcesWidth} flex-shrink-0`}>
            <ErrorBoundary componentName="SourcesSidebar" fallback={
              <div className="h-full flex items-center justify-center bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">SourcesSidebar failed to load</p>
              </div>
            }>
              <SourcesSidebar
                hasSource={hasSource || false}
                notebookId={notebookId}
                selectedCitation={selectedCitation}
                onCitationClose={handleCitationClose}
                setSelectedCitation={setSelectedCitation}
              />
            </ErrorBoundary>
          </div>

          <div className={`${chatWidth} flex-shrink-0`}>
            <ErrorBoundary componentName={flags.enableAGUI ? "ChatAreaCopilotKit" : "ChatArea"} fallback={
              <div className="h-full flex items-center justify-center bg-red-50 p-4">
                <div className="text-center">
                  <p className="text-sm text-red-800 mb-2">
                    {flags.enableAGUI ? "ChatAreaCopilotKit" : "ChatArea"} failed to load
                  </p>
                  <p className="text-xs text-red-600">Check browser console for details</p>
                </div>
              </div>
            }>
              {flags.enableAGUI ? (
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading CopilotKit...</p>
                    </div>
                  </div>
                }>
                  <ChatAreaCopilotKit
                    hasSource={hasSource || false}
                    notebookId={notebookId}
                    notebook={notebook}
                    onCitationClick={handleCitationClick}
                  />
                </Suspense>
              ) : (
                <ChatArea
                  hasSource={hasSource || false}
                  notebookId={notebookId}
                  notebook={notebook}
                  onCitationClick={handleCitationClick}
                />
              )}
            </ErrorBoundary>
          </div>

          <div className={`${studioWidth} flex-shrink-0`}>
            <ErrorBoundary componentName="StudioSidebar" fallback={
              <div className="h-full flex items-center justify-center bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">StudioSidebar failed to load</p>
              </div>
            }>
              <StudioSidebar
                notebookId={notebookId}
                onCitationClick={handleCitationClick}
              />
            </ErrorBoundary>
          </div>
        </div>
      ) : (
        // Mobile/Tablet layout (tabs)
        <MobileNotebookTabs
          hasSource={hasSource || false}
          notebookId={notebookId}
          notebook={notebook}
          selectedCitation={selectedCitation}
          onCitationClose={handleCitationClose}
          setSelectedCitation={setSelectedCitation}
          onCitationClick={handleCitationClick}
        />
      )}

      {/* Debug panel - only shows in development */}
      <NotebookDebugPanel />
    </div>
  );
};

export default Notebook;
