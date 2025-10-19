/**
 * CopilotKit Actions Hook
 *
 * Registers PolicyAI actions that appear in the CopilotKit Inspector
 * and can be invoked by the AI assistant.
 */

import { useCopilotAction } from "@copilotkit/react-core";
import { Citation } from "@/types/message";
import { supabase } from "@/integrations/supabase/client";

interface UseCopilotKitActionsProps {
  notebookId?: string;
  onCitationClick?: (citation: Citation) => void;
  onSaveToNote?: (content: string) => void;
  onClearChat?: () => void;
}

/**
 * Hook for registering CopilotKit actions
 */
export const useCopilotKitActions = ({
  notebookId,
  onCitationClick,
  onSaveToNote,
  onClearChat,
}: UseCopilotKitActionsProps) => {

  // Action 1: Search Policies
  useCopilotAction({
    name: "searchPolicies",
    description: "Search across policy documents using natural language. Returns relevant policies with citations based on user role.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The search query (e.g., 'remote work policy', 'vacation days')",
        required: true,
      },
      {
        name: "limit",
        type: "number",
        description: "Maximum number of results to return (default: 5)",
        required: false,
      },
    ],
    handler: async ({ query, limit = 5 }) => {
      console.log('[Action: searchPolicies]', { query, limit, notebookId });

      try {
        // Search sources by title or content (basic text search)
        // RLS policies will automatically filter by user role
        const { data: sources, error } = await supabase
          .from('sources')
          .select('id, title, type, content, metadata, created_at')
          .eq('notebook_id', notebookId)
          .eq('processing_status', 'completed')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(limit);

        if (error) {
          console.error('[Action: searchPolicies] Error:', error);
          return `❌ Error searching policies: ${error.message}`;
        }

        if (!sources || sources.length === 0) {
          return `📄 No policy documents found matching "${query}". Try different search terms or upload relevant policy documents.`;
        }

        // Format results with citations
        const results = sources.map((source, idx) => {
          const metadata = source.metadata as any || {};
          const preview = source.content
            ? source.content.substring(0, 200).trim() + '...'
            : 'No preview available';

          return `${idx + 1}. **${source.title}** (${source.type})\n   ${preview}`;
        }).join('\n\n');

        return `📚 Found ${sources.length} relevant policy document${sources.length > 1 ? 's' : ''} for "${query}":\n\n${results}\n\n💡 Click on a document citation to view the full content.`;

      } catch (error: any) {
        console.error('[Action: searchPolicies] Exception:', error);
        return `❌ Failed to search policies: ${error.message || 'Unknown error'}`;
      }
    },
  });

  // Action 2: Get Citation
  useCopilotAction({
    name: "getCitation",
    description: "Retrieve full text and context for a specific policy citation.",
    parameters: [
      {
        name: "documentName",
        type: "string",
        description: "Name of the policy document",
        required: true,
      },
      {
        name: "pageNumber",
        type: "number",
        description: "Page number in the document",
        required: false,
      },
    ],
    handler: async ({ documentName, pageNumber }) => {
      console.log('[Action: getCitation]', { documentName, pageNumber });

      try {
        // Find the source by title
        // RLS policies will automatically filter by user role
        const { data: sources, error } = await supabase
          .from('sources')
          .select('id, title, content, type, metadata, created_at, pdf_file_path')
          .eq('notebook_id', notebookId)
          .ilike('title', `%${documentName}%`)
          .limit(1);

        if (error) {
          console.error('[Action: getCitation] Error:', error);
          return `❌ Error retrieving citation: ${error.message}`;
        }

        if (!sources || sources.length === 0) {
          return `📄 Document "${documentName}" not found. It may not exist or you may not have access to it based on your role.`;
        }

        const source = sources[0];
        const metadata = source.metadata as any || {};

        // If page number is specified, try to extract that section
        let contentToShow = source.content || 'No content available';
        if (pageNumber && contentToShow) {
          // Simple page extraction (assumes markdown format with page markers)
          const pageMarker = `Page ${pageNumber}`;
          const pageIndex = contentToShow.indexOf(pageMarker);
          if (pageIndex !== -1) {
            contentToShow = contentToShow.substring(pageIndex, pageIndex + 1000).trim();
          }
        }

        // Limit content length for display
        const displayContent = contentToShow.length > 2000
          ? contentToShow.substring(0, 2000) + '...\n\n*(Content truncated. Full document available in source viewer.)*'
          : contentToShow;

        const response = `📋 **Citation from "${source.title}"**${pageNumber ? ` (Page ${pageNumber})` : ''}\n\n` +
          `**Type**: ${source.type}\n` +
          `**Created**: ${new Date(source.created_at).toLocaleDateString()}\n\n` +
          `**Content**:\n${displayContent}`;

        // Trigger citation click if handler is provided
        if (onCitationClick && source.id) {
          onCitationClick({
            source_id: source.id,
            document_name: source.title,
            page_number: pageNumber || 1,
          });
        }

        return response;

      } catch (error: any) {
        console.error('[Action: getCitation] Exception:', error);
        return `❌ Failed to retrieve citation: ${error.message || 'Unknown error'}`;
      }
    },
  });

  // Action 3: Check Compliance
  useCopilotAction({
    name: "checkCompliance",
    description: "Check if a specific situation or action complies with company policies.",
    parameters: [
      {
        name: "situation",
        type: "string",
        description: "Description of the situation to check (e.g., 'working remotely for 2 weeks')",
        required: true,
      },
    ],
    handler: async ({ situation }) => {
      console.log('[Action: checkCompliance]', { situation });

      try {
        // Extract keywords from the situation for searching
        const keywords = situation.toLowerCase().split(' ')
          .filter(word => word.length > 3) // Filter out short words
          .slice(0, 3) // Take first 3 meaningful words
          .join('%');

        // Search for relevant policies
        // RLS policies will automatically filter by user role
        const { data: sources, error } = await supabase
          .from('sources')
          .select('id, title, content, type, metadata')
          .eq('notebook_id', notebookId)
          .eq('processing_status', 'completed')
          .or(`title.ilike.%${keywords}%,content.ilike.%${keywords}%`)
          .limit(3);

        if (error) {
          console.error('[Action: checkCompliance] Error:', error);
          return `❌ Error checking compliance: ${error.message}`;
        }

        if (!sources || sources.length === 0) {
          return `⚠️ **Compliance Check**: No relevant policies found for "${situation}".\n\n` +
            `**Recommendation**: Upload relevant policy documents or consult with your compliance team for guidance on this situation.`;
        }

        // Format response with relevant policies
        const policyList = sources.map((source, idx) =>
          `${idx + 1}. **${source.title}** (${source.type})`
        ).join('\n');

        return `✅ **Compliance Check for**: "${situation}"\n\n` +
          `**Relevant Policies Found** (${sources.length}):\n${policyList}\n\n` +
          `**Recommendation**: Review these policies to determine if your situation complies. ` +
          `You can ask me to retrieve specific citations from any of these documents for detailed guidance.\n\n` +
          `💡 **Tip**: Use the "getCitation" action to view the full content of any policy listed above.`;

      } catch (error: any) {
        console.error('[Action: checkCompliance] Exception:', error);
        return `❌ Failed to check compliance: ${error.message || 'Unknown error'}`;
      }
    },
  });

  // Action 4: Flag Outdated Policy (Board/System Owner only)
  useCopilotAction({
    name: "flagOutdatedPolicy",
    description: "Flag a policy document as potentially outdated (older than 18 months) and recommend review.",
    parameters: [
      {
        name: "documentName",
        type: "string",
        description: "Name of the policy document",
        required: true,
      },
      {
        name: "lastUpdatedDate",
        type: "string",
        description: "Last updated date (ISO format)",
        required: false,
      },
    ],
    handler: async ({ documentName, lastUpdatedDate }) => {
      console.log('[Action: flagOutdatedPolicy]', { documentName, lastUpdatedDate });

      try {
        // Find the source by title
        const { data: sources, error } = await supabase
          .from('sources')
          .select('id, title, created_at, metadata, updated_at')
          .eq('notebook_id', notebookId)
          .ilike('title', `%${documentName}%`)
          .limit(1);

        if (error) {
          console.error('[Action: flagOutdatedPolicy] Error:', error);
          return `❌ Error flagging document: ${error.message}`;
        }

        if (!sources || sources.length === 0) {
          return `📄 Document "${documentName}" not found. Please verify the document name and try again.`;
        }

        const source = sources[0];
        const metadata = source.metadata as any || {};

        // Determine the date to check
        let checkDate: Date;
        if (lastUpdatedDate) {
          checkDate = new Date(lastUpdatedDate);
        } else if (metadata.last_updated) {
          checkDate = new Date(metadata.last_updated);
        } else {
          checkDate = new Date(source.created_at);
        }

        // Calculate age in months
        const now = new Date();
        const monthsOld = Math.floor((now.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const isOutdated = monthsOld > 18;

        // Update metadata to flag for review
        if (isOutdated) {
          const updatedMetadata = {
            ...metadata,
            flagged_for_review: true,
            flagged_date: now.toISOString(),
            flagged_reason: `Policy is ${monthsOld} months old (exceeds 18-month threshold)`,
            last_checked: checkDate.toISOString(),
          };

          const { error: updateError } = await supabase
            .from('sources')
            .update({ metadata: updatedMetadata })
            .eq('id', source.id);

          if (updateError) {
            console.error('[Action: flagOutdatedPolicy] Update error:', updateError);
            return `⚠️ Document "${source.title}" is ${monthsOld} months old, but failed to update flag: ${updateError.message}`;
          }

          return `🚩 **Policy Flagged for Review**\n\n` +
            `**Document**: "${source.title}"\n` +
            `**Age**: ${monthsOld} months (Last updated: ${checkDate.toLocaleDateString()})\n` +
            `**Status**: ⚠️ EXCEEDS 18-MONTH THRESHOLD\n\n` +
            `**Action Required**: This policy has been flagged for compliance review. ` +
            `Please schedule a review with your compliance team to ensure the policy reflects current regulations and best practices.\n\n` +
            `**Flagged**: ${now.toLocaleString()}`;

        } else {
          return `✅ **Policy Up-to-Date**\n\n` +
            `**Document**: "${source.title}"\n` +
            `**Age**: ${monthsOld} months (Last updated: ${checkDate.toLocaleDateString()})\n` +
            `**Status**: ✅ CURRENT (within 18-month threshold)\n\n` +
            `This policy is current and does not require immediate review. ` +
            `Next review recommended: ${new Date(checkDate.getTime() + 18 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
        }

      } catch (error: any) {
        console.error('[Action: flagOutdatedPolicy] Exception:', error);
        return `❌ Failed to flag document: ${error.message || 'Unknown error'}`;
      }
    },
  });

  console.log('[CopilotKit Actions] 4 actions registered successfully', {
    notebookId,
    hasOnCitationClick: !!onCitationClick,
    hasOnSaveToNote: !!onSaveToNote,
    hasOnClearChat: !!onClearChat
  });

  return {
    actionsConfigured: true,
  };
};

export default useCopilotKitActions;
