import { vi } from 'vitest';

import type {
  CreateEnumTypeParams,
  CreateInputObjectTypeParams,
  CreateObjectTypeParams,
  CreateSchemaParams,
  ExecutionResult,
  GraphQLSchema,
  GraphQLType,
  SchemaGenerator,
} from '../../main/resources/types/graphql';

// Real GraphQL types are opaque Java objects, so the doubles stand in as tagged plain objects:
// a test can assert on the shape a builder was handed without a running graphql-java.
function stub<T>(tag: string, value: object): T {
  return { __stub: tag, ...value } as unknown as T;
}

export const GraphQLBoolean = stub<GraphQLType>('Boolean', {});
export const GraphQLFloat = stub<GraphQLType>('Float', {});
export const GraphQLID = stub<GraphQLType>('ID', {});
export const GraphQLInt = stub<GraphQLType>('Int', {});
export const GraphQLString = stub<GraphQLType>('String', {});

export const DateTime = stub<GraphQLType>('DateTime', {});
export const Json = stub<GraphQLType>('Json', {});

// ! Type names are global to a schema, and graphql-java rejects a duplicate only when the schema is
// ! assembled — which happens at module load, so one clash 500s every query, not just the new one.
// ! The doubles enforce it instead, and any test importing the schema is the check.
const declared = new Set<string>();

function declare(name: string): void {
  if (declared.has(name)) {
    throw new Error(`GraphQL type '${name}' is declared twice — names are global to the schema`);
  }
  declared.add(name);
}

export const createObjectType = vi.fn((params: CreateObjectTypeParams) => {
  declare(params.name);
  return stub<GraphQLType>('ObjectType', { name: params.name, fields: params.fields });
});

export const createInputObjectType = vi.fn((params: CreateInputObjectTypeParams) => {
  declare(params.name);
  return stub<GraphQLType>('InputObjectType', { name: params.name, fields: params.fields });
});

export const createEnumType = vi.fn((params: CreateEnumTypeParams) => {
  declare(params.name);
  return stub<GraphQLType>('EnumType', { name: params.name, values: params.values });
});

export const createSchema = vi.fn((params: CreateSchemaParams) =>
  stub<GraphQLSchema>('Schema', { query: params.query, mutation: params.mutation }),
);

export const newSchemaGenerator = vi.fn((): SchemaGenerator => ({
  createObjectType,
  createInputObjectType,
  createEnumType,
  createSchema,
}));

export const list = vi.fn((type: GraphQLType) => stub<GraphQLType>('List', { of: type }));

export const nonNull = vi.fn((type: GraphQLType) => stub<GraphQLType>('NonNull', { of: type }));

export const reference = vi.fn((typeKey: string) => stub<GraphQLType>('Reference', { typeKey }));

export const execute = vi.fn<() => ExecutionResult>();
