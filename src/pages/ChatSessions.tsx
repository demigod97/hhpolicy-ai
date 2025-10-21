import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatSessions, useCreateChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquarePlus,
  MessageSquare,
  Loader2,
  Clock,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const ChatSessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { sessions, isLoading } = useChatSessions();
  const createSession = useCreateChatSession();

  const handleNewChat = async () => {
    try {
      const session = await createSession.mutateAsync('New Chat');
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with navigation */}
      <DashboardHeader userEmail={user?.email} />
      <PrimaryNavigationBar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat Sessions</h1>
              <p className="text-gray-600 mt-1">
                View your chat history and start new conversations
              </p>
            </div>
            <Button onClick={handleNewChat} size="lg" className="gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              New Chat
            </Button>
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : sessions.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {session.title || 'Untitled Chat'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatDistanceToNow(new Date(session.updated_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No chat sessions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start a new conversation to get started
              </p>
              <Button onClick={handleNewChat} className="gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatSessions;
