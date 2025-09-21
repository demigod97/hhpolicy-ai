
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNotebookDelete } from '@/hooks/useNotebookDelete';

const NotebookGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating,
    refetch
  } = useNotebooks();
  const { deleteNotebook, isDeleting } = useNotebookDelete();
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
      title: 'New Chat',
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

  const handleBulkDelete = async () => {
    try {
      // Delete all selected notebooks
      await Promise.all(selectedDocuments.map(id => deleteNotebook(id)));
      
      // Reset state after successful deletion
      setSelectedDocuments([]);
      setBulkSelectMode(false);
      setShowBulkDeleteDialog(false);
      refetch();
    } catch (error) {
      console.error('Failed to delete notebooks:', error);
    }
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
            variant={bulkSelectMode ? "default" : "outline"}
            onClick={handleBulkSelectToggle}
            className={bulkSelectMode ? "bg-blue-600 hover:bg-blue-700 rounded-full px-6" : "border-red-200 text-red-600 hover:bg-red-50 rounded-full px-6"}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {bulkSelectMode ? 'Exit Selection' : 'Bulk Delete'}
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
                onClick={() => setShowBulkDeleteDialog(true)}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : `Delete ${selectedDocuments.length} chat${selectedDocuments.length !== 1 ? 's' : ''}`}
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
                description: notebook.description
              }}
              onTitleChanged={refetch}
              bulkSelectMode={bulkSelectMode}
              isSelected={selectedDocuments.includes(notebook.id)}
              onSelectionChange={handleDocumentSelect}
            />
          </div>)}
      </div>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDocuments.length} chat{selectedDocuments.length !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to delete {selectedDocuments.length} chat{selectedDocuments.length !== 1 ? 's' : ''} and all of their content. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-red-600 hover:bg-red-700" 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default NotebookGrid;
