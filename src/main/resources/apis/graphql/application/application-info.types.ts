import {
  GraphQLBoolean,
  GraphQLString,
  list,
  nonNull,
  type GraphQLFields,
  type GraphQLType,
} from '/lib/graphql';

import { generator } from '../schema/generator';
import {
  listAdminExtensionItems,
  listAdminToolItems,
  listApiItems,
  deploymentUrlOf,
  idProviderSourceOf,
  listComponentItems,
  listMacroItems,
  listSchemaItems,
  listTaskItems,
  listUsedByItems,
  type ApplicationInfoSource,
  type IdProviderSource,
} from './application-info.source';

// Every list an application contributes shares these four. The types below spread them rather than
// extend them — lib-graphql's builder has no inheritance, and a shared type could not carry the one
// extra field each admin-extension list needs.
const itemFields: GraphQLFields = {
  key: {
    type: nonNull(GraphQLString),
    description: 'Qualified name, `<application>:<name>`.',
  },
  name: {
    type: nonNull(GraphQLString),
    description: 'Name without the application prefix.',
  },
  displayName: {
    type: nonNull(GraphQLString),
    description: 'Descriptor title, falling back to the name.',
  },
  description: {
    type: GraphQLString,
  },
};

const ApplicationItemType: GraphQLType = generator.createObjectType({
  name: 'ApplicationItem',
  description: 'One schema, component, macro or task descriptor an application contributes.',
  fields: itemFields,
});

const AdminToolItemType: GraphQLType = generator.createObjectType({
  name: 'AdminToolItem',
  fields: {
    ...itemFields,
    url: {
      type: nonNull(GraphQLString),
      description: 'Where the tool is mounted, `/admin/<application>/<name>`.',
    },
  },
});

const AdminExtensionItemType: GraphQLType = generator.createObjectType({
  name: 'AdminExtensionItem',
  fields: {
    ...itemFields,
    interfaces: {
      type: nonNull(list(nonNull(GraphQLString))),
      description: 'The admin interfaces the extension plugs into.',
    },
  },
});

const ApiItemType: GraphQLType = generator.createObjectType({
  name: 'ApiItem',
  fields: {
    ...itemFields,
    documentationUrl: {
      type: GraphQLString,
    },
  },
});

const IdProviderModeType: GraphQLType = generator.createEnumType({
  name: 'IdProviderMode',
  description: 'How an id provider application authenticates.',
  values: ['LOCAL', 'EXTERNAL', 'MIXED'],
});

const IdProviderItemType: GraphQLType = generator.createObjectType({
  name: 'IdProviderItem',
  description: 'An id provider instance, as configured under ID Providers.',
  fields: {
    key: { type: nonNull(GraphQLString) },
    displayName: { type: nonNull(GraphQLString) },
  },
});

// ? `ApplicationIdProvider`, not `IdProvider`: this is the id-provider facet of an application, not
// ? a provider instance — that name belongs to the `idProviders` root field. Type names are global
// ? to the schema, and lib-graphql rejects a duplicate only when the schema is assembled.
const ApplicationIdProviderType: GraphQLType = generator.createObjectType({
  name: 'ApplicationIdProvider',
  description: 'Present only on an application that declares an id provider descriptor.',
  fields: {
    mode: {
      type: IdProviderModeType,
      description: 'Nullable even here: a descriptor may omit `mode:`.',
    },
    hasConfig: {
      type: nonNull(GraphQLBoolean),
      description: 'Whether the descriptor declares a config form. The form itself is not carried.',
    },
    usedBy: {
      type: nonNull(list(nonNull(IdProviderItemType))),
      description: 'Id provider instances bound to this application. Empty until one is created.',
      resolve: (env: { source: IdProviderSource }) => listUsedByItems(env.source.application),
    },
  },
});

const applicationItems = nonNull(list(nonNull(ApplicationItemType)));

export const ApplicationInfoType: GraphQLType = generator.createObjectType({
  name: 'ApplicationInfo',
  description: 'Detailed information about what an installed application provides.',
  // ! One jar-resource walk per field, so every one of them stays lazy: selecting `parts` must not
  // ! pay for the other six. Never resolve these in the parent, however tempting a single call is.
  fields: {
    contentTypes: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) =>
        listSchemaItems(env.source.key, 'CONTENT_TYPE'),
    },
    mixins: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) => listSchemaItems(env.source.key, 'MIXIN'),
    },
    formFragments: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) =>
        listSchemaItems(env.source.key, 'FORM_FRAGMENT'),
    },
    pages: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) =>
        listComponentItems(env.source.key, 'PAGE'),
    },
    parts: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) =>
        listComponentItems(env.source.key, 'PART'),
    },
    layouts: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) =>
        listComponentItems(env.source.key, 'LAYOUT'),
    },
    macros: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) => listMacroItems(env.source.key),
    },
    tasks: {
      type: applicationItems,
      resolve: (env: { source: ApplicationInfoSource }) => listTaskItems(env.source.key),
    },
    adminTools: {
      type: nonNull(list(nonNull(AdminToolItemType))),
      resolve: (env: { source: ApplicationInfoSource }) => listAdminToolItems(env.source.key),
    },
    adminExtensions: {
      type: nonNull(list(nonNull(AdminExtensionItemType))),
      description: 'What 7.x called widgets.',
      resolve: (env: { source: ApplicationInfoSource }) => listAdminExtensionItems(env.source.key),
    },
    apis: {
      type: nonNull(list(nonNull(ApiItemType))),
      resolve: (env: { source: ApplicationInfoSource }) => listApiItems(env.source.key),
    },
    deploymentUrl: {
      type: GraphQLString,
      resolve: (env: { source: ApplicationInfoSource }) => deploymentUrlOf(env.source.key),
    },
    idProvider: {
      type: ApplicationIdProviderType,
      resolve: (env: { source: ApplicationInfoSource }) => idProviderSourceOf(env.source.key),
    },
  },
});
