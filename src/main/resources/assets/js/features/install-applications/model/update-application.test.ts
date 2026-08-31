import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MarketApplication } from '../../../entities/market';
import { runMarketInstall } from './install-market-application';
import { startMarketUpdate } from './update-application';
import { $updateConfirmTarget, closeUpdateConfirm } from './update-dialog.store';

vi.mock('./install-market-application', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./install-market-application')>()),
  runMarketInstall: vi.fn(async () => undefined),
}));

function marketApplication(overrides: Partial<MarketApplication> = {}): MarketApplication {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    latest: { version: '2.1.0', downloadUrl: 'https://repo.enonic.com/booster.jar' },
    installedVersion: '2.0.0',
    updateAvailable: true,
    installedAhead: false,
    ...overrides,
  };
}

beforeEach(() => {
  closeUpdateConfirm();
  vi.mocked(runMarketInstall).mockClear();
});

describe('startMarketUpdate', () => {
  it('installs an update inside the same major version without asking', () => {
    startMarketUpdate(marketApplication());

    expect(runMarketInstall).toHaveBeenCalledOnce();
    expect($updateConfirmTarget.get()).toBeUndefined();
  });

  // The panel skips the install dialog, but not the question that dialog asks.
  it('asks first where the update crosses a major version', () => {
    startMarketUpdate(
      marketApplication({
        installedVersion: '2.0.0',
        latest: { version: '3.0.0', downloadUrl: 'https://repo.enonic.com/booster.jar' },
      }),
    );

    expect(runMarketInstall).not.toHaveBeenCalled();
    expect($updateConfirmTarget.get()?.availableVersion).toBe('3.0.0');
  });

  it('does nothing for an application already on the latest version', () => {
    startMarketUpdate(marketApplication({ updateAvailable: false }));

    expect(runMarketInstall).not.toHaveBeenCalled();
    expect($updateConfirmTarget.get()).toBeUndefined();
  });
});
