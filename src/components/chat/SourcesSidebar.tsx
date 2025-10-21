import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, FileText, CheckCircle, Loader2, File, Globe, Youtube, ChevronDown, ChevronUp, AlertTriangle, Calendar } from 'lucide-react';
import { useChatSessionSources } from '@/hooks/useChatSessionSources';
import { DocumentViewer } from './DocumentViewer';
import { isPolicyOutdated, formatPolicyDate, getPolicyAgeDescription } from '@/lib/policyDateUtils';

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
  // Fetch documents linked to this chat session
  const { sources: documents, isLoading } = useChatSessionSources(chatSessionId);
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);

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
      {/* Sources List Section */}
      {(!selectedCitation || !isSourcesCollapsed) && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Sources ({documents?.length || 0})
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" title="Add source">
                  <Plus className="h-4 w-4" />
                </Button>
                {selectedCitation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
                    title={isSourcesCollapsed ? 'Expand sources' : 'Collapse sources'}
                  >
                    {isSourcesCollapsed ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Documents available for chat
            </p>
          </div>

          {/* Sources List */}
          <ScrollArea className={selectedCitation ? 'h-[250px] p-4' : 'flex-1 p-4'}>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading sources...</p>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const isOutdated = isPolicyOutdated(doc.policyDate);
                  const ageDescription = getPolicyAgeDescription(doc.policyDate);

                  return (
                    <Card
                      key={doc.id}
                      className="p-3 cursor-pointer hover:bg-gray-100 transition-all hover:shadow-sm border border-gray-200"
                      onClick={() => onDocumentSelect?.(doc.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getSourceIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {doc.title}
                          </p>

                          {/* Status and Badges */}
                          <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            {/* Processing Status */}
                            {doc.processing_status === 'completed' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs h-5">
                                <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                Ready
                              </Badge>
                            ) : doc.processing_status === 'failed' ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs h-5">
                                Failed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs h-5">
                                <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                                Processing
                              </Badge>
                            )}

                            {/* Outdated Badge */}
                            {isOutdated && (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-300 text-xs h-5"
                                title={ageDescription || 'Policy older than 18 months'}
                              >
                                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                Outdated
                              </Badge>
                            )}
                          </div>

                          {/* Policy Date */}
                          {doc.policyDate && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600 font-medium">
                                {formatPolicyDate(doc.policyDate)}
                              </span>
                              {ageDescription && !isOutdated && (
                                <span className="text-xs text-gray-400">
                                  ({ageDescription})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
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

          {!selectedCitation && (
            <div className="p-3 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 text-center">
                All accessible documents shown
              </p>
            </div>
          )}
        </>
      )}

      {/* Separator */}
      {selectedCitation && !isSourcesCollapsed && (
        <Separator />
      )}

      {/* Document Viewer Section */}
      {selectedCitation && (
        <div className={isSourcesCollapsed ? 'flex-1 overflow-hidden' : 'flex-1 min-h-0 overflow-hidden'}>
          <DocumentViewer
            sourceId={selectedCitation.sourceId}
            linesFrom={selectedCitation.linesFrom}
            linesTo={selectedCitation.linesTo}
            onClose={onCitationClose}
          />
        </div>
      )}
    </div>
  );
};
