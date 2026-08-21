import { requestGraphQlRoots, setGraphQlEndpoint, type GraphQlRoot } from '../shared/api';
import { setConfig, type Config } from '../shared/config';
import { setPhrases, type Phrases } from '../shared/i18n';
import type { Host } from '../shared/sections';
import { bootstrapFailed, bootstrapReady } from './bootstrap.store';

const CONFIG_ROOT: GraphQlRoot = {
  field: 'config',
  selection: '{ appId appVersion }',
};

// ! A `Json` scalar, so no selection — and the locale travels as a variable rather than as text, like
// ! every other value this transport sends.
const PHRASES_ROOT: GraphQlRoot = {
  field: 'phrases',
  args: '(locale: $locale)',
  variables: { locale: 'String' },
};

type BootstrapData = {
  config: Config | null;
  /** `Json` arrives unshaped, so it is checked rather than cast. */
  phrases: unknown;
};

/**
 * Everything a standalone tool would have had before its first render, and the one place that reads
 * the host object: where this section's data lives and which locale to ask in. One document, because
 * one round trip is what a screen costs on this app's single JS thread.
 *
 * ! Memoized for the life of the module, not the mount. A provider shipping several sections points
 * ! every descriptor at this one module, so `mount` runs per section while this must not: the locale
 * ! is the page's and a change to it reloads the page, and one schema answers from all of the
 * ! provider's prefixes, so every mount would ask the same question.
 */
let started: Promise<void> | undefined;

export function bootstrap(host: Host): Promise<void> {
  started ??= load(host);
  return started;
}

//
// * Internal
//

function load({ baseUrl, locale }: Host): Promise<void> {
  setGraphQlEndpoint(`${baseUrl}/graphql`);

  return (
    requestGraphQlRoots<BootstrapData>([CONFIG_ROOT, PHRASES_ROOT], 'Bootstrap', {
      values: { locale },
    })
      .match(({ data, message }) => {
        const phrases = toPhrases(data.phrases);

        if (data.config == null || phrases == null) {
          bootstrapFailed(message ?? 'The section could not read its own configuration');
          return;
        }

        setConfig(data.config);
        setPhrases(phrases, locale);
        bootstrapReady();
      }, fail)
      .catch(fail)
  );
}

function fail(cause: unknown): void {
  bootstrapFailed(cause instanceof Error ? cause.message : String(cause));
}

function toPhrases(value: unknown): Phrases | undefined {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return Object.values(value).every((phrase) => typeof phrase === 'string')
    ? (value as Phrases)
    : undefined;
}
