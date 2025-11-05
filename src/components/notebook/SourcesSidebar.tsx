
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash2, Edit, Loader2, CheckCircle, XCircle, Upload, Users, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddSourcesDialog from './AddSourcesDialog';
import RenameSourceDialog from './RenameSourceDialog';
import SourceContentViewer from '@/components/chat/SourceContentViewer';
import { useSources } from '@/hooks/useSources';
import { useSourceDelete } from '@/hooks/useSourceDelete';
import { Citation } from '@/types/message';
import { useAuth } from '@/contexts/AuthContext';
import RoleAssignmentBadge from '@/components/policy-document/RoleAssignmentBadge';

interface SourcesSidebarProps {
  hasSource: boolean;
  notebookId?: string;
  selectedCitation?: Citation | null;
  onCitationClose?: () => void;
  setSelectedCitation?: (citation: Citation | null) => void;
}

const SourcesSidebar = ({
  hasSource,
  notebookId,
  selectedCitation,
  onCitationClose,
  setSelectedCitation
}: SourcesSidebarProps) => {
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [selectedSourceForViewing, setSelectedSourceForViewing] = useState<any>(null);

  const {
    sources,
    isLoading
  } = useSources(notebookId);
  const { user } = useAuth();

  // Group sources by ownership - all sources are now global but we show them grouped by who uploaded
  const groupedSources = useMemo(() => {
    if (!sources) return { myUploads: [], sharedSources: [] };

    // Separate sources by who uploaded them
    const myUploads = sources.filter(source => (source as any).uploaded_by_user_id === user?.id);
    const sharedSources = sources.filter(source => (source as any).uploaded_by_user_id !== user?.id);

    return { myUploads, sharedSources };
  }, [sources, user]);

  const {
    deleteSource,
    isDeleting
  } = useSourceDelete();

  // Get the source content for the selected citation
  const getSourceContent = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    if (!source) {
      // Fallback content for stale/missing source references
      return `Content not available for source reference ${citation.source_id.substring(0, 8)}...\n\nThis citation references lines ${citation.chunk_lines_from}-${citation.chunk_lines_to} from a source that may have been updated or removed.\n\nCitation details:\n- Source ID: ${citation.source_id}\n- Line range: ${citation.chunk_lines_from}-${citation.chunk_lines_to}\n- Source title: ${citation.source_title}`;
    }
    return source.content || '';
  };

  // Get the source summary for the selected citation
  const getSourceSummary = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    if (!source) {
      // Fallback summary for stale/missing source references
      return `This citation references content from a source that is not currently available. The citation was created for "${citation.source_title}" but the source may have been updated or removed since this conversation was created.`;
    }
    return source.summary || '';
  };

  // Get the source URL for the selected citation
  const getSourceUrl = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.url || '';
  };

  // Format policy date for display
  const formatPolicyDate = (policyDate?: string) => {
    if (!policyDate || policyDate.trim() === '' || policyDate.trim().toLowerCase() === 'not provided') return null;
    
    // Handle formats like "August-2024", "May-2025"
    const parts = policyDate.split('-');
    if (parts.length === 2) {
      const [month, year] = parts;
      return `${month} ${year}`;
    }
    
    return policyDate;
  };

  // Check if policy is outdated (older than 18 months)
  const isPolicyOutdated = (policyDate?: string): boolean => {
    if (!policyDate || policyDate.trim() === '' || policyDate.trim().toLowerCase() === 'not provided') return false;
    
    try {
      const parts = policyDate.split('-');
      if (parts.length !== 2) return false;
      
      const [monthName, yearStr] = parts;
      const year = parseInt(yearStr);
      
      // Convert month name to month number (0-indexed)
      const monthMap: { [key: string]: number } = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      
      const month = monthMap[monthName];
      if (month === undefined) return false;
      
      const policyDateObj = new Date(year, month);
      const currentDate = new Date();
      const eighteenMonthsAgo = new Date();
      eighteenMonthsAgo.setMonth(currentDate.getMonth() - 18);
      
      return policyDateObj < eighteenMonthsAgo;
    } catch (error) {
      return false;
    }
  };

  // Get policy date badge styling based on age
  const getPolicyDateBadgeStyle = (policyDate?: string) => {
    if (!policyDate || policyDate.trim() === '' || policyDate.trim().toLowerCase() === 'not provided') {
      // No policy date provided - pastel yellow
      return "text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded";
    }
    
    if (isPolicyOutdated(policyDate)) {
      // Outdated (older than 18 months) - pastel red
      return "text-xs text-red-700 bg-red-100 px-1.5 py-0.5 rounded";
    } else {
      // Current (not older than 18 months) - pastel green
      return "text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded";
    }
  };

  // Get policy date display text
  const getPolicyDateText = (policyDate?: string) => {
    if (!policyDate || policyDate.trim() === '' || policyDate.trim().toLowerCase() === 'not provided') return "Not Provided";
    return formatPolicyDate(policyDate);
  };

  // Get the source summary for a selected source
  const getSelectedSourceSummary = () => {
    return selectedSourceForViewing?.summary || '';
  };

  // Get the source content for a selected source  
  const getSelectedSourceContent = () => {
    return selectedSourceForViewing?.content || '';
  };

  // Get the source URL for a selected source
  const getSelectedSourceUrl = () => {
    return selectedSourceForViewing?.url || '';
  };

  
  const renderSourceIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'pdf': '/file-types/PDF.svg',
      'text': '/file-types/TXT.png',
      'website': '/file-types/WEB.svg',
      'youtube': '/file-types/MP3.png',
      'audio': '/file-types/MP3.png',
      'doc': '/file-types/DOC.png',
      'multiple-websites': '/file-types/WEB.svg',
      'copied-text': '/file-types/TXT.png'
    };

    const iconUrl = iconMap[type] || iconMap['text']; // fallback to TXT icon

    return (
      <img 
        src={iconUrl} 
        alt={`${type} icon`} 
        className="w-full h-full object-contain" 
        onError={(e) => {
          // Fallback to a simple text indicator if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = '📄';
        }} 
      />
    );
  };

  const renderProcessingStatus = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-pulse text-gray-500" />;
      default:
        return null;
    }
  };

  const handleRemoveSource = (source: { id: string; title: string; type: string; processing_status: string }) => {
    setSelectedSource(source);
    setShowDeleteDialog(true);
  };

  const handleRenameSource = (source: { id: string; title: string; type: string; processing_status: string }) => {
    setSelectedSource(source);
    setShowRenameDialog(true);
  };

  const handleSourceClick = (source: { id: string; title: string; type: string; processing_status: string; content?: string; summary?: string; url?: string }) => {
    console.log('SourcesSidebar: Source clicked from list', {
      sourceId: source.id,
      sourceTitle: source.title
    });

    // Clear any existing citation state first
    if (setSelectedCitation) {
      setSelectedCitation(null);
    }

    // Set the selected source for viewing
    setSelectedSourceForViewing(source);

    // Create a mock citation for the selected source without line data (this prevents auto-scroll)
    const mockCitation: Citation = {
      citation_id: -1, // Use negative ID to indicate this is a mock citation
      source_id: source.id,
      source_title: source.title,
      source_type: source.type,
      chunk_index: 0,
      excerpt: 'Full document view'
      // Deliberately omitting chunk_lines_from and chunk_lines_to to prevent auto-scroll
    };

    console.log('SourcesSidebar: Created mock citation', mockCitation);

    // Set the mock citation after a small delay to ensure state is clean
    setTimeout(() => {
      if (setSelectedCitation) {
        setSelectedCitation(mockCitation);
      }
    }, 50);
  };

  const handleBackToSources = () => {
    console.log('SourcesSidebar: Back to sources clicked');
    setSelectedSourceForViewing(null);
    onCitationClose?.();
  };

  const confirmDelete = () => {
    if (selectedSource) {
      deleteSource(selectedSource.id);
      setShowDeleteDialog(false);
      setSelectedSource(null);
    }
  };

  // If we have a selected citation, show the content viewer
  if (selectedCitation) {
    console.log('SourcesSidebar: Rendering content viewer for citation', {
      citationId: selectedCitation.citation_id,
      sourceId: selectedCitation.source_id,
      hasLineData: !!(selectedCitation.chunk_lines_from && selectedCitation.chunk_lines_to),
      isFromSourceList: selectedCitation.citation_id === -1
    });

    // Determine which citation to display and get appropriate content/summary/url
    const displayCitation = selectedCitation;
    const sourceContent = selectedSourceForViewing ? getSelectedSourceContent() : getSourceContent(selectedCitation);
    const sourceSummary = selectedSourceForViewing ? getSelectedSourceSummary() : getSourceSummary(selectedCitation);
    const sourceUrl = selectedSourceForViewing ? getSelectedSourceUrl() : getSourceUrl(selectedCitation);

    return (
      <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-gray-700" onClick={handleBackToSources}>
              Sources
            </h2>
            <Button variant="ghost" onClick={handleBackToSources} className="p-2 [&_svg]:!w-6 [&_svg]:!h-6">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
              </svg>
            </Button>
          </div>
        </div>
        
        <SourceContentViewer 
          citation={displayCitation} 
          sourceContent={sourceContent} 
          sourceSummary={sourceSummary}
          sourceUrl={sourceUrl}
          className="flex-1 overflow-hidden" 
          isOpenedFromSourceList={selectedCitation.citation_id === -1}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Sources</h2>
        </div>
        
        {/* Add Source button hidden for demo - development feature only */}
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">Loading sources...</p>
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-6">
              {/* My Uploaded Sources Section */}
              {groupedSources.myUploads.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">My Uploads</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {groupedSources.myUploads.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedSources.myUploads.map((source) => (
                      <ContextMenu key={source.id}>
                        <ContextMenuTrigger>
                          <Card className="p-3 border border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => handleSourceClick(source)}>
                            <div className="flex items-start justify-between space-x-3">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {renderSourceIcon(source.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm text-gray-900 truncate block">{source.title}</span>
                                  <div className="flex items-center space-x-2 mt-1.5">
                                    <RoleAssignmentBadge 
                                      role={(source as any).target_role as 'administrator' | 'executive' | 'board' | null} 
                                      className="text-xs px-1.5 py-0.5"
                                      showTooltip={false}
                                    />
                                    <span className={getPolicyDateBadgeStyle((source as any).policyDate)}>
                                      {getPolicyDateText((source as any).policyDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 py-[4px]">
                                {renderProcessingStatus(source.processing_status)}
                              </div>
                            </div>
                          </Card>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleRenameSource(source)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename source
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleRemoveSource(source)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove source
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Sources Section */}
              {groupedSources.sharedSources.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-700">Shared Sources</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {groupedSources.sharedSources.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedSources.sharedSources.map((source) => (
                      <ContextMenu key={source.id}>
                        <ContextMenuTrigger>
                          <Card className="p-3 border border-blue-100 bg-blue-50/30 cursor-pointer hover:bg-blue-50" onClick={() => handleSourceClick(source)}>
                            <div className="flex items-start justify-between space-x-3">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className="w-6 h-6 bg-white rounded border border-blue-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {renderSourceIcon(source.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm text-gray-900 truncate block">{source.title}</span>
                                  <div className="flex items-center space-x-2 mt-1.5">
                                    <Users className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-blue-600 capitalize">
                                      Global access
                                    </span>
                                    <RoleAssignmentBadge 
                                      role={(source as any).target_role as 'administrator' | 'executive' | 'board' | null} 
                                      className="text-xs px-1.5 py-0.5"
                                      showTooltip={false}
                                    />
                                    <span className={getPolicyDateBadgeStyle((source as any).policyDate)}>
                                      {getPolicyDateText((source as any).policyDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 py-[4px]">
                                {renderProcessingStatus(source.processing_status)}
                              </div>
                            </div>
                          </Card>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          {/* Only allow deletion if user uploaded the source */}
                          {(source as any).uploaded_by_user_id === user?.id && (
                            <ContextMenuItem onClick={() => handleRemoveSource(source)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove source
                            </ContextMenuItem>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sources available</h3>
              <p className="text-sm text-gray-600 mb-4">Add policy documents, PDFs, or text files to get started. Sources are shared globally based on your role permissions.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AddSourcesDialog 
        open={showAddSourcesDialog} 
        onOpenChange={setShowAddSourcesDialog} 
        notebookId={notebookId} 
      />

      <RenameSourceDialog 
        open={showRenameDialog} 
        onOpenChange={setShowRenameDialog} 
        source={selectedSource} 
        notebookId={notebookId} 
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSource?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to delete this source. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700" 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SourcesSidebar;
