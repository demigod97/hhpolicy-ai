
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentTable } from '@/components/dashboard/DocumentTable';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { DocumentUploader } from '@/components/document/DocumentUploader';
import { UserGreetingCard } from '@/components/dashboard/UserGreetingCard';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCreateChatSession } from '@/hooks/useChatSession';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, MessageSquarePlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks } = useNotebooks();
  const { documents, isLoading: documentsLoading } = useDocuments();
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

  const handleUploadComplete = async (sourceIds: string[]) => {
    console.log('Upload complete, source IDs:', sourceIds);

    // Show success message immediately
    toast({
      title: 'Upload Complete',
      description: `${sourceIds.length} document(s) uploaded successfully. Refreshing...`,
    });

    // Invalidate queries to refresh document list
    await queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    await queryClient.invalidateQueries({ queryKey: ['sources'] });
    await queryClient.invalidateQueries({ queryKey: ['documents'] });
    await queryClient.invalidateQueries({ queryKey: ['document-stats'] });

    // Wait a moment for queries to refetch before closing
    setTimeout(() => {
      setShowUploader(false);
    }, 500);
  };

  // Listen for upload dialog event from UserGreetingCard
  useEffect(() => {
    const handleOpenUpload = () => setShowUploader(true);
    window.addEventListener('open-upload-dialog', handleOpenUpload);
    return () => window.removeEventListener('open-upload-dialog', handleOpenUpload);
  }, []);

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
      // Get public URL from Supabase Storage
      // Buckets are public, security is enforced via sources table RLS
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        toast({
          title: 'Error',
          description: 'Failed to load PDF file. The file may be corrupted or inaccessible.',
          variant: 'destructive',
        });
        setSelectedDocument(null);
        return;
      }

      setSelectedDocument({
        id: data.id,
        title: data.title,
        url: urlData.publicUrl,
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
      <div className="min-h-screen bg-background flex flex-col">
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-destructive mb-4">Authentication error: {authError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Primary Navigation */}
      <PrimaryNavigationBar />

      {/* User Greeting Card */}
      <div className="bg-muted/30 px-8 py-6">
        <UserGreetingCard />
      </div>

      {/* Document Table - Full Width */}
      <div className="flex-1 overflow-auto p-6 bg-muted/30">
        <DocumentTable
          documents={documents}
          isLoading={documentsLoading}
          onDocumentSelect={handleDocumentSelect}
          onUploadClick={() => setShowUploader(true)}
          selectedDocumentId={selectedDocumentId}
          canUpload={canUpload}
          canManage={canUpload}
        />
      </div>

      {/* PDF Viewer Modal */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {selectedDocument?.title || 'Document Preview'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDocument(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="h-full overflow-hidden">
            {selectedDocument && (
              <PDFViewer
                fileUrl={selectedDocument.url}
                fileName={selectedDocument.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />

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
