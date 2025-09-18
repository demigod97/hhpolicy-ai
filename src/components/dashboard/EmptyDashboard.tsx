import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import AddSourcesDialog from '@/components/notebook/AddSourcesDialog';
const EmptyDashboard = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const {
    createNotebook,
    isCreating,
    refetch
  } = useNotebooks();

  const handleDocumentCreated = (notebookId: string) => {
    navigate(`/notebook/${notebookId}`);
    refetch();
  };
  const handleCreateNotebook = () => {
    console.log('Create notebook button clicked');
    console.log('isCreating:', isCreating);
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

  return <div className="text-center py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-medium text-gray-900 mb-4">Create your first policy document</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">PolicyAi is an AI-powered policy management assistant that helps you navigate and understand your organizational policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">PDFs</h3>
          <p className="text-gray-600">Upload research papers, reports, and documents</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Websites</h3>
          <p className="text-gray-600">Add web pages and online articles as sources</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Text Files</h3>
          <p className="text-gray-600">Upload plain text and markdown policy documents</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button onClick={handleCreateNotebook} size="lg" className="bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
          <Upload className="h-5 w-5 mr-2" />
          {isCreating ? 'Creating...' : 'Create Policy Document'}
        </Button>
        <Button
          onClick={() => setShowUploadModal(true)}
          size="lg"
          variant="outline"
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Existing Policy
        </Button>
      </div>

      <AddSourcesDialog
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        mode="create-document"
        onDocumentCreated={handleDocumentCreated}
      />
    </div>;
};
export default EmptyDashboard;