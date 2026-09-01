import { describe, expect, it } from 'vitest';

import type { Host } from '../sections';
import { getHost, setHost } from './host';

function hostDouble(baseUrl: string): Host {
  return { baseUrl } as Host;
}

describe('setHost', () => {
  it('publishes the host for code no component can reach', () => {
    const host = hostDouble('/admin/tool/applications');

    const release = setHost(host);

    expect(getHost()).toBe(host);
    release();
  });

  it('leaves nothing behind once the mount is gone', () => {
    const release = setHost(hostDouble('/admin/tool/applications'));

    release();

    expect(getHost()).toBeUndefined();
  });

  it('keeps the newer host when the mount it replaced is disposed after it', () => {
    const outgoing = hostDouble('/admin/tool/old');
    const incoming = hostDouble('/admin/tool/new');

    const releaseOutgoing = setHost(outgoing);
    const releaseIncoming = setHost(incoming);
    releaseOutgoing();

    expect(getHost()).toBe(incoming);
    releaseIncoming();
  });
});
