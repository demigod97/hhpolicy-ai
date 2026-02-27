import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, FileText, Calendar, Loader2, FileImage } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PDFViewer } from '@/components/pdf/PDFViewer';

interface CitationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string;
  linesFrom?: number;
  linesTo?: number;
  onOpenFullPDF?: () => void;
}

interface ChunkData {
  content: string;
  policyName: string;
  policyDate: string;
  policyType: string;
  sourceTitle: string;
  pdfUrl?: string;
}

export const CitationPreview: React.FC<CitationPreviewProps> = ({
  open,
  onOpenChange,
  sourceId,
  linesFrom,
  linesTo,
  onOpenFullPDF,
}) => {
  const [chunkData, setChunkData] = useState<ChunkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && sourceId) {
      fetchChunkData();
    }
  }, [open, sourceId, linesFrom, linesTo]);

  const fetchChunkData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the chunk content from documents table
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('content, metadata, policyName, policyDate, policyType')
        .eq('source_id', sourceId)
        .order('id', { ascending: true });

      if (docsError) throw docsError;

      // Find the specific chunk matching the line range
      let matchedChunk = null;
      if (linesFrom !== undefined && linesTo !== undefined) {
        matchedChunk = docs?.find((doc: any) => {
          const lines = doc.metadata?.loc?.lines;
          return lines && lines.from === linesFrom && lines.to === linesTo;
        });
      }

      // If no specific chunk found, use first chunk
      const chunk = matchedChunk || docs?.[0];

      if (!chunk) {
        throw new Error('Citation content not found');
      }

      // Fetch source title and PDF path
      const { data: source, error: sourceError } = await supabase
        .from('sources')
        .select('title, pdf_file_path, pdf_storage_bucket')
        .eq('id', sourceId)
        .single();

      if (sourceError) throw sourceError;

      // Get signed URL for PDF
      let pdfUrl: string | undefined;
      if (source.pdf_file_path) {
        const bucket = source.pdf_storage_bucket || 'sources';
        const { data: signedUrlData } = await supabase
          .storage
          .from(bucket)
          .createSignedUrl(source.pdf_file_path, 3600); // 1 hour

        pdfUrl = signedUrlData?.signedUrl;
      }

      setChunkData({
        content: chunk.content || '',
        policyName: chunk.policyName || source.title || 'Policy Document',
        policyDate: chunk.policyDate || 'N/A',
        policyType: chunk.policyType || 'policy',
        sourceTitle: source.title || 'Document',
        pdfUrl,
      });
    } catch (err) {
      console.error('Error fetching chunk data:', err);
      setError('Failed to load citation content');
    } finally {
      setIsLoading(false);
    }
  };

  const formatContent = (content: string) => {
    // Remove markdown headers and clean up formatting
    return content
      .replace(/^##\s+/gm, '')
      .replace(/\\\\/g, '')
      .trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Citation Source
          </DialogTitle>
          <DialogDescription>
            Viewing cited content from policy document
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchChunkData}>
              Retry
            </Button>
          </div>
        ) : chunkData ? (
          <div className="space-y-4">
            {/* Policy Metadata */}
            <Card className="p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg">{chunkData.policyName}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {chunkData.policyType}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {chunkData.policyDate}
                    </div>
                    {linesFrom !== undefined && linesTo !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        Lines {linesFrom}-{linesTo}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs for Text and PDF View */}
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Text Preview
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-2">
                  <FileImage className="h-4 w-4" />
                  PDF View
                </TabsTrigger>
              </TabsList>

              {/* Text Preview Tab */}
              <TabsContent value="text" className="mt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Cited Content:
                  </h4>
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed text-gray-900">
                        {formatContent(chunkData.content)}
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-500">
                      This content was extracted from the policy document
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* PDF View Tab */}
              <TabsContent value="pdf" className="mt-4">
                {chunkData.pdfUrl ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="h-[500px]">
                      <PDFViewer
                        fileUrl={chunkData.pdfUrl}
                        fileName={chunkData.sourceTitle}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FileImage className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>PDF not available</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
