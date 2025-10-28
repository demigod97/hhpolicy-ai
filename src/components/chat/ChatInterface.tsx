import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatSession } from '@/hooks/useChatSession';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatSidebarVisibility } from '@/hooks/useChatSidebarVisibility';
import ChatArea from '@/components/notebook/ChatArea';
import ChatHistorySidebar from '@/components/chat/ChatHistorySidebar';
import { SourcesSidebar } from '@/components/chat/SourcesSidebar';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ArrowLeft, Loader2, Menu, X } from 'lucide-react';
import { Citation } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { supabase } from '@/integrations/supabase/client';

interface ChatInterfaceProps {
  onCitationClick?: (citation: Citation) => void;
  onBackToDashboard?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onCitationClick,
  onBackToDashboard,
}) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { chatSession, isLoading, error } = useChatSession(sessionId);
  const isDesktop = useIsDesktop();
  const [showSidebar, setShowSidebar] = useState(isDesktop);

  // Fetch chat messages and determine sources sidebar visibility
  const { messages } = useChatMessages(sessionId);
  const { showSourcesSidebar } = useChatSidebarVisibility(messages);

  // Citation State for Sidebar
  const [selectedCitation, setSelectedCitation] = useState<{
    sourceId: string;
    linesFrom?: number;
    linesTo?: number;
  } | null>(null);

  // PDF Viewer State (for opening full PDF in modal)
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    title: string;
    fileUrl: string;
    pageNumber?: number;
  } | null>(null);

  useEffect(() => {
    // If no session ID provided, redirect to dashboard
    // User should create a session from dashboard
    if (!sessionId) {
      navigate('/dashboard', { replace: true });
    }
  }, [sessionId, navigate]);

  // Auto-show sidebar on desktop, hide on mobile
  useEffect(() => {
    setShowSidebar(isDesktop);
  }, [isDesktop]);

  const handleBackClick = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  const handleCitationClick = async (citation: Citation) => {
    if (onCitationClick) {
      onCitationClick(citation);
      return;
    }

    // Set citation for sidebar display
    const sourceId = citation.source_id || citation.sourceId;
    const linesFrom = citation.chunk_lines_from;
    const linesTo = citation.chunk_lines_to;

    if (sourceId) {
      setSelectedCitation({
        sourceId,
        linesFrom,
        linesTo,
      });
    }
  };

  const openPDFViewer = async (
    documentId: string,
    pageNumber?: number
  ) => {
    try {
      // Fetch document details
      const { data: source, error } = await supabase
        .from('sources')
        .select('id, title, pdf_file_path, pdf_storage_bucket')
        .eq('id', documentId)
        .single();

      if (error || !source) {
        toast({
          title: "Error",
          description: "Could not load document",
          variant: "destructive",
        });
        return;
      }

      // Get signed URL for PDF
      const bucket = source.pdf_storage_bucket || 'sources';
      const { data: signedUrlData } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(source.pdf_file_path, 3600); // 1 hour

      if (signedUrlData?.signedUrl) {
        setSelectedDocument({
          id: source.id,
          title: source.title,
          fileUrl: signedUrlData.signedUrl,
          pageNumber,
        });
        setShowPDFViewer(true);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast({
        title: "Error",
        description: "Failed to open PDF viewer",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading chat session...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !chatSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-medium">Failed to load chat session</p>
              <p className="text-sm text-gray-600 mt-2">
                {error || 'The chat session could not be found.'}
              </p>
            </div>
            <Button onClick={handleBackClick} variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Primary Navigation */}
      <PrimaryNavigationBar />

      {/* Chat Session Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-medium text-gray-900">
            {chatSession.title || 'New Chat'}
          </h1>
        </div>

        {/* Sidebar Toggle (Mobile) */}
        {!isDesktop && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="gap-2"
          >
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {showSidebar ? 'Hide' : 'History'}
          </Button>
        )}
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-1 overflow-hidden h-[calc(100vh-180px)]">
        {isDesktop ? (
          /* Desktop: Three-Panel Resizable Layout */
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left: Chat History Sidebar */}
            {showSidebar && (
              <>
                <ResizablePanel id="history-panel" defaultSize={20} minSize={15} maxSize={25}>
                  <ChatHistorySidebar
                    currentSessionId={sessionId}
                    onSessionSelect={(id) => navigate(`/chat/${id}`)}
                    className="h-full"
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Center: Chat Area */}
            <ResizablePanel
              id="chat-panel"
              defaultSize={
                showSidebar && showSourcesSidebar ? 45
                : showSidebar ? 80
                : showSourcesSidebar ? 65
                : 100
              }
              minSize={35}
            >
              <ChatArea
                notebookId={sessionId || ''}
                notebook={chatSession}
                onCitationClick={handleCitationClick}
                hasSource={true}
              />
            </ResizablePanel>

            {/* Right: Sources Sidebar - Conditionally Rendered */}
            {showSourcesSidebar && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel id="sources-panel" defaultSize={35} minSize={25} maxSize={45}>
                  <SourcesSidebar
                    chatSessionId={sessionId}
                    onDocumentSelect={(docId) => {
                      // Open PDF viewer instead of navigating to dashboard
                      openPDFViewer(docId);
                    }}
                    selectedCitation={selectedCitation}
                    onCitationClose={() => setSelectedCitation(null)}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          /* Mobile: Stack with toggle */
          <div className="h-full relative">
            {showSidebar ? (
              <div className="absolute inset-0 bg-white z-10">
                <ChatHistorySidebar
                  currentSessionId={sessionId}
                  onSessionSelect={(id) => {
                    navigate(`/chat/${id}`);
                    setShowSidebar(false);
                  }}
                  className="h-full"
                />
              </div>
            ) : (
              <ChatArea
                notebookId={sessionId || ''}
                notebook={chatSession}
                onCitationClick={handleCitationClick}
                hasSource={true}
              />
            )}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      <Sheet open={showPDFViewer} onOpenChange={setShowPDFViewer}>
        <SheetContent side="right" className="w-full sm:w-[80vw] sm:max-w-4xl p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{selectedDocument?.title || 'Document Viewer'}</SheetTitle>
          </SheetHeader>
          {selectedDocument && (
            <div className="h-[calc(100vh-80px)]">
              <PDFViewer
                fileUrl={selectedDocument.fileUrl}
                fileName={selectedDocument.title}
                onCitationJump={selectedDocument.pageNumber}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChatInterface;
