import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { $bootstrap } from './bootstrap.store';
import { startSectionEvents, stopSectionEvents } from './events';

/** Connects the section to the hub once its bootstrap is ready; disconnects with the app. */
export function useSectionEvents(): void {
  const { status } = useStore($bootstrap, { keys: ['status'] });

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    startSectionEvents();
    return stopSectionEvents;
  }, [status]);
}
