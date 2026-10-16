import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { HostFrame } from '../shared/host';
import { $bootstrap } from './bootstrap.store';
import { startSectionEvents, stopSectionEvents } from './events';

/**
 * Connects to the hub and subscribes the section's topics once its bootstrap is ready. Unmount stops
 * the subscriptions; the hub connection stays open.
 */
export function useSectionEvents(frame: HostFrame): void {
  const { status } = useStore($bootstrap, { keys: ['status'] });

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    startSectionEvents(frame);
    return stopSectionEvents;
  }, [status, frame]);
}
