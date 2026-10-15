import { beforeEach, describe, expect, it } from 'vitest';

import {
  $marketInstalls,
  beginInstall,
  endInstall,
  isInstalling,
  receiveInstallProgress,
} from './install.store';

const BOOSTER = 'com.enonic.app.booster';
const BOOSTER_JAR = 'https://repo.enonic.com/booster-3.0.1.jar';

beforeEach(() => {
  $marketInstalls.set({});
});

describe('beginInstall', () => {
  it('records the row as installing with no progress yet', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);

    expect($marketInstalls.get()).toEqual({ [BOOSTER]: { url: BOOSTER_JAR } });
    expect(isInstalling(BOOSTER)).toBe(true);
  });

  it('keeps a second row installing beside the first', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    beginInstall('com.enonic.app.fathom', 'https://repo.enonic.com/fathom-1.0.0.jar');

    expect(Object.keys($marketInstalls.get())).toEqual([BOOSTER, 'com.enonic.app.fathom']);
  });
});

describe('receiveInstallProgress', () => {
  it('records progress against the row installing that url', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);

    receiveInstallProgress(BOOSTER_JAR, 42);

    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR, percent: 42 });
  });

  // Core reports every download it is fetching, including one this app never started — a deploy from
  // another admin's browser, or a jar core is pulling for its own reasons.
  it('ignores progress for a url no row is installing', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);

    receiveInstallProgress('https://repo.enonic.com/something-else.jar', 99);

    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR });
  });

  it('ignores progress once the install has ended', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    endInstall(BOOSTER);

    receiveInstallProgress(BOOSTER_JAR, 42);

    expect($marketInstalls.get()).toEqual({});
  });
});

describe('endInstall', () => {
  it('drops the row and leaves the others', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    beginInstall('com.enonic.app.fathom', 'https://repo.enonic.com/fathom-1.0.0.jar');

    endInstall(BOOSTER);

    expect(isInstalling(BOOSTER)).toBe(false);
    expect(isInstalling('com.enonic.app.fathom')).toBe(true);
  });
});
