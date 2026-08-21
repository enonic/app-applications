import { GraphQLString, Json, type GraphQLFields } from '/lib/graphql';
import { getAllPhrases, resolveLocales } from '/lib/i18n';

import { SectionConfigType } from './section.types';

export const sectionQueryFields: GraphQLFields = {
  config: {
    type: SectionConfigType,
    description: "The section's own configuration, read in this application's context.",
    resolve: () => ({ appId: app.name, appVersion: app.version }),
  },
  phrases: {
    type: Json,
    args: { locale: GraphQLString },
    description: "Every phrase in this application's bundle, for the locale the shell resolved.",
    resolve: (env: { args: { locale?: string } }) =>
      getAllPhrases(resolveLocales(env.args.locale == null ? undefined : [env.args.locale])),
  },
};
