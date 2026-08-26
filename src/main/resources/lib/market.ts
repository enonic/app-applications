/**
 * Where Enonic Market is, and nothing else.
 */

export const DEFAULT_MARKET_API_URL = 'https://market.enonic.com/api/graphql';

export function marketApiUrl(): string {
  const configured = app.config['marketApiUrl']?.trim();
  return configured != null && configured.length > 0 ? configured : DEFAULT_MARKET_API_URL;
}

/**
 * Scheme and host of the market, for the urls it answers with relative — `pageUrl` is
 * `/vendors/enonic/guillotine`, which resolves against the admin tool and 404s unless made absolute.
 */
export function marketOrigin(): string {
  const match = /^(https?:\/\/[^/]+)/.exec(marketApiUrl());
  return match?.[1] ?? '';
}
