import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatSession } from '@/hooks/useChatSession';
import ChatArea from '@/components/notebook/ChatArea';
import ChatHistorySidebar from '@/components/chat/ChatHistorySidebar';
import { SourcesSidebar } from '@/components/chat/SourcesSidebar';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ArrowLeft, Loader2, Menu, X } from 'lucide-react';
import { Citation } from '@/types/message';
import { useToast } from '@/hooks/use-toast';
import { useIsDesktop } from '@/hooks/useIsDesktop';

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

  const handleCitationClick = (citation: Citation) => {
    if (onCitationClick) {
      onCitationClick(citation);
    } else {
      // Default behavior: navigate to dashboard with document ID
      const sourceId = citation.source_id || citation.sourceId;
      const pageNumber = citation.page_number || citation.pageNumber;

      if (sourceId) {
        navigate(`/dashboard?doc=${sourceId}${pageNumber ? `&page=${pageNumber}` : ''}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading chat session...</p>
        </div>
      </div>
    );
  }

  if (error || !chatSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
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
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-normal text-gray-900">
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
      <div className="flex-1 overflow-hidden">
        {isDesktop ? (
          /* Desktop: Three-Panel Resizable Layout */
          <ResizablePanelGroup direction="horizontal">
            {/* Left: Chat History Sidebar */}
            {showSidebar && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
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
            <ResizablePanel defaultSize={50} minSize={40}>
              <ChatArea
                notebookId={sessionId || ''}
                notebook={chatSession}
                onCitationClick={handleCitationClick}
                hasSource={true}
              />
            </ResizablePanel>

            {/* Right: Sources Sidebar */}
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <SourcesSidebar
                chatSessionId={sessionId}
                onDocumentSelect={(docId) => {
                  // Navigate to dashboard with document selected
                  navigate(`/dashboard?doc=${docId}`);
                }}
              />
            </ResizablePanel>
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
    </div>
  );
};

export default ChatInterface;
