import React, { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, FileImage, Loader2, Calendar, X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { useNotes } from '@/hooks/useNotes';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  sourceId: string;
  linesFrom?: number;
  linesTo?: number;
  onClose?: () => void;
  chatSessionId?: string;
}

interface DocumentData {
  fullContent: string;
  chunks: Array<{
    content: string;
    linesFrom: number;
    linesTo: number;
  }>;
  policyName: string;
  policyDate: string;
  policyType: string;
  sourceTitle: string;
  pdfUrl?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  sourceId,
  linesFrom,
  linesTo,
  onClose,
  chatSessionId,
}) => {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { createNote, isCreating } = useNotes(chatSessionId);

  useEffect(() => {
    if (sourceId) {
      fetchFullDocument();
    }
  }, [sourceId]);

  // Scroll to highlighted section after render - with delay and contained scroll
  useEffect(() => {
    if (highlightRef.current && documentData && scrollAreaRef.current) {
      // Wait for layout to settle before scrolling
      const timer = setTimeout(() => {
        if (highlightRef.current) {
          // Get the scroll container (ScrollArea viewport)
          const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');

          if (scrollContainer && highlightRef.current) {
            // Calculate position within the scroll container
            const containerTop = scrollContainer.getBoundingClientRect().top;
            const elementTop = highlightRef.current.getBoundingClientRect().top;
            const offset = elementTop - containerTop - 100; // 100px from top

            // Scroll the container, not the whole page
            scrollContainer.scrollTo({
              top: scrollContainer.scrollTop + offset,
              behavior: 'smooth',
            });
          }
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [documentData]);

  const fetchFullDocument = async () => {
    setIsLoading(true);
    setError(null);

    // Guard: skip DB query for web citations (non-UUID source IDs)
    if (sourceId === 'fairwork-web' || !sourceId.match(/^[0-9a-f]{8}-/)) {
      setError('This is a web citation. Open it in your browser instead.');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch ALL chunks for this source
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('content, metadata, policyName, policyDate, policyType')
        .eq('source_id', sourceId)
        .order('id', { ascending: true });

      if (docsError) throw docsError;

      if (!docs || docs.length === 0) {
        throw new Error('No document content found');
      }

      // Fetch source metadata and PDF
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
          .createSignedUrl(source.pdf_file_path, 3600);

        pdfUrl = signedUrlData?.signedUrl;
      }

      // Build chunks array with line ranges
      const chunks = docs.map((doc: any) => ({
        content: doc.content || '',
        linesFrom: doc.metadata?.loc?.lines?.from || 0,
        linesTo: doc.metadata?.loc?.lines?.to || 0,
      }));

      // Concatenate all chunk content for full document
      const fullContent = chunks.map((chunk) => chunk.content).join('\n\n');

      setDocumentData({
        fullContent,
        chunks,
        policyName: docs[0].policyName || source.title || 'Policy Document',
        policyDate: docs[0].policyDate || 'N/A',
        policyType: docs[0].policyType || 'policy',
        sourceTitle: source.title || 'Document',
        pdfUrl,
      });
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  // Render markdown text with citation highlighting
  const renderContentWithHighlight = (content: string, chunks: DocumentData['chunks']) => {
    // If no specific lines to highlight, just render the content
    if (linesFrom === undefined || linesTo === undefined) {
      return <div className="prose prose-sm max-w-none">{formatMarkdown(content)}</div>;
    }

    // Find the chunk that contains the cited lines
    const citedChunk = chunks.find(
      (chunk) => chunk.linesFrom === linesFrom && chunk.linesTo === linesTo
    );

    if (!citedChunk) {
      return <div className="prose prose-sm max-w-none">{formatMarkdown(content)}</div>;
    }

    // Split content by chunks and highlight the cited one
    return (
      <div className="prose prose-sm max-w-none">
        {chunks.map((chunk, index) => {
          const isCited = chunk.linesFrom === linesFrom && chunk.linesTo === linesTo;

          return (
            <div
              key={index}
              ref={isCited ? highlightRef : undefined}
              className={
                isCited
                  ? 'bg-yellow-100 border-l-4 border-yellow-500 pl-4 py-3 my-2 rounded-r'
                  : 'mb-4'
              }
            >
              {isCited && (
                <Badge variant="secondary" className="mb-2 text-xs">
                  Cited Section (Lines {linesFrom}-{linesTo})
                </Badge>
              )}
              {formatMarkdown(chunk.content)}
            </div>
          );
        })}
      </div>
    );
  };

  // Basic markdown formatting
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg font-semibold mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-xl font-bold mt-4 mb-2">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Handle bold text
      const parts = line.split(/(\*\*.*?\*\*|__.*?__)/g);
      const processedLine = parts.map((part, partIndex) => {
        if (part.match(/^\*\*(.*)\*\*$/) || part.match(/^__(.*__)$/)) {
          const boldText = part.replace(/^\*\*|\*\*$|^__|__$/g, '');
          return <strong key={partIndex}>{boldText}</strong>;
        }
        return <span key={partIndex}>{part}</span>;
      });

      return (
        <p key={index} className="mb-2 leading-relaxed text-gray-900">
          {processedLine}
        </p>
      );
    });
  };

  // Handle save to note
  const handleSaveToNote = () => {
    if (!documentData || !chatSessionId) return;

    // Get the cited chunk content if specific lines are highlighted
    let noteContent = documentData.fullContent;
    let noteTitle = `Citation from ${documentData.policyName}`;

    if (linesFrom !== undefined && linesTo !== undefined) {
      const citedChunk = documentData.chunks.find(
        (chunk) => chunk.linesFrom === linesFrom && chunk.linesTo === linesTo
      );
      if (citedChunk) {
        noteContent = citedChunk.content;
        noteTitle = `Citation (Lines ${linesFrom}-${linesTo}) - ${documentData.policyName}`;
      }
    }

    createNote({
      title: noteTitle,
      content: noteContent,
      source_type: 'user',
    });

    toast({
      title: 'Saved to Notes',
      description: 'Citation has been saved to your notes',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Failed to load document'}</p>
        <Button variant="outline" onClick={fetchFullDocument}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">
              {documentData.policyName}
            </h3>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="secondary" className="capitalize">
                {documentData.policyType}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                {documentData.policyDate}
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Save to Note Button */}
        {chatSessionId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToNote}
            disabled={isCreating}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Saving...' : 'Save to Notes'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="text" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 border-b border-gray-200 flex-shrink-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Full Document
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <FileImage className="h-4 w-4" />
              PDF View
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Text Content Tab */}
        <TabsContent value="text" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full max-h-[calc(100vh-300px)]" ref={scrollAreaRef}>
            <div className="p-6">
              {renderContentWithHighlight(documentData.fullContent, documentData.chunks)}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* PDF View Tab */}
        <TabsContent value="pdf" className="flex-1 mt-0 overflow-hidden">
          {documentData.pdfUrl ? (
            <div className="h-full overflow-hidden">
              <PDFViewer
                fileUrl={documentData.pdfUrl}
                fileName={documentData.sourceTitle}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileImage className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>PDF not available</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
