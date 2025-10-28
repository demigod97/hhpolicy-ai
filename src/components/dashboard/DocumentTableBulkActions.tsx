import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, UserCog, Download, X } from 'lucide-react';
import { useBulkActions } from '@/hooks/useBulkActions';

interface DocumentTableBulkActionsProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  canManage: boolean;
}

export const DocumentTableBulkActions: React.FC<DocumentTableBulkActionsProps> = ({
  selectedCount,
  selectedIds,
  onClearSelection,
  canManage,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { isLoading, bulkDelete, bulkChangeRole, bulkExport } = useBulkActions();

  const handleDelete = async () => {
    const success = await bulkDelete(selectedIds);
    if (success) {
      onClearSelection();
      setShowDeleteDialog(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedRole) return;

    const success = await bulkChangeRole(
      selectedIds,
      selectedRole as 'administrator' | 'executive' | 'board' | 'company_operator' | 'system_owner'
    );

    if (success) {
      onClearSelection();
      setShowRoleDialog(false);
      setSelectedRole('');
    }
  };

  const handleExport = async () => {
    await bulkExport(selectedIds);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          {/* Change Role Button */}
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleDialog(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <UserCog className="h-4 w-4" />
              Change Role
            </Button>
          )}

          {/* Delete Button */}
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}

          {/* Cancel Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} document{selectedCount !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new role for {selectedCount} document{selectedCount !== 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="board">Board</SelectItem>
                <SelectItem value="company_operator">Company Operator</SelectItem>
                <SelectItem value="system_owner">System Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeRole}
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? 'Updating...' : 'Update Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
