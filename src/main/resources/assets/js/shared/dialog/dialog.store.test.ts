import { describe, expect, it, vi } from 'vitest';

import { createDialogStore } from './dialog.store';

type Payload = { mode: 'create' | 'edit' };

describe('createDialogStore', () => {
  it('starts closed', () => {
    expect(createDialogStore<Payload>().$payload.get()).toBeUndefined();
  });

  it('holds what it was opened with', () => {
    const store = createDialogStore<Payload>();

    store.open({ mode: 'edit' });

    expect(store.$payload.get()).toEqual({ mode: 'edit' });
  });

  it('replaces the payload when opened again', () => {
    const store = createDialogStore<Payload>();

    store.open({ mode: 'create' });
    store.open({ mode: 'edit' });

    expect(store.$payload.get()).toEqual({ mode: 'edit' });
  });

  it('closes back to undefined', () => {
    const store = createDialogStore<Payload>();
    store.open({ mode: 'create' });

    store.close();

    expect(store.$payload.get()).toBeUndefined();
  });

  it('notifies subscribers on open and on close', () => {
    const store = createDialogStore<Payload>();
    const seen = vi.fn();
    store.$payload.subscribe(seen);
    seen.mockClear();

    store.open({ mode: 'create' });
    store.close();

    expect(seen.mock.calls.map(([payload]) => payload)).toEqual([{ mode: 'create' }, undefined]);
  });

  it('stays quiet when closing an already closed dialog', () => {
    const store = createDialogStore<Payload>();
    const seen = vi.fn();
    store.$payload.subscribe(seen);
    seen.mockClear();

    store.close();

    expect(seen).not.toHaveBeenCalled();
  });
});
