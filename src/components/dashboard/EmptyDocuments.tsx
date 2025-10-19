import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';

interface EmptyDocumentsProps {
  onUploadClick?: () => void;
}

export const EmptyDocuments: React.FC<EmptyDocumentsProps> = ({ onUploadClick }) => {
  const { userRole } = useUserRole();
  const canUpload = ['system_owner', 'company_operator'].includes(userRole || '');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileText className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No policy documents available</h3>
      <p className="text-gray-600 mb-6 max-w-sm">
        {canUpload
          ? 'Upload your first policy document to get started'
          : 'Contact your administrator to upload policy documents'}
      </p>
      {canUpload && onUploadClick && (
        <Button onClick={onUploadClick}>
          Upload Document
        </Button>
      )}
    </div>
  );
};
