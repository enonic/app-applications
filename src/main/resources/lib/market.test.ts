import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_MARKET_API_URL, marketApiUrl, marketOrigin } from './market';

afterEach(() => {
  vi.unstubAllGlobals();
});

function withConfig(config: Record<string, string>): void {
  vi.stubGlobal('app', { name: 'com.enonic.xp.app.applications', version: '1.0.0', config });
}

describe('marketApiUrl', () => {
  it('reads the url an install configured', () => {
    withConfig({ marketApiUrl: 'https://market.example.com/api/graphql' });

    expect(marketApiUrl()).toBe('https://market.example.com/api/graphql');
  });

  it('falls back to Enonic Market where nothing is configured', () => {
    withConfig({});

    expect(marketApiUrl()).toBe(DEFAULT_MARKET_API_URL);
  });

  it('treats an empty setting as unset rather than as a url', () => {
    withConfig({ marketApiUrl: '' });

    expect(marketApiUrl()).toBe(DEFAULT_MARKET_API_URL);
  });

  it('drops the whitespace a cfg value keeps around the url', () => {
    withConfig({ marketApiUrl: ' https://market.example.com/api/graphql ' });

    expect(marketApiUrl()).toBe('https://market.example.com/api/graphql');
  });

  it('treats a setting of nothing but whitespace as unset', () => {
    withConfig({ marketApiUrl: '   ' });

    expect(marketApiUrl()).toBe(DEFAULT_MARKET_API_URL);
  });
});

describe('marketOrigin', () => {
  it('keeps scheme and host, dropping the api path', () => {
    withConfig({ marketApiUrl: 'https://market.enonic.com/api/graphql' });

    expect(marketOrigin()).toBe('https://market.enonic.com');
  });

  it('keeps a port', () => {
    withConfig({ marketApiUrl: 'http://localhost:8080/site/market/api' });

    expect(marketOrigin()).toBe('http://localhost:8080');
  });

  it('reads nothing from a url with no host to read', () => {
    withConfig({ marketApiUrl: '/api/graphql' });

    expect(marketOrigin()).toBe('');
  });
});
