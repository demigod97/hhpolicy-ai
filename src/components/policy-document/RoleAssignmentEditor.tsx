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
import { AlertTriangle, CheckCircle, Loader, HelpCircle } from 'lucide-react';
import { usePolicyDocumentRoleAssignment } from '@/hooks/usePolicyDocumentRoleAssignment';

interface RoleAssignmentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  currentRole: 'administrator' | 'executive' | null;
  onRoleChanged?: () => void;
}

const RoleAssignmentEditor = ({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  currentRole,
  onRoleChanged
}: RoleAssignmentEditorProps) => {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole || '');
  const { updateRoleAssignment, isUpdating } = usePolicyDocumentRoleAssignment();

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === currentRole) {
      onOpenChange(false);
      return;
    }

    const result = await updateRoleAssignment({
      documentId,
      newRole: selectedRole as 'administrator' | 'executive'
    });

    if (result.success) {
      onRoleChanged?.();
      onOpenChange(false);
    }
    // Error handling is now done in the hook with toast notifications
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'Only administrators will be able to view and interact with this document';
      case 'executive':
        return 'Only executives will be able to view and interact with this document';
      default:
        return 'Please select a role for this document';
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span>Assign Role</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Role assignment controls which user groups can access this document. Only users with the assigned role will see and interact with this document.</p>
                </TooltipContent>
              </Tooltip>
            </DialogTitle>
          </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Document</h4>
            <p className="text-sm text-blue-700">{documentTitle}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="role-select">Target Role</Label>
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
              disabled={isUpdating}
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrator">
                  <div className="flex items-center space-x-2">
                    <span>Administrator</span>
                  </div>
                </SelectItem>
                <SelectItem value="executive">
                  <div className="flex items-center space-x-2">
                    <span>Executive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-yellow-800 mb-1">
                    Access Control Impact
                  </h5>
                  <p className="text-sm text-yellow-700">
                    {getRoleDescription(selectedRole)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentRole && selectedRole && selectedRole !== currentRole && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-orange-800 mb-1">
                    Role Change Warning
                  </h5>
                  <p className="text-sm text-orange-700">
                    Changing from <strong>{currentRole}</strong> to <strong>{selectedRole}</strong> will immediately affect document access permissions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            disabled={!selectedRole || selectedRole === currentRole || isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
};

export default RoleAssignmentEditor;