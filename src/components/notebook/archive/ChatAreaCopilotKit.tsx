import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCopilotChat, useCopilotReadable } from '@copilotkit/react-core';
import { useSources } from '@/hooks/useSources';
import { useCopilotKitActions } from '@/hooks/useCopilotKitActions';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import SaveToNoteButton from './SaveToNoteButton';
import AddSourcesDialog from './AddSourcesDialog';
import { Citation } from '@/types/message';
import { useAuth } from '@/contexts/AuthContext';

interface ChatAreaCopilotKitProps {
  hasSource: boolean;
  notebookId?: string;
  notebook?: {
    id: string;
    title: string;
    description?: string;
    generation_status?: string;
    icon?: string;
    example_questions?: string[];
  } | null;
  onCitationClick?: (citation: Citation) => void;
}

const ChatAreaCopilotKit = ({
  hasSource,
  notebookId,
  notebook,
  onCitationClick
}: ChatAreaCopilotKitProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);

  const isGenerating = notebook?.generation_status === 'generating';

  const { sources } = useSources(notebookId);
  const sourceCount = sources?.length || 0;
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;
  const isChatDisabled = !hasProcessedSource;

  // Ref for auto-scrolling
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get role-based instructions from user metadata
  const getUserRole = () => {
    // This would typically come from user_roles table via Supabase
    // For now, use a placeholder - in production, fetch from backend
    return user?.user_metadata?.role || 'administrator';
  };

  const userRole = getUserRole();

  // Use CopilotKit's built-in chat hook (handles SSE automatically)
  const {
    messages,
    appendMessage,
    isLoading,
    deleteMessages,
  } = useCopilotChat({
    id: `chat-${notebookId || 'default'}`,
    makeSystemMessage: () => `You are PolicyAi, an AI assistant for ${userRole} role.
You have access to policy documents appropriate for this role.
Always cite sources with document names and page numbers when providing information.
If a policy is older than 18 months, flag it for review.`,
  });

  // Inject context as readable state for the AI
  useCopilotReadable({
    description: "Current session and user context",
    value: {
      session_id: notebookId,
      user_id: user?.id,
      user_role: userRole,
      notebook_id: notebookId,
      source_count: sourceCount,
    }
  });

  // Setup CopilotKit actions
  useCopilotKitActions({
    notebookId,
    onCitationClick,
    onSaveToNote: (content) => {
      console.log('Saving to note:', content);
      // Implement save to note functionality
    },
    onClearChat: () => {
      handleClearChat();
    },
  });

  // Auto-scroll when messages update
  useEffect(() => {
    if (latestMessageRef.current && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 50);
      }
    }
  }, [messages?.length, isLoading]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && notebookId && !isChatDisabled) {
      try {
        await appendMessage({
          role: 'user',
          content: textToSend,
        });
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        // Show error to user
        console.error('Error details:', error);
      }
    }
  };

  const handleClearChat = async () => {
    if (notebookId) {
      setIsClearingChat(true);
      try {
        await deleteMessages();
        setClickedQuestions(new Set());
      } catch (error) {
        console.error('Failed to clear chat:', error);
      } finally {
        setIsClearingChat(false);
      }
    }
  };

  const handleCitationClick = (citation: Citation) => {
    onCitationClick?.(citation);
  };

  const handleExampleQuestionClick = (question: string) => {
    setClickedQuestions(prev => new Set(prev).add(question));
    setMessage(question);
    handleSendMessage(question);
  };

  const shouldShowRefreshButton = messages && messages.length > 0;
  const exampleQuestions = notebook?.example_questions?.filter(q => !clickedQuestions.has(q)) || [];

  const getPlaceholderText = () => {
    if (isChatDisabled) {
      if (sourceCount === 0) {
        return "Upload a source to get started...";
      } else {
        return "Please wait while your sources are being processed...";
      }
    }
    return "Start typing...";
  };

  const isUserMessage = (msg: any) => msg.role === 'user';
  const isAssistantMessage = (msg: any) => msg.role === 'assistant';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {hasSource ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium text-gray-900">Chat</h2>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md">
                  CopilotKit AG-UI
                </span>
              </div>
              {shouldShowRefreshButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  disabled={isClearingChat || isChatDisabled}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isClearingChat ? 'animate-spin' : ''}`} />
                  <span>{isClearingChat ? 'Clearing...' : 'Clear Chat'}</span>
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
            {/* Document Summary */}
            <div className="p-8 border-b border-gray-200">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center bg-transparent">
                    {isGenerating ? (
                      <Loader2 className="text-black font-normal w-10 h-10 animate-spin" />
                    ) : (
                      <span className="text-[40px] leading-none">{notebook?.icon || '☕'}</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-medium text-gray-900">
                      {isGenerating ? 'Generating content...' : notebook?.title || 'New Chat'}
                    </h1>
                    <p className="text-sm text-gray-600">{sourceCount} source{sourceCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  {isGenerating ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <p>AI is analyzing your source and generating a title and description...</p>
                    </div>
                  ) : (
                    <MarkdownRenderer
                      content={notebook?.description || 'Start a conversation by asking a question about your uploaded sources.'}
                      className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                    />
                  )}
                </div>

                {/* CopilotKit Messages */}
                {messages && messages.length > 0 && (
                  <div className="mb-6 space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id || index}
                        className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`${
                          isUserMessage(msg)
                            ? 'max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg'
                            : 'w-full'
                        }`}>
                          <div className={isUserMessage(msg) ? '' : 'prose prose-gray max-w-none text-gray-800'}>
                            <MarkdownRenderer
                              content={msg.content}
                              onCitationClick={handleCitationClick}
                              isUserMessage={isUserMessage(msg)}
                            />
                          </div>
                          {isAssistantMessage(msg) && (
                            <div className="mt-2 flex justify-start">
                              <SaveToNoteButton content={msg.content} notebookId={notebookId} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="flex justify-start" ref={latestMessageRef}>
                        <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}

                    <div ref={latestMessageRef} />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder={getPlaceholderText()}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !isChatDisabled && !isLoading && handleSendMessage()}
                    className="pr-12"
                    disabled={isChatDisabled || isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {sourceCount} source{sourceCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || isChatDisabled || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Example Questions Carousel */}
              {!isChatDisabled && !isLoading && exampleQuestions.length > 0 && (
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
            <h2 className="text-xl font-medium text-gray-900 mb-4">Add a source to get started</h2>
            <Button onClick={() => setShowAddSourcesDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload a source
            </Button>
          </div>

          <div className="w-full max-w-2xl">
            <div className="flex space-x-4">
              <Input placeholder="Upload a source to get started" disabled className="flex-1" />
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
        <p className="text-center text-sm text-gray-500">PolicyAi can be inaccurate; please double-check its responses.</p>
      </div>

      {/* Add Sources Dialog */}
      <AddSourcesDialog
        open={showAddSourcesDialog}
        onOpenChange={setShowAddSourcesDialog}
        notebookId={notebookId}
      />
    </div>
  );
};

export default ChatAreaCopilotKit;
