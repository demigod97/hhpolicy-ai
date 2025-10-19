
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { DocumentGrid } from '@/components/dashboard/DocumentGrid';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { SecondaryNavigationBar } from '@/components/navigation/SecondaryNavigationBar';
import { DocumentUploader } from '@/components/document/DocumentUploader';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCreateChatSession } from '@/hooks/useChatSession';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Upload, FileText, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks } = useNotebooks();
  const { userRole } = useUserRole();
  const createSession = useCreateChatSession();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Get the first notebook ID for uploads
  const defaultNotebookId = notebooks && notebooks.length > 0 ? notebooks[0].id : null;

  // Determine if user can upload based on role
  const canUpload = ['system_owner', 'company_operator'].includes(userRole || '');

  // Handler for creating a new chat session
  const handleNewChat = async () => {
    try {
      const session = await createSession.mutateAsync('New Chat');
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUploadComplete = (sourceIds: string[]) => {
    console.log('Upload complete, source IDs:', sourceIds);
    setShowUploader(false);
  };

  const handleDocumentSelect = async (documentId: string) => {
    setSelectedDocumentId(documentId);

    // Fetch the document details including storage bucket, processing status, and access control fields
    const { data, error } = await supabase
      .from('sources')
      .select('id, title, pdf_file_path, pdf_storage_bucket, file_path, processing_status, target_role, uploaded_by_user_id')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error loading document:', error);

      // Check if it's an RLS permission error
      if (error.code === 'PGRST116' || error.message?.includes('row-level security')) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this document.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load document details.',
          variant: 'destructive',
        });
      }
      setSelectedDocument(null);
      return;
    }

    // Check if document is still processing
    if (data?.processing_status === 'pending' || data?.processing_status === 'processing') {
      toast({
        title: 'Document Processing',
        description: 'This document is still being processed. Please wait until processing is complete.',
        variant: 'default',
      });
      setSelectedDocument(null);
      return;
    }

    // Check if processing failed
    if (data?.processing_status === 'failed') {
      toast({
        title: 'Processing Failed',
        description: 'This document failed to process. Please try re-uploading it.',
        variant: 'destructive',
      });
      setSelectedDocument(null);
      return;
    }

    // Determine the correct file path and bucket
    const filePath = data?.pdf_file_path || data?.file_path;
    const bucket = data?.pdf_storage_bucket || 'sources'; // Default to 'sources' bucket

    if (filePath) {
      // Get signed URL from Supabase Storage
      // Storage policies will also check RLS permissions
      const { data: urlData, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError) {
        console.error('Error creating signed URL:', urlError);

        // Check if it's a permissions error
        if (urlError.message?.includes('permission') || urlError.message?.includes('access')) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to view this PDF file.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load PDF file. The file may be corrupted or inaccessible.',
            variant: 'destructive',
          });
        }
        setSelectedDocument(null);
        return;
      }

      setSelectedDocument({
        id: data.id,
        title: data.title,
        url: urlData?.signedUrl,
      });
    } else {
      toast({
        title: 'No PDF Available',
        description: 'This document does not have an associated PDF file.',
        variant: 'destructive',
      });
      setSelectedDocument(null);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <DashboardHeader userEmail={user?.email} />
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <DashboardHeader userEmail={user?.email} />
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-4">Authentication error: {authError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header with navigation */}
      <DashboardHeader userEmail={user?.email} />

      {/* Primary Navigation */}
      <PrimaryNavigationBar />

      {/* Secondary Navigation (role-based) */}
      <SecondaryNavigationBar />

      {/* Header with title and action buttons */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal text-gray-900">Policy Documents</h1>
            <p className="text-gray-600 mt-1">Browse and view policy documents</p>
          </div>
          <div className="flex items-center gap-3">
            {/* New Chat Button - Always visible for all authenticated users */}
            <Button
              variant="default"
              size="lg"
              className="gap-2"
              onClick={handleNewChat}
              disabled={createSession.isPending}
            >
              <MessageSquarePlus className="h-5 w-5" />
              {createSession.isPending ? 'Creating...' : 'New Chat'}
            </Button>

            {/* Upload Button - Only for authorized roles */}
            {canUpload && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setShowUploader(true)}
                disabled={!defaultNotebookId}
              >
                <Upload className="h-5 w-5" />
                Upload Document
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Split View Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Document Grid */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full overflow-auto p-6 bg-gray-50">
              <DocumentGrid
                onDocumentSelect={handleDocumentSelect}
                onUploadClick={() => setShowUploader(true)}
                selectedDocumentId={selectedDocumentId}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: PDF Viewer */}
          <ResizablePanel defaultSize={60} minSize={35}>
            {selectedDocument ? (
              <PDFViewer
                fileUrl={selectedDocument.url}
                fileName={selectedDocument.title}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center text-gray-400">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Select a document to view</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Document Uploader Modal */}
      {defaultNotebookId && (
        <DocumentUploader
          open={showUploader}
          onOpenChange={setShowUploader}
          notebookId={defaultNotebookId}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
