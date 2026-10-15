import { useStore } from '@nanostores/preact';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import type { HostFrame } from './frame';

/**
 * ? A context, alone in this app of stores: every store is one per module, and the frame is one per
 * ? mount — several sections can mount from one module instance, and each tree must reach its own.
 */
const HostFrameContext = createContext<HostFrame | undefined>(undefined);

export const HostFrameProvider = HostFrameContext.Provider;

export function useHostFrame(): HostFrame {
  const frame = useContext(HostFrameContext);

  if (frame == null) {
    throw new Error('useHostFrame was called outside a mounted section');
  }

  return frame;
}

/** The selected row of this mount's section; `undefined` at the section root. */
export function useItemId(): string | undefined {
  return useStore(useHostFrame().$itemId);
}
