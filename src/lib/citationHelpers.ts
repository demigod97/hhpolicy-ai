import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches the chunk content from the documents table based on citation data
 * @param sourceId - The source document ID
 * @param linesFrom - Starting line number of the chunk
 * @param linesTo - Ending line number of the chunk
 * @returns The text content of the chunk, or null if not found
 */
export async function fetchChunkContent(
  sourceId: string,
  linesFrom: number,
  linesTo: number
): Promise<string | null> {
  // Guard: skip DB query for web citations (non-UUID source IDs)
  if (sourceId === 'fairwork-web' || !sourceId.match(/^[0-9a-f]{8}-/)) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('content, metadata')
      .eq('source_id', sourceId)
      .contains('metadata', {
        loc: {
          lines: {
            from: linesFrom,
            to: linesTo
          }
        }
      })
      .single();

    if (error) {
      console.error('Error fetching chunk content:', error);
      return null;
    }

    return data?.content || null;
  } catch (error) {
    console.error('Exception fetching chunk content:', error);
    return null;
  }
}

/**
 * Fetches chunk content by chunk index (alternative method)
 * @param sourceId - The source document ID
 * @param chunkIndex - The index of the chunk
 * @returns The text content of the chunk, or null if not found
 */
export async function fetchChunkByIndex(
  sourceId: string,
  chunkIndex: number
): Promise<string | null> {
  try {
    // Fetch all chunks for this source and get the one at the index
    const { data, error } = await supabase
      .from('documents')
      .select('content, metadata')
      .eq('source_id', sourceId)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching chunks:', error);
      return null;
    }

    if (!data || chunkIndex >= data.length) {
      console.error('Chunk index out of range');
      return null;
    }

    return data[chunkIndex]?.content || null;
  } catch (error) {
    console.error('Exception fetching chunk by index:', error);
    return null;
  }
}
