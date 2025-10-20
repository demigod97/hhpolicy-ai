import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckCircle, Loader2, File, Globe, Youtube } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Source {
  id: string;
  title: string;
  type: string;
  processing_status: string;
  created_at: string;
  url?: string;
}

interface SourcesSidebarProps {
  chatSessionId?: string;
  onDocumentSelect?: (documentId: string) => void;
}

export const SourcesSidebar: React.FC<SourcesSidebarProps> = ({
  chatSessionId,
  onDocumentSelect,
}) => {
  // Fetch all documents accessible to the user (RLS will filter)
  const { data: documents, isLoading } = useQuery<Source[]>({
    queryKey: ['sources', 'accessible'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('id, title, type, processing_status, created_at, url')
        .eq('type', 'pdf')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Source[];
    },
  });

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-gray-400" />;
      case 'url':
        return <Globe className="h-5 w-5 text-gray-400" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-gray-400" />;
      case 'text':
        return <File className="h-5 w-5 text-gray-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Sources ({documents?.length || 0})
          </h3>
          <Button variant="ghost" size="sm" title="Add source">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Documents available for chat
        </p>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading sources...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                onClick={() => onDocumentSelect?.(doc.id)}
              >
                <div className="flex items-start gap-3">
                  {getSourceIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.processing_status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-500">Ready</span>
                        </>
                      ) : doc.processing_status === 'failed' ? (
                        <>
                          <span className="text-xs text-red-500">Failed</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                          <span className="text-xs text-gray-500">Processing...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No documents available</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload documents from the dashboard
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          All accessible documents shown
        </p>
      </div>
    </div>
  );
};
