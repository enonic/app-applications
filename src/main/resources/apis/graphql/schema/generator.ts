import { newSchemaGenerator, type SchemaGenerator } from '/lib/graphql';

// ? One generator for the whole schema, in its own module so every type file shares it: object
// ? types built by two different generators cannot be composed into one schema.
export const generator: SchemaGenerator = newSchemaGenerator();
