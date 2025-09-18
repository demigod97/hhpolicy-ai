import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Upload, FileText, Loader2, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { usePolicyChat } from '@/hooks/usePolicyChat';
import { useUserRole } from '@/hooks/useUserRole';
import { useSources } from '@/hooks/useSources';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import PolicyCitationComponent from '@/components/chat/PolicyCitationComponent';
import SaveToNoteButton from '../notebook/SaveToNoteButton';
import AddSourcesDialog from '../notebook/AddSourcesDialog';
import { Citation, EnhancedChatMessage } from '@/types/message';

interface PolicyChatInterfaceProps {
  hasSource: boolean;
  policyDocumentId?: string;
  policyDocument?: {
    id: string;
    title: string;
    description?: string;
    generation_status?: string;
    icon?: string;
    example_questions?: string[];
    role_assignment?: string;
  } | null;
  onCitationClick?: (citation: Citation) => void;
}

const PolicyChatInterface = ({
  hasSource,
  policyDocumentId,
  policyDocument,
  onCitationClick
}: PolicyChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const { userRole, isLoading: roleLoading } = useUserRole();
  const isGenerating = policyDocument?.generation_status === 'generating';

  const {
    messages,
    sendMessage,
    isSending,
    deleteChatHistory,
    isDeletingChatHistory,
    hasAccessToPolicyDocument,
    isAuthenticated
  } = usePolicyChat(policyDocumentId);

  const {
    sources
  } = useSources(policyDocumentId);

  const sourceCount = sources?.length || 0;

  // Check if at least one source has been successfully processed
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  // Role-based access check
  useEffect(() => {
    const checkAccess = async () => {
      if (policyDocumentId && userRole && !roleLoading) {
        // Check role compatibility
        if (policyDocument?.role_assignment && policyDocument.role_assignment !== userRole) {
          setAccessError(`Access denied: This policy document is assigned to ${policyDocument.role_assignment} role, but you have ${userRole} role.`);
          return;
        }

        // Double-check database access
        const hasAccess = await hasAccessToPolicyDocument(policyDocumentId);
        if (!hasAccess) {
          setAccessError('Access denied: You do not have permission to access this policy document.');
          return;
        }

        setAccessError(null);
      }
    };

    checkAccess();
  }, [policyDocumentId, userRole, roleLoading, policyDocument?.role_assignment, hasAccessToPolicyDocument]);

  // Chat should be disabled if there are no processed sources or access is denied
  const isChatDisabled = !hasProcessedSource || !!accessError || !isAuthenticated;

  // Track when we send a message to show loading state
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Ref for auto-scrolling to the most recent message
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we have new messages and we have a pending message, clear it
    if (messages.length > lastMessageCount && pendingUserMessage) {
      setPendingUserMessage(null);
      setShowAiLoading(false);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, pendingUserMessage]);

  // Auto-scroll when pending message is set, when messages update, or when AI loading appears
  useEffect(() => {
    if (latestMessageRef.current && scrollAreaRef.current) {
      // Find the viewport within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 50);
      }
    }
  }, [pendingUserMessage, messages.length, showAiLoading]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && policyDocumentId && !isChatDisabled) {
      try {
        // Store the pending message to display immediately
        setPendingUserMessage(textToSend);
        await sendMessage({
          policyDocumentId: policyDocumentId,
          role: 'user',
          content: textToSend
        });
        setMessage('');

        // Show AI loading after user message is sent
        setShowAiLoading(true);
      } catch (error) {
        console.error('PolicyChat: Failed to send message:', error);
        // Clear pending message on error
        setPendingUserMessage(null);
        setShowAiLoading(false);
      }
    }
  };

  const handleRefreshChat = () => {
    if (policyDocumentId) {
      console.log('PolicyChat: Refresh button clicked for policy document:', policyDocumentId);
      deleteChatHistory(policyDocumentId);
      // Reset clicked questions when chat is refreshed
      setClickedQuestions(new Set());
    }
  };

  const handleCitationClick = (citation: Citation) => {
    onCitationClick?.(citation);
  };

  const handleExampleQuestionClick = (question: string) => {
    // Add question to clicked set to remove it from display
    setClickedQuestions(prev => new Set(prev).add(question));
    setMessage(question);
    handleSendMessage(question);
  };

  // Helper function to determine if message is from user
  const isUserMessage = (msg: EnhancedChatMessage) => {
    const messageType = msg.message?.type;
    return messageType === 'human';
  };

  // Helper function to determine if message is from AI
  const isAiMessage = (msg: EnhancedChatMessage) => {
    const messageType = msg.message?.type;
    return messageType === 'ai';
  };

  // Get the index of the last message for auto-scrolling
  const shouldShowScrollTarget = () => {
    return messages.length > 0 || pendingUserMessage || showAiLoading;
  };

  // Show refresh button if there are any messages (including system messages)
  const shouldShowRefreshButton = messages.length > 0;

  // Get example questions from the policy document, filtering out clicked ones
  const exampleQuestions = policyDocument?.example_questions?.filter(q => !clickedQuestions.has(q)) || [];

  // Update placeholder text based on processing status
  const getPlaceholderText = () => {
    if (accessError) {
      return "Access denied...";
    }
    if (!isAuthenticated || !userRole) {
      return "Authentication required...";
    }
    if (isChatDisabled) {
      if (sourceCount === 0) {
        return "Upload a policy document to get started...";
      } else {
        return "Please wait while your policy documents are being processed...";
      }
    }
    return "Ask about policies...";
  };

  const getRoleDisplayColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'administrator':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'executive':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Render custom markdown with policy citations
  const renderPolicyMarkdown = (content: string, isUser: boolean = false) => {
    return (
      <MarkdownRenderer
        content={content}
        className={isUser ? '' : ''}
        onCitationClick={handleCitationClick}
        isUserMessage={isUser}
        CitationComponent={({ citation, citationNumber, onClick }) => (
          <PolicyCitationComponent
            citation={citation}
            citationNumber={citationNumber}
            userRole={userRole || undefined}
            onClick={onClick}
          />
        )}
      />
    );
  };

  if (roleLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {hasSource ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header with Role Info */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-gray-900">Policy Chat</h2>
                {userRole && (
                  <Badge className={`text-xs ${getRoleDisplayColor(userRole)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                )}
              </div>
              {shouldShowRefreshButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshChat}
                  disabled={isDeletingChatHistory || isChatDisabled}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isDeletingChatHistory ? 'animate-spin' : ''}`} />
                  <span>{isDeletingChatHistory ? 'Clearing...' : 'Clear Chat'}</span>
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
            {/* Policy Document Summary */}
            <div className="p-8 border-b border-gray-200">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center bg-transparent">
                    {isGenerating ? (
                      <Loader2 className="text-black font-normal w-10 h-10 animate-spin" />
                    ) : (
                      <span className="text-[40px] leading-none">{policyDocument?.icon || '📄'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-medium text-gray-900">
                      {isGenerating ? 'Processing policy document...' : policyDocument?.title || 'Untitled Policy Document'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">{sourceCount} source{sourceCount !== 1 ? 's' : ''}</p>
                      {policyDocument?.role_assignment && (
                        <Badge className={`text-xs ${getRoleDisplayColor(policyDocument.role_assignment)}`}>
                          {policyDocument.role_assignment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Access Error Alert */}
                {accessError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{accessError}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  {isGenerating ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <p>AI is analyzing your policy document and generating a title and description...</p>
                    </div>
                  ) : (
                    <MarkdownRenderer
                      content={policyDocument?.description || 'No description available for this policy document.'}
                      className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                    />
                  )}
                </div>

                {/* Chat Messages */}
                {(messages.length > 0 || pendingUserMessage || showAiLoading) && (
                  <div className="mb-6 space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${isUserMessage(msg) ? 'max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg' : 'w-full'}`}>
                          <div className={isUserMessage(msg) ? '' : 'prose prose-gray max-w-none text-gray-800'}>
                            {renderPolicyMarkdown(msg.message.content as string, isUserMessage(msg))}
                          </div>
                          {isAiMessage(msg) && (
                            <div className="mt-2 flex justify-start">
                              <SaveToNoteButton content={msg.message.content as string} notebookId={policyDocumentId} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pending user message */}
                    {pendingUserMessage && (
                      <div className="flex justify-end">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg">
                          {renderPolicyMarkdown(pendingUserMessage, true)}
                        </div>
                      </div>
                    )}

                    {/* AI Loading Indicator */}
                    {showAiLoading && (
                      <div className="flex justify-start" ref={latestMessageRef}>
                        <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Scroll target for when no AI loading is shown */}
                    {!showAiLoading && shouldShowScrollTarget() && <div ref={latestMessageRef} />}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Chat Input - Fixed at bottom */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder={getPlaceholderText()}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !isChatDisabled && !isSending && !pendingUserMessage && handleSendMessage()}
                    className="pr-12"
                    disabled={isChatDisabled || isSending || !!pendingUserMessage}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {sourceCount} source{sourceCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || isChatDisabled || isSending || !!pendingUserMessage}
                >
                  {isSending || pendingUserMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Example Questions Carousel */}
              {!isChatDisabled && !pendingUserMessage && !showAiLoading && exampleQuestions.length > 0 && (
                <div className="mt-4">
                  <Carousel className="w-full max-w-4xl">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {exampleQuestions.map((question, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-left whitespace-nowrap h-auto py-2 px-3 text-sm"
                            onClick={() => handleExampleQuestionClick(question)}
                          >
                            {question}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {exampleQuestions.length > 2 && (
                      <>
                        <CarouselPrevious className="left-0" />
                        <CarouselNext className="right-0" />
                      </>
                    )}
                  </Carousel>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-100">
              <Upload className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Add a policy document to get started</h2>
            <Button onClick={() => setShowAddSourcesDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload a policy document
            </Button>
          </div>

          {/* Bottom Input */}
          <div className="w-full max-w-2xl">
            <div className="flex space-x-4">
              <Input placeholder="Upload a policy document to get started" disabled className="flex-1" />
              <div className="flex items-center text-sm text-gray-500">
                0 sources
              </div>
              <Button disabled>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <p className="text-center text-sm text-gray-500">PolicyAi can be inaccurate; please verify policy information from official sources.</p>
      </div>

      {/* Add Sources Dialog */}
      <AddSourcesDialog
        open={showAddSourcesDialog}
        onOpenChange={setShowAddSourcesDialog}
        notebookId={policyDocumentId}
      />
    </div>
  );
};

export default PolicyChatInterface;