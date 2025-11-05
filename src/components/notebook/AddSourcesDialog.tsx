import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Link, Copy, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MultipleWebsiteUrlsDialog from './MultipleWebsiteUrlsDialog';
import CopiedTextDialog from './CopiedTextDialog';
import { useSources } from '@/hooks/useSources';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { formatFileSize } from '@/lib/utils';

interface AddSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId?: string;
  mode?: 'add-sources' | 'create-document';
  onDocumentCreated?: (notebookId: string) => void;
}

interface FileWithValidation extends File {
  id: string;
  validationStatus: 'pending' | 'validating' | 'valid' | 'invalid';
  validationErrors: string[];
}

const AddSourcesDialog = ({
  open,
  onOpenChange,
  notebookId,
  mode = 'add-sources',
  onDocumentCreated
}: AddSourcesDialogProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [showCopiedTextDialog, setShowCopiedTextDialog] = useState(false);
  const [showMultipleWebsiteDialog, setShowMultipleWebsiteDialog] = useState(false);
  const [isLocallyProcessing, setIsLocallyProcessing] = useState(false);

  // Get user role first
  const { userRole, isAdministrator } = useUserRole();

  // New state for document creation mode
  const [documentTitle, setDocumentTitle] = useState('');
  // Default to 'executive' as fallback when userRole is undefined due to RLS issues
  // This matches the current user's role from the migrations (demi@coralshades.ai = executive)
  const [targetRole, setTargetRole] = useState<'administrator' | 'executive'>(
    (userRole === 'administrator' || userRole === 'executive') ? userRole : 'executive'
  );
  const [validatingFiles, setValidatingFiles] = useState<FileWithValidation[]>([]);

  // Debug: Log when documentTitle changes
  useEffect(() => {
    console.log('DEBUG: documentTitle state changed to:', documentTitle);
  }, [documentTitle]);

  // Ref to directly access the input value
  const documentTitleRef = useRef<HTMLInputElement>(null);

  // Working notebook ID - either provided or created
  const [workingNotebookId, setWorkingNotebookId] = useState<string | undefined>(notebookId);

  const {
    addSourceAsync,
    updateSource,
    isAdding
  } = useSources(workingNotebookId);

  const {
    uploadFile,
    isUploading
  } = useFileUpload();

  const {
    processDocumentAsync,
    isProcessing
  } = useDocumentProcessing();

  const {
    generateNotebookContentAsync,
    isGenerating
  } = useNotebookGeneration();

  const {
    createNotebook
  } = useNotebooks();

  // MIME type validation
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'audio/mpeg',
    'audio/wav',
    'audio/m4a',
    'audio/mp3'
  ];

  const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

  const {
    toast
  } = useToast();

  // Reset local processing state when dialog opens (only when transitioning from closed to open)
  const [wasOpen, setWasOpen] = useState(false);
  useEffect(() => {
    console.log('DEBUG: useEffect triggered - open:', open, 'wasOpen:', wasOpen, 'notebookId:', notebookId);
    if (open && !wasOpen) {
      console.log('DEBUG: Resetting state because dialog is opening for first time');
      // Dialog is opening for the first time
      setIsLocallyProcessing(false);
      setWorkingNotebookId(notebookId);
      setDocumentTitle('');
      setTargetRole((userRole === 'administrator' || userRole === 'executive') ? userRole : 'executive');
      setValidatingFiles([]);
      setWasOpen(true);
    } else if (!open) {
      console.log('DEBUG: Dialog is closing, resetting wasOpen');
      // Dialog is closing - reset wasOpen for next time
      setWasOpen(false);
    }
  }, [open, notebookId, userRole]);

  // Validate file
  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check file size
    if (file.size > FILE_SIZE_LIMIT) {
      errors.push(`File size exceeds ${formatFileSize(FILE_SIZE_LIMIT)} limit`);
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`File type '${file.type}' is not supported`);
    }

    return { valid: errors.length === 0, errors };
  };

  // Create document if in create-document mode
  const createDocumentIfNeeded = async (): Promise<string | null> => {
    if (mode === 'create-document' && !workingNotebookId) {
      console.log('DEBUG: createDocumentIfNeeded called');
      console.log('DEBUG: documentTitle state:', documentTitle);

      // Try to get the value from the ref as fallback
      const titleFromRef = documentTitleRef.current?.value || '';
      console.log('DEBUG: documentTitle from ref:', titleFromRef);

      const actualTitle = documentTitle.trim() || titleFromRef.trim();
      console.log('DEBUG: actualTitle:', actualTitle);

      if (!actualTitle) {
        console.log('DEBUG: Document title validation failed');
        toast({
          title: "Document Title Required",
          description: "Please enter a document title to proceed",
          variant: "destructive"
        });
        return null;
      }

      try {
        const newNotebook = await createNotebook({
          title: actualTitle,
          assigned_role: targetRole
        });

        setWorkingNotebookId(newNotebook.id);

        if (onDocumentCreated) {
          onDocumentCreated(newNotebook.id);
        }

        return newNotebook.id;
      } catch (error) {
        console.error('Failed to create document:', error);
        toast({
          title: "Failed to Create Document",
          description: "Please try again",
          variant: "destructive"
        });
        return null;
      }
    }

    return workingNotebookId || null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  }, []);

  const processFileAsync = async (file: File, sourceId: string, notebookId: string) => {
    try {
      console.log('Starting file processing for:', file.name, 'source:', sourceId);
      const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';

      // Update status to uploading
      updateSource({
        sourceId,
        updates: {
          processing_status: 'uploading'
        }
      });

      // Upload the file
      const filePath = await uploadFile(file, notebookId, sourceId);
      if (!filePath) {
        throw new Error('File upload failed - no file path returned');
      }
      console.log('File uploaded successfully:', filePath);

      // Update with file path and set to processing
      updateSource({
        sourceId,
        updates: {
          file_path: filePath,
          processing_status: 'processing'
        }
      });

      // Start document processing
      try {
        await processDocumentAsync({
          sourceId,
          filePath,
          sourceType: fileType
        });

        // Generate notebook content
        await generateNotebookContentAsync({
          notebookId,
          filePath,
          sourceType: fileType
        });
        console.log('Document processing completed for:', sourceId);
      } catch (processingError) {
        console.error('Document processing failed:', processingError);

        // Update to completed with basic info if processing fails
        updateSource({
          sourceId,
          updates: {
            processing_status: 'completed'
          }
        });
      }
    } catch (error) {
      console.error('File processing failed for:', file.name, error);

      // Update status to failed
      updateSource({
        sourceId,
        updates: {
          processing_status: 'failed'
        }
      });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    // Validate files first
    const validatedFiles: FileWithValidation[] = files.map(file => {
      const validation = validateFile(file);
      return {
        ...file,
        id: crypto.randomUUID(),
        validationStatus: validation.valid ? 'valid' : 'invalid',
        validationErrors: validation.errors
      } as FileWithValidation;
    });

    const invalidFiles = validatedFiles.filter(f => f.validationStatus === 'invalid');
    if (invalidFiles.length > 0) {
      const errorMessage = invalidFiles.map(f =>
        `${f.name}: ${f.validationErrors.join(', ')}`
      ).join('\n');

      toast({
        title: "File Validation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    // Ensure we have a working notebook
    const targetNotebookId = await createDocumentIfNeeded();
    if (!targetNotebookId) {
      return;
    }

    console.log('Processing multiple files with delay strategy:', files.length);
    setIsLocallyProcessing(true);

    try {
      // Step 1: Create the first source immediately (this will trigger generation if it's the first source)
      const firstFile = files[0];
      const firstFileType = firstFile.type.includes('pdf') ? 'pdf' : firstFile.type.includes('audio') ? 'audio' : 'text';
      const firstSourceData = {
        notebookId: targetNotebookId,
        title: firstFile.name,
        type: firstFileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
        file_size: firstFile.size,
        processing_status: 'pending',
        metadata: {
          fileName: firstFile.name,
          fileType: firstFile.type
        }
      };
      
      console.log('Creating first source for:', firstFile.name);
      const firstSource = await addSourceAsync(firstSourceData);

      // Validate first source creation
      if (!firstSource || !firstSource.id) {
        console.error('Failed to create first source - invalid response:', firstSource);
        throw new Error('Source creation failed - invalid response');
      }

      console.log('First source created successfully:', firstSource.id);

      let remainingSources = [];
      
      // Step 2: If there are more files, add a delay before creating the rest
      if (files.length > 1) {
        console.log('Adding 150ms delay before creating remaining sources...');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Create remaining sources
        remainingSources = await Promise.all(files.slice(1).map(async (file, index) => {
          const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';
          const sourceData = {
            notebookId: targetNotebookId,
            title: file.name,
            type: fileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
            file_size: file.size,
            processing_status: 'pending',
            metadata: {
              fileName: file.name,
              fileType: file.type
            }
          };
          console.log('Creating source for:', file.name);
          return await addSourceAsync(sourceData);
        }));

        // Validate remaining sources
        const validRemainingSources = remainingSources.filter(source => {
          if (!source || !source.id) {
            console.error('Invalid remaining source:', source);
            return false;
          }
          return true;
        });

        if (validRemainingSources.length !== remainingSources.length) {
          console.warn(`Some sources failed to create. Expected: ${remainingSources.length}, Valid: ${validRemainingSources.length}`);
        }

        remainingSources = validRemainingSources;
        console.log('Valid remaining sources created:', remainingSources.length);
      }

      // Combine all created sources
      const allCreatedSources = [firstSource, ...remainingSources];

      console.log('All sources created successfully:', allCreatedSources.length);

      // Step 3: Close dialog immediately
      setIsLocallyProcessing(false);
      onOpenChange(false);

      // Step 4: Show success toast
      toast({
        title: "Files Added",
        description: `${files.length} file${files.length > 1 ? 's' : ''} added and processing started`
      });

      // Step 5: Process files in parallel (background)
      // Validate all sources have valid IDs before processing
      const validSourceIds = allCreatedSources.map((source, index) => {
        if (!source || !source.id) {
          console.error(`Source ${index} is invalid for file processing:`, source);
          return null;
        }
        return source.id;
      });

      // Only process files that have valid corresponding sources
      const processingPromises = files
        .map((file, index) => ({ file, sourceId: validSourceIds[index] }))
        .filter(item => item.sourceId !== null)
        .map(({ file, sourceId }) => processFileAsync(file, sourceId, targetNotebookId));

      // Don't await - let processing happen in background
      Promise.allSettled(processingPromises).then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log('File processing completed:', {
          successful,
          failed
        });

        if (failed > 0) {
          toast({
            title: "Processing Issues",
            description: `${failed} file${failed > 1 ? 's' : ''} had processing issues. Check the sources list for details.`,
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Error creating sources:', error);
      setIsLocallyProcessing(false);
      toast({
        title: "Error",
        description: "Failed to add files. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTextSubmit = async (title: string, content: string) => {
    // Ensure we have a working notebook
    const targetNotebookId = await createDocumentIfNeeded();
    if (!targetNotebookId) {
      return;
    }

    setIsLocallyProcessing(true);

    try {
      // Create source record first to get the ID
      const createdSource = await addSourceAsync({
        notebookId: targetNotebookId,
        title,
        type: 'text',
        content,
        processing_status: 'processing',
        metadata: {
          characterCount: content.length,
          webhookProcessed: true
        }
      });

      // Send to webhook endpoint with source ID
      const { data, error } = await supabase.functions.invoke('process-additional-sources', {
        body: {
          type: 'copied-text',
          notebookId: targetNotebookId,
          title,
          content,
          sourceIds: [createdSource.id], // Pass the source ID
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Text has been added and sent for processing"
      });
    } catch (error) {
      console.error('Error adding text source:', error);
      toast({
        title: "Error",
        description: "Failed to add text source",
        variant: "destructive"
      });
    } finally {
      setIsLocallyProcessing(false);
    }

    onOpenChange(false);
  };

  const handleMultipleWebsiteSubmit = async (urls: string[]) => {
    // Ensure we have a working notebook
    const targetNotebookId = await createDocumentIfNeeded();
    if (!targetNotebookId) {
      return;
    }

    setIsLocallyProcessing(true);

    try {
      console.log('Creating sources for multiple websites with delay strategy:', urls.length);

      // Create the first source immediately (this will trigger generation if it's the first source)
      const firstSource = await addSourceAsync({
        notebookId: targetNotebookId,
        title: `Website 1: ${urls[0]}`,
        type: 'website',
        url: urls[0],
        processing_status: 'processing',
        metadata: {
          originalUrl: urls[0],
          webhookProcessed: true
        }
      });
      
      console.log('First source created:', firstSource.id);
      
      let remainingSources = [];
      
      // If there are more URLs, add a delay before creating the rest
      if (urls.length > 1) {
        console.log('Adding 150ms delay before creating remaining sources...');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Create remaining sources
        remainingSources = await Promise.all(urls.slice(1).map(async (url, index) => {
          return await addSourceAsync({
            notebookId: targetNotebookId,
            title: `Website ${index + 2}: ${url}`,
            type: 'website',
            url,
            processing_status: 'processing',
            metadata: {
              originalUrl: url,
              webhookProcessed: true
            }
          });
        }));
        
        console.log('Remaining sources created:', remainingSources.length);
      }

      // Combine all created sources
      const allCreatedSources = [firstSource, ...remainingSources];

      // Send to webhook endpoint with all source IDs
      const { data, error } = await supabase.functions.invoke('process-additional-sources', {
        body: {
          type: 'multiple-websites',
          notebookId: targetNotebookId,
          urls,
          sourceIds: allCreatedSources.map(source => source.id), // Pass array of source IDs
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${urls.length} website${urls.length > 1 ? 's' : ''} added and sent for processing`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding multiple websites:', error);
      toast({
        title: "Error",
        description: "Failed to add websites",
        variant: "destructive"
      });
    } finally {
      setIsLocallyProcessing(false);
    }
  };

  // Use local processing state instead of global processing states
  const isProcessingFiles = isLocallyProcessing;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#FFFFFF">
                    <path d="M480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Zm24-80h252q45-32 69.5-79T700-580q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 54 24.5 101t69.5 79Zm126 0Z" />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-medium">PolicyAi</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {mode === 'create-document' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-blue-900">Create New Policy Document</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="document-title" className="text-blue-800">Document Title *</Label>
                    <Input
                      ref={documentTitleRef}
                      id="document-title"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g., Employee Handbook 2024"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="target-role" className="text-blue-800">Assign to Role *</Label>
                    <Select value={targetRole} onValueChange={(value) => setTargetRole(value as 'administrator' | 'executive')}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrator">Administrator</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>This document will be accessible only to users with the {targetRole} role.</span>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-medium mb-2">{mode === 'create-document' ? 'Upload Policy Sources' : 'Add sources'}</h2>
              <p className="text-gray-600 text-sm mb-1">
                {mode === 'create-document'
                  ? 'Upload policy documents that will be processed and made available for role-based queries.'
                  : 'Sources let PolicyAi base its responses on the information that matters most to you.'
                }
              </p>
              <p className="text-gray-500 text-xs">
                {mode === 'create-document'
                  ? '(Examples: policy manuals, compliance documents, procedures, regulations, etc.)'
                  : '(Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)'
                }
              </p>
            </div>

            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              } ${isProcessingFiles ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
                  <Upload className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {isProcessingFiles ? 'Processing files...' : 'Upload sources'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {isProcessingFiles ? (
                      'Please wait while we process your files'
                    ) : (
                      <>
                        Drag & drop or{' '}
                        <button 
                          className="text-blue-600 hover:underline" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isProcessingFiles}
                        >
                          choose file
                        </button>{' '}
                        to upload
                      </>
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.txt,.md,.mp3,.wav,.m4a"
                  onChange={handleFileSelect}
                  disabled={isProcessingFiles}
                />
              </div>
            </div>

            {/* Integration Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowMultipleWebsiteDialog(true)}
                disabled={isProcessingFiles}
              >
                <Link className="h-6 w-6 text-green-600" />
                <span className="font-medium">Link - Website</span>
                <span className="text-sm text-gray-500">Multiple URLs at once</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowCopiedTextDialog(true)}
                disabled={isProcessingFiles}
              >
                <Copy className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Paste Text - Copied Text</span>
                <span className="text-sm text-gray-500">Add copied content</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <CopiedTextDialog 
        open={showCopiedTextDialog} 
        onOpenChange={setShowCopiedTextDialog} 
        onSubmit={handleTextSubmit} 
      />

      <MultipleWebsiteUrlsDialog 
        open={showMultipleWebsiteDialog} 
        onOpenChange={setShowMultipleWebsiteDialog} 
        onSubmit={handleMultipleWebsiteSubmit} 
      />
    </>
  );
};

export default AddSourcesDialog;
