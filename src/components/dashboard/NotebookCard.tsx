import React, { useState } from 'react';
import { Trash2, Edit, CheckSquare, Square } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNotebookDelete } from '@/hooks/useNotebookDelete';
import { useGlobalSourcesCount } from '@/hooks/useGlobalSourcesCount';
import NotebookTitleEditor from '@/components/notebook/NotebookTitleEditor';

interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    date: string;
    sources: number;
    icon: string;
    color: string;
    hasCollaborators?: boolean;
    description?: string;
  };
  onTitleChanged?: () => void;
  bulkSelectMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (documentId: string, isSelected: boolean) => void;
}

const NotebookCard = ({
  notebook,
  onTitleChanged,
  bulkSelectMode = false,
  isSelected = false,
  onSelectionChange
}: NotebookCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const {
    deleteNotebook,
    isDeleting
  } = useNotebookDelete();
  const { globalSourcesCount } = useGlobalSourcesCount();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for notebook:', notebook.id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Confirming delete for notebook:', notebook.id);
    deleteNotebook(notebook.id);
    setShowDeleteDialog(false);
  };



  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectionChange?.(notebook.id, !isSelected);
  };

  const handleEditTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTitleEditor(true);
  };

  // Generate CSS classes from color name
  const colorName = notebook.color || 'gray';
  const backgroundClass = `bg-${colorName}-100`;
  const borderClass = `border-${colorName}-200`;

  return <div 
      className={`rounded-lg border ${borderClass} ${backgroundClass} p-4 hover:shadow-md transition-shadow cursor-pointer relative h-48 flex flex-col ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {bulkSelectMode && (
        <div className="absolute top-3 left-3 z-10" data-delete-action="true">
          <button
            onClick={handleSelectionToggle}
            className="p-1 bg-white border rounded hover:bg-gray-50 transition-colors"
            data-delete-action="true"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <Square className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      )}
      
      <div className="absolute top-3 right-3 flex space-x-1" data-delete-action="true">
        <button
          onClick={handleEditTitleClick}
          className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-500 transition-colors"
          title="Edit title and summary"
        >
          <Edit className="h-4 w-4" />
        </button>
        
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <button onClick={handleDeleteClick} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors delete-button" disabled={isDeleting} data-delete-action="true">
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                You're about to delete this chat and all of its content. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-blue-600 hover:bg-blue-700" disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <span className="text-3xl">{notebook.icon}</span>
      </div>
      
      <h3 className="text-gray-900 mb-2 pr-6 text-sm font-medium flex-grow overflow-hidden">
        <div 
          className="text-ellipsis overflow-hidden"
          style={{ 
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            lineHeight: '1.2em',
            maxHeight: '3.6em'
          }}
        >
          {notebook.title}
        </div>
      </h3>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
        <span>{notebook.date} • {globalSourcesCount} available source{globalSourcesCount !== 1 ? 's' : ''}</span>
      </div>

      <NotebookTitleEditor
        open={showTitleEditor}
        onOpenChange={setShowTitleEditor}
        notebookId={notebook.id}
        currentTitle={notebook.title}
        currentDescription={notebook.description}
        onTitleChanged={onTitleChanged}
      />
    </div>;
};

export default NotebookCard;
