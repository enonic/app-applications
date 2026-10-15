/**
 * Whether a row's fields satisfy a free-text query: every word of the query starts a word in at least
 * one of the fields, regardless of case and diacritics. The words need not share a field or an order.
 *
 * ! This is how the server reads the same query for Users and Service Accounts — `findUsers` is sent
 * ! `fulltext(…) OR ngram(…)` with `AND`, and its analyzers fold diacritics and match a word from its
 * ! start — so a text tag narrows every section alike. `simple_query_string` operators such as `-word`
 * ! mean something only on the server; here they are plain text.
 */
export function matchesEveryWord(query: string, fields: readonly (string | undefined)[]): boolean {
  const words = wordsOf(query);
  if (words.length === 0) {
    return true;
  }

  const haystack = fields.flatMap((field) => (field === undefined ? [] : wordsOf(field)));

  return words.every((word) => haystack.some((candidate) => candidate.startsWith(word)));
}

function wordsOf(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);
}
