import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configQueryFields } from './config.fields';

function withConfig(config: Record<string, string> = {}): void {
  vi.stubGlobal('app', { name: 'com.enonic.xp.app.applications', version: '8.1.0', config });
}

beforeEach(() => {
  withConfig();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('config', () => {
  it("answers this application's own key and version, not the shell's", () => {
    expect(configQueryFields.config.resolve?.({} as never)).toEqual({
      appId: 'com.enonic.xp.app.applications',
      appVersion: '8.1.0',
      managedMode: false,
    });
  });

  it('reports managed mode where the install configured it', () => {
    withConfig({ managedMode: 'true' });

    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({ managedMode: true });
  });

  it('reads managed mode through the whitespace a cfg value keeps', () => {
    withConfig({ managedMode: ' true ' });

    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({ managedMode: true });
  });

  it('takes only the exact string true as managed mode', () => {
    for (const value of ['True', 'TRUE', '1', 'yes', '']) {
      withConfig({ managedMode: value });

      expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({ managedMode: false });
    }
  });
});
