/**
 * CopilotKit Actions for PolicyAi
 *
 * Defines available actions that show in the CopilotKit Inspector UI
 */

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.39.3';

export interface CopilotAction {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    description: string;
    required: boolean;
  }>;
  handler: (params: any, context: ActionContext) => Promise<string>;
}

export interface ActionContext {
  supabase: SupabaseClient;
  userId: string;
  userRole: string;
  notebookId?: string;
}

/**
 * Search policy documents action
 */
export const searchPoliciesAction: CopilotAction = {
  name: 'searchPolicies',
  description: 'Search across policy documents using natural language. Returns relevant policies with citations based on user role.',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'The search query (e.g., "remote work policy", "vacation days")',
      required: true
    },
    {
      name: 'limit',
      type: 'number',
      description: 'Maximum number of results to return (default: 5)',
      required: false
    }
  ],
  handler: async (params, context) => {
    const { query, limit = 5 } = params;

    console.log('[Action: searchPolicies]', { query, limit, userRole: context.userRole });

    try {
      // Query documents based on role
      const { data: sources, error } = await context.supabase
        .from('sources')
        .select('id, title, type, metadata')
        .eq('notebook_id', context.notebookId)
        .limit(limit);

      if (error) {
        return `Error searching policies: ${error.message}`;
      }

      if (!sources || sources.length === 0) {
        return 'No policy documents found. Please upload some documents first.';
      }

      const results = sources.map((source, idx) =>
        `${idx + 1}. ${source.title} (${source.type})`
      ).join('\n');

      return `Found ${sources.length} policy documents:\n${results}`;

    } catch (error) {
      console.error('[Action: searchPolicies] Error:', error);
      return 'Failed to search policies. Please try again.';
    }
  }
};

/**
 * Get citation details action
 */
export const getCitationAction: CopilotAction = {
  name: 'getCitation',
  description: 'Retrieve full text and context for a specific policy citation.',
  parameters: [
    {
      name: 'documentName',
      type: 'string',
      description: 'Name of the policy document',
      required: true
    },
    {
      name: 'pageNumber',
      type: 'number',
      description: 'Page number in the document',
      required: false
    }
  ],
  handler: async (params, context) => {
    const { documentName, pageNumber } = params;

    console.log('[Action: getCitation]', { documentName, pageNumber });

    return `Citation from "${documentName}"${pageNumber ? ` (page ${pageNumber})` : ''} - Full text would be retrieved from the document store.`;
  }
};

/**
 * Check policy compliance action
 */
export const checkComplianceAction: CopilotAction = {
  name: 'checkCompliance',
  description: 'Check if a specific situation or action complies with company policies.',
  parameters: [
    {
      name: 'situation',
      type: 'string',
      description: 'Description of the situation to check (e.g., "working remotely for 2 weeks")',
      required: true
    }
  ],
  handler: async (params, context) => {
    const { situation } = params;

    console.log('[Action: checkCompliance]', { situation, userRole: context.userRole });

    // This would search policies and check compliance
    return `Checking compliance for: "${situation}". This would search relevant policies and provide a compliance assessment.`;
  }
};

/**
 * Flag outdated policy action
 */
export const flagOutdatedPolicyAction: CopilotAction = {
  name: 'flagOutdatedPolicy',
  description: 'Flag a policy document as potentially outdated (older than 18 months) and recommend review.',
  parameters: [
    {
      name: 'documentName',
      type: 'string',
      description: 'Name of the policy document',
      required: true
    },
    {
      name: 'lastUpdatedDate',
      type: 'string',
      description: 'Last updated date (ISO format)',
      required: false
    }
  ],
  handler: async (params, context) => {
    const { documentName, lastUpdatedDate } = params;

    console.log('[Action: flagOutdatedPolicy]', { documentName, lastUpdatedDate });

    if (lastUpdatedDate) {
      const date = new Date(lastUpdatedDate);
      const monthsOld = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsOld > 18) {
        return `⚠️ **Policy Review Recommended**: "${documentName}" was last updated ${Math.floor(monthsOld)} months ago. Policies should be reviewed every 18 months. Consider scheduling a review with your compliance team.`;
      } else {
        return `"${documentName}" was last updated ${Math.floor(monthsOld)} months ago and is current.`;
      }
    }

    return `⚠️ **Policy Review Recommended**: "${documentName}" may be outdated. Consider scheduling a review with your compliance team.`;
  }
};

/**
 * Get all actions available for a role
 */
export function getActionsForRole(userRole: string): CopilotAction[] {
  const baseActions = [
    searchPoliciesAction,
    getCitationAction,
    checkComplianceAction,
  ];

  // Board and system owners get additional actions
  if (userRole === 'board' || userRole === 'system_owner') {
    return [
      ...baseActions,
      flagOutdatedPolicyAction,
    ];
  }

  return baseActions;
}

/**
 * Execute an action by name
 */
export async function executeAction(
  actionName: string,
  parameters: any,
  context: ActionContext
): Promise<string> {
  const actions = getActionsForRole(context.userRole);
  const action = actions.find(a => a.name === actionName);

  if (!action) {
    throw new Error(`Unknown action: ${actionName}`);
  }

  console.log(`[Action Executor] Running action: ${actionName}`, parameters);

  try {
    const result = await action.handler(parameters, context);
    return result;
  } catch (error) {
    console.error(`[Action Executor] Error executing ${actionName}:`, error);
    throw error;
  }
}
