import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId?: string;
  onUploadComplete?: (sourceIds: string[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  sourceId?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return File;
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.includes('pdf')) return FileText;
  return File;
};

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  open,
  onOpenChange,
  notebookId,
  onUploadComplete,
  acceptedFileTypes = ['application/pdf'],
  maxFiles = 20, // Increased from 5 to allow more documents
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFileAndProcess } = useFileUpload();

  // Reset files state when dialog opens to allow fresh uploads
  useEffect(() => {
    if (open) {
      setFiles([]);
      setIsUploading(false);
    }
  }, [open]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.slice(0, maxFiles - files.length).map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          uploadProgress: 0,
          uploadStatus: 'pending' as const,
        })
      );
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      // Ensure type is defined before using it
      if (type && ACCEPTED_FILE_TYPES[type as keyof typeof ACCEPTED_FILE_TYPES]) {
        acc[type] = ACCEPTED_FILE_TYPES[type as keyof typeof ACCEPTED_FILE_TYPES];
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (!notebookId) {
      console.error('No notebook ID provided');
      return;
    }

    setIsUploading(true);

    const uploadPromises = files.map(async (file, index) => {
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], uploadStatus: 'uploading', uploadProgress: 0 };
        return newFiles;
      });

      try {
        // Upload with progress tracking
        const onProgress = (progress: number) => {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], uploadProgress: progress };
            return newFiles;
          });
        };

        const result = await uploadFileAndProcess(file, notebookId, onProgress);

        if (result.success) {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              uploadStatus: 'completed',
              uploadProgress: 100,
              sourceId: result.sourceId,
            };
            return newFiles;
          });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[index] = {
            ...newFiles[index],
            uploadStatus: 'error',
            errorMessage: error instanceof Error ? error.message : 'Upload failed',
          };
          return newFiles;
        });
      }
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);

    // Get successful uploads
    const successfulUploads = files
      .filter((f) => f.uploadStatus === 'completed' && f.sourceId)
      .map((f) => f.sourceId!);

    if (successfulUploads.length > 0 && onUploadComplete) {
      onUploadComplete(successfulUploads);
    }

    // Don't auto-close - let parent component handle it via onUploadComplete
    // This allows proper query invalidation before closing
  };

  const handleClose = () => {
    // Clean up object URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setIsUploading(false);
    onOpenChange(false);
  };

  const allFilesProcessed = files.length > 0 && files.every((f) => f.uploadStatus === 'completed');
  const hasErrors = files.some((f) => f.uploadStatus === 'error');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload PDF policy documents. Maximum {maxFiles} files, {maxSize / 1024 / 1024}MB each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone Area */}
          {files.length < maxFiles && !isUploading && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500">
                Supported: PDF files only
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                const statusIcon = {
                  pending: null,
                  uploading: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
                  processing: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
                  completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                  error: <AlertCircle className="h-4 w-4 text-red-600" />,
                };

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileIcon className="h-8 w-8 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {statusIcon[file.uploadStatus || 'pending']}
                        {!isUploading && file.uploadStatus !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(file.uploadStatus === 'uploading' || file.uploadStatus === 'processing') && (
                      <div className="space-y-1">
                        <Progress value={file.uploadProgress || 0} className="h-2" />
                        <p className="text-xs text-gray-500">
                          {file.uploadStatus === 'processing'
                            ? 'Processing document...'
                            : `Uploading... ${file.uploadProgress || 0}%`}
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {file.uploadStatus === 'completed' && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Upload complete
                      </Badge>
                    )}

                    {/* Error Message */}
                    {file.uploadStatus === 'error' && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Upload Failed</AlertTitle>
                        <AlertDescription className="text-xs">
                          {file.errorMessage || 'An error occurred during upload'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary Alert */}
          {allFilesProcessed && (
            <Alert className="border-green-600 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Upload Complete</AlertTitle>
              <AlertDescription className="text-green-800">
                All {files.length} file(s) have been uploaded and are being processed.
              </AlertDescription>
            </Alert>
          )}

          {hasErrors && !isUploading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Some Uploads Failed</AlertTitle>
              <AlertDescription>
                Please remove failed files and try again, or continue with successful uploads.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading || allFilesProcessed}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
