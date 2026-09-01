import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { installApplication } from '../../../entities/application';
import { marketLoadSettled } from '../../../entities/market';
import { AppError } from '../../../shared/api';
import { marketInstallIntent, runMarketInstall } from './install-market-application';
import { $marketInstalls, beginInstall } from './install.store';
import type { MarketRow } from './market-rows';

vi.mock('../../../entities/application', () => ({
  installApplication: vi.fn(),
}));

vi.mock('../../../entities/market', () => ({
  marketLoadSettled: vi.fn(),
}));

function row(overrides: Partial<MarketRow> = {}): MarketRow {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    availableVersion: '3.0.1',
    downloadUrl: 'https://repo.enonic.com/booster-3.0.1.jar',
    sha512: 'abc',
    status: 'install',
    ...overrides,
  };
}

const installed = {
  key: 'com.enonic.app.booster',
  version: '3.0.1',
  displayName: 'Booster',
};

beforeEach(() => {
  $marketInstalls.set({});
  vi.mocked(installApplication).mockReset();
  vi.mocked(installApplication).mockResolvedValue(ok(installed));
  vi.mocked(marketLoadSettled).mockReset();
  vi.mocked(marketLoadSettled).mockResolvedValue(undefined);
});

describe('marketInstallIntent', () => {
  it('installs an application this instance does not have', () => {
    expect(marketInstallIntent(row())).toBe('install');
  });

  it('installs a minor update without asking', () => {
    expect(marketInstallIntent(row({ status: 'update', installedVersion: '3.0.0' }))).toBe(
      'install',
    );
  });

  it('asks first when the update crosses a major version', () => {
    expect(marketInstallIntent(row({ status: 'update', installedVersion: '2.1.0' }))).toBe(
      'confirm',
    );
  });

  it('ignores an application already on the latest version', () => {
    expect(marketInstallIntent(row({ status: 'installed', installedVersion: '3.0.1' }))).toBe(
      'ignore',
    );
  });

  // Two presses on the same row would otherwise install it twice, and the second would fight the
  // first for the row's progress.
  it('ignores a row that is already installing', () => {
    const target = row();
    beginInstall(target.key, target.downloadUrl);

    expect(marketInstallIntent(target)).toBe('ignore');
  });
});

describe('runMarketInstall', () => {
  it('marks the row installing, installs it, and waits for the catalogue', async () => {
    await runMarketInstall(row());

    expect(installApplication).toHaveBeenCalledWith({
      displayName: 'Booster',
      url: 'https://repo.enonic.com/booster-3.0.1.jar',
      sha512: 'abc',
      updating: false,
    });
    expect(marketLoadSettled).toHaveBeenCalledOnce();
    expect($marketInstalls.get()).toEqual({});
  });

  // The row has to still be installing while the reload INSTALLED started is on its way, or a second
  // press installs the same application again off the catalogue it is about to replace.
  it('holds the row until the catalogue has caught up', async () => {
    const target = row();
    let settle = (): void => {};
    vi.mocked(marketLoadSettled).mockReturnValue(
      new Promise<void>((resolve) => {
        settle = resolve;
      }),
    );

    const install = runMarketInstall(target);
    await vi.waitFor(() => expect($marketInstalls.get()[target.key]).toBeDefined());

    settle();
    await install;

    expect($marketInstalls.get()).toEqual({});
  });

  it('tells the command it is an update when the row is one', async () => {
    await runMarketInstall(row({ status: 'update', installedVersion: '2.1.0' }));

    expect(installApplication).toHaveBeenCalledWith(expect.objectContaining({ updating: true }));
  });

  // Nothing changed server-side, so there is no reload to wait for; the failure has already been
  // notified by the command.
  it('releases the row at once after a failed install', async () => {
    vi.mocked(installApplication).mockResolvedValue(err(new AppError('Conflict')));

    await runMarketInstall(row());

    expect(marketLoadSettled).not.toHaveBeenCalled();
    expect($marketInstalls.get()).toEqual({});
  });
});
