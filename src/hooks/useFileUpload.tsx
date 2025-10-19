import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UploadResult {
  success: boolean;
  sourceId?: string;
  filePath?: string;
  error?: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Upload a file and process it through the document processing pipeline
   * @param file The file to upload
   * @param notebookId The notebook ID to associate with
   * @param onProgress Optional progress callback
   * @returns UploadResult with success status and sourceId
   */
  const uploadFileAndProcess = async (
    file: File,
    notebookId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Step 1: Create source record first (pending status)
      onProgress?.(10);
      const sourceType = getSourceType(file.type);

      const { data: sourceData, error: sourceError} = await supabase
        .from('sources')
        .insert({
          notebook_id: notebookId,
          type: sourceType,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension from title
          processing_status: 'pending',
          target_role: 'administrator', // Default role, can be changed
          metadata: {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          },
        })
        .select()
        .single();

      if (sourceError || !sourceData) {
        console.error('Source creation error:', sourceError);
        throw new Error('Failed to create source record');
      }

      const sourceId = sourceData.id;
      onProgress?.(30);

      // Step 2: Upload file to Supabase storage
      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `${notebookId}/${sourceId}.${fileExtension}`;

      console.log('Uploading file to storage:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);

        // Update source status to failed
        await supabase
          .from('sources')
          .update({ processing_status: 'failed' })
          .eq('id', sourceId);

        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      onProgress?.(60);

      // Step 3: Update source with file path and PDF metadata
      const { error: updateError } = await supabase
        .from('sources')
        .update({
          file_path: filePath,
          pdf_file_path: sourceType === 'pdf' ? filePath : null,
          pdf_storage_bucket: 'sources',
          pdf_file_size: file.size,
          processing_status: 'processing'
        })
        .eq('id', sourceId);

      if (updateError) {
        console.error('Source update error:', updateError);
      }

      onProgress?.(75);

      // Step 4: Call process-document edge function
      console.log('Calling process-document edge function');

      const { data: processData, error: processError } = await supabase.functions.invoke(
        'process-document',
        {
          body: {
            sourceId,
            filePath,
            sourceType,
          },
        }
      );

      if (processError) {
        console.error('Process document error:', processError);

        // Update source status to failed
        await supabase
          .from('sources')
          .update({ processing_status: 'failed' })
          .eq('id', sourceId);

        throw new Error(`Processing failed: ${processError.message}`);
      }

      onProgress?.(100);

      console.log('Document processing initiated:', processData);

      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded and is being processed.`,
      });

      return {
        success: true,
        sourceId,
        filePath,
      };

    } catch (error) {
      console.error('File upload and process failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      toast({
        title: 'Upload Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Legacy upload function (for backward compatibility)
   * @deprecated Use uploadFileAndProcess instead
   */
  const uploadFile = async (
    file: File,
    notebookId: string,
    sourceId: string
  ): Promise<string | null> => {
    try {
      setIsUploading(true);

      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `${notebookId}/${sourceId}.${fileExtension}`;

      console.log('Uploading file to:', filePath);

      const { data, error } = await supabase.storage
        .from('sources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);
      return filePath;
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload Error',
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('sources')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /**
   * Determine source type based on file MIME type
   */
  const getSourceType = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('text')) return 'text';
    if (mimeType.startsWith('image/')) return 'image';
    return 'file';
  };

  return {
    uploadFile,
    uploadFileAndProcess,
    getFileUrl,
    isUploading,
  };
};
