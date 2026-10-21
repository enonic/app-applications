import { apiUrl } from '/lib/xp/portal';
import { isEnabled } from '/lib/xp/vhost';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configQueryFields } from './config.fields';

beforeEach(() => {
  vi.stubGlobal('app', { name: 'com.enonic.xp.app.applications', version: '8.1.0', config: {} });
  vi.mocked(apiUrl).mockImplementation(({ api }) => `/_/${api}`);
  vi.mocked(isEnabled).mockReturnValue(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('config', () => {
  it("answers this application's own key and version, not the shell's", () => {
    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({
      appId: 'com.enonic.xp.app.applications',
      appVersion: '8.1.0',
    });
  });

  it('hands the section the events hub url of the request it came in on', () => {
    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({
      eventsUrl: '/_/admin:events',
    });
    expect(vi.mocked(apiUrl)).toHaveBeenCalledWith({ api: 'admin:events' });
  });

  it("hands the section the application api's url, built in the host page's context", () => {
    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({
      serverAppUrl: '/_/server:app',
    });
    expect(vi.mocked(apiUrl)).toHaveBeenCalledWith({ api: 'server:app' });
  });

  it('reports virtual host mapping as the installation has it', () => {
    vi.mocked(isEnabled).mockReturnValue(true);

    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({ vhostsEnabled: true });
  });

  it('reports no virtual host mapping where the installation maps none', () => {
    expect(configQueryFields.config.resolve?.({} as never)).toMatchObject({ vhostsEnabled: false });
  });
});
