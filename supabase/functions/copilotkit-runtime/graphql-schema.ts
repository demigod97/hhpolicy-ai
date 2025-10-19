/**
 * GraphQL Schema for CopilotKit Runtime API
 *
 * This schema defines the GraphQL types and queries that CopilotKit client expects.
 * Based on CopilotKit v1.0+ GraphQL protocol.
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  actions?: Action[];  // Actions embedded within each agent
  __typename: string;
}

export interface ActionParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Action {
  name: string;
  description: string;
  parameters: ActionParameter[];
  __typename: string;
}

export interface AvailableAgentsResponse {
  agents: Agent[];
  __typename: string;
}

export interface GraphQLRequest {
  operationName: string;
  query: string;
  variables?: Record<string, any>;
}

export interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Schema definition in SDL (Schema Definition Language)
 */
export const GRAPHQL_SCHEMA = `
  type Agent {
    id: ID!
    name: String!
    description: String!
    actions: [Action!]
  }

  type ActionParameter {
    name: String!
    type: String!
    description: String!
    required: Boolean!
  }

  type Action {
    name: String!
    description: String!
    parameters: [ActionParameter!]!
  }

  type AvailableAgentsResponse {
    agents: [Agent!]!
  }

  type Query {
    availableAgents: AvailableAgentsResponse!
  }

  schema {
    query: Query
  }
`;

/**
 * Check if a request is a GraphQL query
 */
export function isGraphQLRequest(body: any): body is GraphQLRequest {
  return (
    body &&
    typeof body === 'object' &&
    ('operationName' in body || 'query' in body)
  );
}

/**
 * Parse GraphQL query to determine operation
 */
export function parseGraphQLOperation(request: GraphQLRequest): string | null {
  if (request.operationName) {
    return request.operationName;
  }

  // Try to extract operation name from query string
  const match = request.query.match(/query\s+(\w+)/);
  return match ? match[1] : null;
}
