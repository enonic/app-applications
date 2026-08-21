import { GraphQLString, Json, type GraphQLFields } from '/lib/graphql';
import { getAllPhrases, resolveLocales } from '/lib/i18n';

export const phrasesQueryFields: GraphQLFields = {
  phrases: {
    type: Json,
    args: { locale: GraphQLString },
    // ! The locale is asked for, never inferred. The section is localized with the same locale the
    // ! shell resolved for its own chrome, which is not necessarily what `Accept-Language` carries.
    description: "Every phrase in this application's bundle, for the locale the shell resolved.",
    resolve: (env: { args: { locale?: string } }) =>
      getAllPhrases(resolveLocales(env.args.locale == null ? undefined : [env.args.locale])),
  },
};
