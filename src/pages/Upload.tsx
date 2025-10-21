import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { DocumentUploader } from '@/components/document/DocumentUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload as UploadIcon, FileText } from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notebooks } = useNotebooks();
  const [showUploader, setShowUploader] = useState(true);

  // Get the first notebook ID for uploads
  const defaultNotebookId = notebooks && notebooks.length > 0 ? notebooks[0].id : null;

  const handleUploadComplete = async (sourceIds: string[]) => {
    console.log('Upload complete, source IDs:', sourceIds);

    // Show success message
    toast({
      title: 'Upload Complete',
      description: `${sourceIds.length} document(s) uploaded successfully and are being processed.`,
    });

    // Invalidate queries to refresh document lists across the app
    await queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    await queryClient.invalidateQueries({ queryKey: ['sources'] });
    await queryClient.invalidateQueries({ queryKey: ['documents'] });
    await queryClient.invalidateQueries({ queryKey: ['document-stats'] });

    // Reset uploader to allow new uploads
    setTimeout(() => {
      setShowUploader(false);
      setTimeout(() => setShowUploader(true), 100);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader userEmail={user?.email} />
      <PrimaryNavigationBar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-normal text-gray-900 mb-2">Upload Documents</h1>
            <p className="text-gray-600">
              Upload policy documents to make them searchable and available for AI-powered Q&A.
            </p>
          </div>

          {/* Upload Instructions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Guidelines
              </CardTitle>
              <CardDescription>
                Follow these guidelines for best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Supported formats:</strong> PDF files only</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>File size:</strong> Maximum 50MB per file</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Processing time:</strong> Typically 30-60 seconds per document</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Best practices:</strong> Use clear, text-based PDFs (not scanned images)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Role assignment:</strong> Documents are set to "Administrator" role by default (can be changed later)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Document Uploader */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Upload Policy Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {defaultNotebookId ? (
                showUploader && (
                  <DocumentUploader
                    notebookId={defaultNotebookId}
                    onUploadComplete={handleUploadComplete}
                    onClose={() => {}}
                  />
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Loading... Please wait while we prepare the upload system.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Status Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Uploaded documents will be processed automatically. You can view the
              processing status on the Policies dashboard. Once processing is complete, the documents
              will be available for searching and AI-powered Q&A.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
