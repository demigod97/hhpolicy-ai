/**
 * GraphQL Resolvers for CopilotKit Runtime API
 *
 * Implements the actual logic for handling GraphQL queries.
 */

import type { Agent, Action, AvailableAgentsResponse, GraphQLResponse } from './graphql-schema.ts';
import { getActionsForRole, type CopilotAction } from './actions.ts';

/**
 * Get available agents based on user role
 *
 * Board and System Owners get all agents
 * Executives get policy search and compliance agents
 * Administrators get basic policy search
 */
export function getAvailableAgents(userRole: string): Agent[] {
  const allAgents: Agent[] = [
    {
      id: 'policy-search',
      name: 'Policy Search',
      description: 'Search across policy documents with natural language queries. Returns relevant policies with citations.',
      __typename: 'Agent'
    },
    {
      id: 'citation-lookup',
      name: 'Citation Lookup',
      description: 'Retrieve full text and context for specific policy citations.',
      __typename: 'Agent'
    },
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      description: 'Check if specific situations or actions comply with company policies.',
      __typename: 'Agent'
    },
    {
      id: 'policy-summary',
      name: 'Policy Summary',
      description: 'Generate concise summaries of policy documents.',
      __typename: 'Agent'
    },
    {
      id: 'policy-comparison',
      name: 'Policy Comparison',
      description: 'Compare different policy versions or sections to identify changes.',
      __typename: 'Agent'
    },
    {
      id: 'policy-flag',
      name: 'Outdated Policy Detector',
      description: 'Identify policies that may be outdated (older than 18 months) and recommend review.',
      __typename: 'Agent'
    }
  ];

  // Role-based filtering
  switch (userRole) {
    case 'system_owner':
    case 'board':
      // Full access to all agents
      return allAgents;

    case 'company_operator':
    case 'executive':
      // Executives get most agents except system-level ones
      return allAgents.filter(agent =>
        !['policy-flag'].includes(agent.id)
      );

    case 'administrator':
    default:
      // Administrators get basic agents
      return allAgents.filter(agent =>
        ['policy-search', 'citation-lookup', 'policy-summary'].includes(agent.id)
      );
  }
}

/**
 * Convert CopilotAction to GraphQL Action format
 */
function convertToGraphQLAction(action: CopilotAction): Action {
  return {
    name: action.name,
    description: action.description,
    parameters: action.parameters.map(p => ({
      name: p.name,
      type: p.type,
      description: p.description,
      required: p.required
    })),
    __typename: 'Action'
  };
}

/**
 * Resolve availableAgents GraphQL query
 */
export function resolveAvailableAgents(userRole: string): GraphQLResponse {
  try {
    // Get role-based actions
    const copilotActions = getActionsForRole(userRole);
    const actions = copilotActions.map(convertToGraphQLAction);

    // Create a single main agent with all role-based actions embedded
    const mainAgent: Agent = {
      id: 'policy-ai-assistant',
      name: 'PolicyAI Assistant',
      description: `AI-powered policy assistant with role-based access (${userRole}). Can search policies, check compliance, and provide policy guidance.`,
      actions, // Embed actions within the agent
      __typename: 'Agent'
    };

    const response: AvailableAgentsResponse = {
      agents: [mainAgent],
      __typename: 'AvailableAgentsResponse'
    };

    console.log('[GraphQL Resolver] Returning agent with embedded actions:', {
      agentId: mainAgent.id,
      actionCount: actions.length,
      userRole
    });

    return {
      data: {
        availableAgents: response
      }
    };
  } catch (error) {
    return {
      errors: [{
        message: error instanceof Error ? error.message : 'Failed to fetch available agents',
        path: ['availableAgents']
      }]
    };
  }
}

/**
 * Main GraphQL resolver router
 */
export function resolveGraphQLQuery(
  operationName: string,
  variables: Record<string, any> | undefined,
  userRole: string
): GraphQLResponse {
  console.log('Resolving GraphQL query:', operationName);

  switch (operationName) {
    case 'availableAgents':
      return resolveAvailableAgents(userRole);

    default:
      return {
        errors: [{
          message: `Unknown operation: ${operationName}`,
          path: [operationName]
        }]
      };
  }
}
