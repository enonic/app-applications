import { describe, expect, it, vi } from 'vitest';

import { fakeHost, pathStore, readable } from '../../../../../../test/mocks/fake-host';
import type { Notification, SectionHost } from '../sections';
import { createHostFrame } from './frame';

describe('$itemId', () => {
  // ! The case a nanostores atom would have hidden: a `Readable` never calls back on subscribe.
  it('reads the path already in place, so a deep link opens its row', () => {
    const frame = createHostFrame(fakeHost({ path: pathStore('/com.enonic.app.booster') }));

    expect(frame.$itemId.get()).toBe('com.enonic.app.booster');
  });

  it('is undefined at the section root', () => {
    const frame = createHostFrame(fakeHost({ path: pathStore('/') }));

    expect(frame.$itemId.get()).toBeUndefined();
  });

  it('follows a later navigation', () => {
    const path = pathStore('/');
    const frame = createHostFrame(fakeHost({ path }));

    path.set('/com.enonic.app.fathom');

    expect(frame.$itemId.get()).toBe('com.enonic.app.fathom');
  });

  it('ignores the search params the path carries', () => {
    const frame = createHostFrame(
      fakeHost({ path: pathStore('/com.enonic.app.booster?tab=tasks') }),
    );

    expect(frame.$itemId.get()).toBe('com.enonic.app.booster');
  });

  it('decodes a key that had to be escaped', () => {
    const frame = createHostFrame(
      fakeHost({ path: pathStore(`/${encodeURIComponent('com.enonic.app.a b')}`) }),
    );

    expect(frame.$itemId.get()).toBe('com.enonic.app.a b');
  });

  it('keeps a segment that does not decode, rather than throwing', () => {
    const path = pathStore('/100%');
    const frame = createHostFrame(fakeHost({ path }));

    expect(frame.$itemId.get()).toBe('100%');

    path.set('/foo%zz');

    expect(frame.$itemId.get()).toBe('foo%zz');
  });

  it('stops following the path once disposed', () => {
    const path = pathStore('/');
    const frame = createHostFrame(fakeHost({ path }));

    frame.dispose();
    path.set('/com.enonic.app.fathom');

    expect(frame.$itemId.get()).toBeUndefined();
  });
});

describe('$visible', () => {
  it('mirrors the host, reading the current value before following changes', () => {
    const visible = readable(false);
    const frame = createHostFrame(fakeHost({ visible }));

    expect(frame.$visible.get()).toBe(false);

    visible.set(true);

    expect(frame.$visible.get()).toBe(true);
  });

  it('stops following once disposed', () => {
    const visible = readable(true);
    const frame = createHostFrame(fakeHost({ visible }));
    frame.dispose();

    visible.set(false);

    expect(frame.$visible.get()).toBe(true);
  });
});

describe('navigation', () => {
  it('opens an item by replacing, so browsing rows leaves no history', () => {
    const navigate = vi.fn<SectionHost['navigate']>();
    const frame = createHostFrame(fakeHost({ navigate }));

    frame.openItem('com.enonic.app.booster');

    expect(navigate).toHaveBeenCalledWith('/com.enonic.app.booster', { replace: true });
  });

  it('closes back to the section root', () => {
    const navigate = vi.fn<SectionHost['navigate']>();
    const frame = createHostFrame(fakeHost({ navigate }));

    frame.closeItem();

    expect(navigate).toHaveBeenCalledWith('/', { replace: true });
  });
});

describe('notifications', () => {
  it('hands the message to the host with its level', () => {
    const notify = vi.fn<SectionHost['notify']>(() => () => undefined);
    const frame = createHostFrame(fakeHost({ notify }));

    frame.notify('error', 'It broke');
    frame.notify('success', 'It worked');

    expect(notify).toHaveBeenCalledWith({ level: 'error', message: 'It broke' });
    expect(notify).toHaveBeenCalledWith({ level: 'success', message: 'It worked' });
  });
});

// ! The contract lets the host serve every section of an app from one module instance, so two
// ! mounts must not share anything: this is the test a module-level `$host` fails.
describe('two mounts from one module instance', () => {
  it('keeps their routing and notifications apart', () => {
    const appsPath = pathStore('/com.enonic.app.booster');
    const appsNavigate = vi.fn<SectionHost['navigate']>();
    const appsNotify = vi.fn<SectionHost['notify']>(() => () => undefined);
    const marketPath = pathStore('/');
    const marketNavigate = vi.fn<SectionHost['navigate']>();

    const apps = createHostFrame(
      fakeHost({ path: appsPath, navigate: appsNavigate, notify: appsNotify }),
    );
    const market = createHostFrame(fakeHost({ path: marketPath, navigate: marketNavigate }));

    expect(apps.$itemId.get()).toBe('com.enonic.app.booster');
    expect(market.$itemId.get()).toBeUndefined();

    marketPath.set('/com.enonic.app.fathom');
    expect(apps.$itemId.get()).toBe('com.enonic.app.booster');
    expect(market.$itemId.get()).toBe('com.enonic.app.fathom');

    market.openItem('com.enonic.app.admin');
    expect(marketNavigate).toHaveBeenCalledWith('/com.enonic.app.admin', { replace: true });
    expect(appsNavigate).not.toHaveBeenCalled();

    apps.notify('error', 'Only for Apps');
    expect(appsNotify).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message: 'Only for Apps' }) as Notification,
    );
  });
});
