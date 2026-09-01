import { describe, expect, it, vi } from 'vitest';

import { setHost } from '../host';
import type { Host, Notification } from '../sections';
import { notifyError, notifySuccess } from './notifications';

function hostDouble(): { host: Host; raised: Notification[]; dismiss: () => void } {
  const raised: Notification[] = [];
  const dismiss = vi.fn();

  const host = {
    notify: (n: Notification) => {
      raised.push(n);
      return dismiss;
    },
    // ! `unknown` first: a double this small overlaps the contract too little for a direct cast.
  } as unknown as Host;

  return { host, raised, dismiss };
}

describe('notify', () => {
  it('raises the tone the caller named, with the text already localized', () => {
    const { host, raised } = hostDouble();
    const release = setHost(host);

    notifySuccess('Booster started');

    expect(raised).toEqual([{ level: 'success', message: 'Booster started' }]);
    release();
  });

  it('passes the options the contract takes through untouched', () => {
    const { host, raised } = hostDouble();
    const release = setHost(host);

    notifyError('Install failed', { autoClose: false });

    expect(raised[0]).toEqual({ level: 'error', message: 'Install failed', autoClose: false });
    release();
  });

  it('hands back the host dismiss, so a section can take down what it raised', () => {
    const { host, dismiss } = hostDouble();
    const release = setHost(host);

    notifySuccess('Booster stopped')();

    expect(dismiss).toHaveBeenCalledOnce();
    release();
  });

  // A command can outlive its mount: reporting the outcome must not become the failure.
  it('is a no-op with no mount running', () => {
    expect(() => notifyError('Nobody is listening')()).not.toThrow();
  });
});
