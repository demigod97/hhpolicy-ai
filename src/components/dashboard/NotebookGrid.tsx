
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown, Upload, CheckSquare, Square, Users } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddSourcesDialog from '@/components/notebook/AddSourcesDialog';
import BulkRoleAssignmentEditor from '@/components/policy-document/BulkRoleAssignmentEditor';

const NotebookGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showBulkRoleEditor, setShowBulkRoleEditor] = useState(false);
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating,
    refetch
  } = useNotebooks();
  const navigate = useNavigate();

  const sortedNotebooks = useMemo(() => {
    if (!notebooks) return [];
    
    const sorted = [...notebooks];
    
    if (sortBy === 'Most recent') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'Title') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [notebooks, sortBy]);

  const handleCreateNotebook = () => {
    createNotebook({
      title: 'Untitled Policy Document',
      description: '',
      assigned_role: 'executive' // Auto-assign to executive role
    }, {
      onSuccess: data => {
        console.log('Navigating to notebook:', data.id);
        navigate(`/notebook/${data.id}`);
      },
      onError: error => {
        console.error('Failed to create notebook:', error);
      }
    });
  };

  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    // Check if the click is coming from interactive elements that should prevent navigation
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('.delete-button') ||
                                target.closest('[role="dialog"]') ||
                                target.closest('button[title="Edit role assignment"]');
    if (isInteractiveElement) {
      console.log('Click prevented due to interactive element');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  const handleDocumentCreated = (notebookId: string) => {
    navigate(`/notebook/${notebookId}`);
    refetch();
    setShowUploadModal(false);
  };

  const handleBulkSelectToggle = () => {
    setBulkSelectMode(!bulkSelectMode);
    setSelectedDocuments([]);
  };

  const handleDocumentSelect = (documentId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === sortedNotebooks.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(sortedNotebooks.map(nb => nb.id));
    }
  };

  const handleBulkRoleAssignmentComplete = () => {
    refetch();
    setSelectedDocuments([]);
    setBulkSelectMode(false);
    setShowBulkRoleEditor(false);
  };

  if (isLoading) {
    return <div className="text-center py-16">
        <p className="text-gray-600">Loading notebooks...</p>
      </div>;
  }

  return <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6" onClick={handleCreateNotebook} disabled={isCreating}>
            {isCreating ? 'Creating...' : '+ Create new'}
          </Button>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-6"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Policy
          </Button>
          <Button 
            variant={bulkSelectMode ? "default" : "outline"}
            onClick={handleBulkSelectToggle}
            className={bulkSelectMode ? "bg-blue-600 hover:bg-blue-700 rounded-full px-6" : "border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6"}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {bulkSelectMode ? 'Exit Selection' : 'Bulk Select'}
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-600">{sortBy}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy('Most recent')} className="flex items-center justify-between">
                Most recent
                {sortBy === 'Most recent' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('Title')} className="flex items-center justify-between">
                Title
                {sortBy === 'Title' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {bulkSelectMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                {selectedDocuments.length === sortedNotebooks.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <span className="text-sm text-blue-700">
                {selectedDocuments.length} of {sortedNotebooks.length} documents selected
              </span>
            </div>
            
            {selectedDocuments.length > 0 && (
              <Button 
                onClick={() => setShowBulkRoleEditor(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedNotebooks.map(notebook => <div key={notebook.id} onClick={e => !bulkSelectMode && handleNotebookClick(notebook.id, e)}>
            <NotebookCard 
              notebook={{
                id: notebook.id,
                title: notebook.title,
                date: new Date(notebook.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }),
                sources: notebook.sources?.[0]?.count || 0,
                icon: notebook.icon || '📝',
                color: notebook.color || 'bg-gray-100',
                role_assignment: notebook.role_assignment as 'administrator' | 'executive' | null
              }}
              onRoleChanged={refetch}
              bulkSelectMode={bulkSelectMode}
              isSelected={selectedDocuments.includes(notebook.id)}
              onSelectionChange={handleDocumentSelect}
            />
          </div>)}
      </div>

      <AddSourcesDialog
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        mode="create-document"
        onDocumentCreated={handleDocumentCreated}
      />

      <BulkRoleAssignmentEditor
        open={showBulkRoleEditor}
        onOpenChange={setShowBulkRoleEditor}
        documentIds={selectedDocuments}
        onRoleChanged={handleBulkRoleAssignmentComplete}
      />
    </div>;
};

export default NotebookGrid;
