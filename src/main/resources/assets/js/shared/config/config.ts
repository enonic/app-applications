/**
 * What a standalone tool would have read from a JSON island in its own page. This section has no page
 * of its own, so the values arrive from the `config` root field on its own schema — see
 * `../app-settings/docs/extensions/docs.md` § Data.
 */
export type Config = {
  appId: string;
  appVersion: string;
  eventsUrl: string;
  managedMode: boolean;
  serverAppUrl: string;
};
