import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configQueryFields } from './config.fields';

beforeEach(() => {
  vi.stubGlobal('app', { name: 'com.enonic.xp.app.applications', version: '8.1.0' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('config', () => {
  it("answers this application's own key and version, not the shell's", () => {
    expect(configQueryFields.config.resolve?.({} as never)).toEqual({
      appId: 'com.enonic.xp.app.applications',
      appVersion: '8.1.0',
    });
  });
});
