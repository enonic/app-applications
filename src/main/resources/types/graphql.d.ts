// Minimal types for lib-graphql (no @enonic-types package exists, at any version — the jar is
// pinned at 3.0.0). Resolved as the module for `/lib/graphql` via tsconfig `paths`.
// Declares only what the schema actually uses; extend it as new builders are needed.

// GraphQL types are opaque Java objects (graphql.Scalars, GraphQLObjectType, ...), so they are
// branded rather than described. Nothing in JS may read into them.
declare const GRAPHQL_TYPE: unique symbol;

export type GraphQLType = { readonly [GRAPHQL_TYPE]: 'GraphQLType' };

export type GraphQLSchema = { readonly [GRAPHQL_TYPE]: 'GraphQLSchema' };

export const GraphQLBoolean: GraphQLType;
export const GraphQLFloat: GraphQLType;
export const GraphQLID: GraphQLType;
export const GraphQLInt: GraphQLType;
export const GraphQLString: GraphQLType;

export const DateTime: GraphQLType;
export const Json: GraphQLType;

/**
 * The three keys lib-graphql's DataFetchingEnvironmentMapper serializes — nothing else is
 * reachable from a resolver.
 */
export type ResolverEnv<Source = unknown, Args = Record<string, unknown>> = {
  source: Source;
  args: Args;
  context: unknown;
};

export type GraphQLField<Source = unknown, Args = Record<string, unknown>> = {
  type: GraphQLType;
  args?: Record<string, GraphQLType>;
  description?: string;
  resolve?: (env: ResolverEnv<Source, Args>) => unknown;
};

export type GraphQLFields = Record<string, GraphQLField<never, never>>;

export type CreateObjectTypeParams = {
  name: string;
  fields: GraphQLFields;
  interfaces?: GraphQLType[];
  description?: string;
};

/** An input object carries no resolvers, so its fields are types and descriptions only. */
export type CreateInputObjectTypeParams = {
  name: string;
  fields: Record<string, { type: GraphQLType; description?: string }>;
  description?: string;
};

export type CreateEnumTypeParams = {
  name: string;
  values: string[];
  description?: string;
};

export type CreateSchemaParams = {
  query: GraphQLType;
  mutation?: GraphQLType;
};

export type SchemaGenerator = {
  createObjectType(params: CreateObjectTypeParams): GraphQLType;
  createInputObjectType(params: CreateInputObjectTypeParams): GraphQLType;
  createEnumType(params: CreateEnumTypeParams): GraphQLType;
  createSchema(params: CreateSchemaParams): GraphQLSchema;
};

export type ExecutionError = {
  errorType?: string;
  message: string;
  locations?: { line: number; column: number }[];
  validationErrorType?: string;
  exception?: { name: string; message?: string };
};

/** Errors arrive here, not as throws — `execute` resolves with both keys optional. */
export type ExecutionResult<Data = Record<string, unknown>> = {
  data?: Data;
  errors?: ExecutionError[];
};

export function newSchemaGenerator(): SchemaGenerator;

export function list(type: GraphQLType): GraphQLType;

export function nonNull(type: GraphQLType): GraphQLType;

export function reference(typeKey: string): GraphQLType;

export function execute<Data = Record<string, unknown>>(
  schema: GraphQLSchema,
  query: string,
  variables?: Record<string, unknown>,
  context?: unknown,
): ExecutionResult<Data>;
