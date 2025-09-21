import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, Loader, Users, HelpCircle } from 'lucide-react';
import { usePolicyDocumentRoleAssignment } from '@/hooks/usePolicyDocumentRoleAssignment';

interface BulkRoleAssignmentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentIds: string[];
  onRoleChanged?: () => void;
}

const BulkRoleAssignmentEditor = ({
  open,
  onOpenChange,
  documentIds,
  onRoleChanged
}: BulkRoleAssignmentEditorProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { bulkUpdateRoleAssignment, isBulkUpdating } = usePolicyDocumentRoleAssignment();

  const handleBulkRoleChange = async () => {
    if (!selectedRole || documentIds.length === 0) {
      onOpenChange(false);
      return;
    }

    const result = await bulkUpdateRoleAssignment({
      documentIds,
      newRole: selectedRole as 'administrator' | 'executive'
    });

    if (result.success) {
      onRoleChanged?.();
      onOpenChange(false);
      setSelectedRole('');
    }
    // Error handling is now done in the hook with toast notifications
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'Only administrators will be able to view and interact with these documents';
      case 'executive':
        return 'Only executives will be able to view and interact with these documents';
      default:
        return 'Please select a role for these documents';
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Bulk Assign Role</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Bulk role assignment allows you to change access permissions for multiple documents at once. Use caution as this affects document visibility immediately.</p>
                </TooltipContent>
              </Tooltip>
            </DialogTitle>
          </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Selected Documents</h4>
            <p className="text-sm text-blue-700">
              {documentIds.length} policy document{documentIds.length !== 1 ? 's' : ''} selected for role assignment
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="bulk-role-select">Target Role</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p><strong>Administrator:</strong> Documents for system management and configuration</p>
                    <p><strong>Executive:</strong> Documents for executive leadership and decision-making</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select 
              value={selectedRole} 
              onValueChange={setSelectedRole}
              disabled={isBulkUpdating}
            >
              <SelectTrigger id="bulk-role-select">
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-yellow-800 mb-1">
                    Bulk Access Control Impact
                  </h5>
                  <p className="text-sm text-yellow-700">
                    {getRoleDescription(selectedRole)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-orange-800 mb-1">
                  Bulk Operation Warning
                </h5>
                <p className="text-sm text-orange-700">
                  This operation will immediately change access permissions for all selected documents. 
                  Make sure you understand the impact before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedRole('');
            }}
            disabled={isBulkUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkRoleChange}
            disabled={!selectedRole || documentIds.length === 0 || isBulkUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isBulkUpdating ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              `Update ${documentIds.length} Document${documentIds.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
};

export default BulkRoleAssignmentEditor;