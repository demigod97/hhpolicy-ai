/**
 * RAG Context Builder
 *
 * Builds context from Supabase documents for role-based access
 */

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.39.3';

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    source_name?: string;
    page_number?: number;
    chunk_index?: number;
  };
  similarity?: number;
}

export interface RAGContext {
  documents: RAGDocument[];
  contextText: string;
  sources: string[];
}

/**
 * Get role-based document access levels
 */
function getRoleAccessLevels(userRole: string): string[] {
  switch (userRole) {
    case 'system_owner':
    case 'board':
      // Board sees everything
      return ['board', 'executive', 'administrator'];

    case 'company_operator':
    case 'executive':
      // Executives see executive and admin
      return ['executive', 'administrator'];

    case 'administrator':
    default:
      // Administrators see only admin docs
      return ['administrator'];
  }
}

/**
 * Search documents with vector similarity
 *
 * NOTE: This is a simplified version. For full vector search, you would:
 * 1. Generate embedding for the query using OpenAI embeddings
 * 2. Use Supabase pgvector to find similar documents
 * 3. Return ranked results
 *
 * For now, we'll do a simple text search
 */
export async function searchDocuments(
  supabase: SupabaseClient,
  query: string,
  userRole: string,
  limit: number = 5
): Promise<RAGDocument[]> {
  try {
    const accessLevels = getRoleAccessLevels(userRole);

    console.log('[RAG] Searching documents:', {
      query: query.substring(0, 50) + '...',
      userRole,
      accessLevels,
      limit
    });

    // Query documents table with role-based filtering
    // For now, using simple text search. In production, use vector similarity
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, content, metadata')
      .in('metadata->>assigned_role', accessLevels)
      .textSearch('content', query.split(' ').join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(limit);

    if (error) {
      console.error('[RAG] Error searching documents:', error);
      return [];
    }

    if (!documents || documents.length === 0) {
      console.log('[RAG] No documents found');
      return [];
    }

    console.log('[RAG] Found documents:', documents.length);

    return documents.map(doc => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata || {},
      similarity: 0.8 // Placeholder - would come from vector search
    }));

  } catch (error) {
    console.error('[RAG] Error in searchDocuments:', error);
    return [];
  }
}

/**
 * Build RAG context from documents
 */
export async function buildRAGContext(
  supabase: SupabaseClient,
  query: string,
  userRole: string,
  notebookId?: string
): Promise<RAGContext> {
  try {
    // Search for relevant documents
    const documents = await searchDocuments(supabase, query, userRole, 5);

    if (documents.length === 0) {
      return {
        documents: [],
        contextText: '',
        sources: []
      };
    }

    // Build context text with citations
    const contextParts: string[] = [];
    const sources: Set<string> = new Set();

    documents.forEach((doc, index) => {
      const sourceName = doc.metadata.source_name || 'Unknown Document';
      const pageNum = doc.metadata.page_number || 0;
      const citation = `[${index + 1}]`;

      sources.add(sourceName);

      // Add content with citation
      contextParts.push(
        `${citation} From "${sourceName}" (page ${pageNum}):\n${doc.content.substring(0, 500)}...`
      );
    });

    const contextText = contextParts.join('\n\n');

    console.log('[RAG] Built context:', {
      documentCount: documents.length,
      sources: Array.from(sources),
      contextLength: contextText.length
    });

    return {
      documents,
      contextText,
      sources: Array.from(sources)
    };

  } catch (error) {
    console.error('[RAG] Error building context:', error);
    return {
      documents: [],
      contextText: '',
      sources: []
    };
  }
}

/**
 * Format RAG context as system message
 */
export function formatRAGSystemMessage(context: RAGContext, userRole: string): string {
  if (context.documents.length === 0) {
    return `You are PolicyAi, an AI assistant for ${userRole} users.
You help answer questions about company policies.
Always be helpful and cite sources when providing information.`;
  }

  return `You are PolicyAi, an AI assistant for ${userRole} users.
You have access to the following policy documents:

${context.contextText}

Important instructions:
1. Always cite sources using the citation numbers [1], [2], etc.
2. Only use information from the provided documents
3. If you're not sure, say so and suggest contacting HR or compliance
4. Flag policies older than 18 months for review
5. Be concise but thorough in your answers

Available sources: ${context.sources.join(', ')}`;
}
