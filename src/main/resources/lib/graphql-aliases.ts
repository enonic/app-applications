/**
 * How many aliases a query document uses, wherever they sit: the operation, a nested selection, a
 * fragment.
 *
 * lib-graphql executes a document but exposes no way to parse one, and graphql-java — which it bundles
 * — is only reachable from Java. Hence the bean. A document that does not parse counts none; executing
 * it is what reports the syntax error.
 */

type CountAliasesHandler = {
  setQuery(value: string): void;
  execute(): number;
};

export function countAliases(query: string): number {
  const bean = __.newBean<CountAliasesHandler>(
    'com.enonic.xp.app.applications.lib.graphql.CountAliasesHandler',
  );
  bean.setQuery(query);
  return bean.execute();
}
