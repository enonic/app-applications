import { Skeleton } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useEffect, useState } from 'preact/hooks';

import { ApplicationsPage } from '../pages/applications/ApplicationsPage';
import type { Host } from '../shared/sections';
import { $bootstrap } from './bootstrap.store';

export type AppProps = {
  host: Host;
};

export function App({ host }: AppProps) {
  const { status, error } = useStore($bootstrap);
  const [theme, setTheme] = useState(host.theme.get());

  useEffect(() => host.theme.subscribe(setTheme), [host]);

  // ! The theme class belongs on this wrapper, not on the document: `@enonic/ui` resolves its dark
  // ! tokens from `.dark, :host(.dark)` and its `dark:` variants from `.dark, .dark *`, and neither
  // ! selector crosses a shadow boundary — the host's `<html class="dark">` is in another tree. This
  // ! is what `AppRoot` will own once npm-enonic-ui#533 lands.
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {status === 'loading' && <BootstrapSkeleton />}
      {status === 'error' && <BootstrapFailed error={error} />}
      {status === 'ready' && <ApplicationsPage host={host} theme={theme} />}
    </div>
  );
}

//
// * Internal
//

function BootstrapSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-10" aria-busy="true">
      <Skeleton shape="rectangle" size="lg" className="w-64" />

      <Skeleton.Group className="flex flex-col gap-2">
        <Skeleton shape="rectangle" size="sm" />
        <Skeleton shape="rectangle" size="md" className="w-96" />
        <Skeleton shape="rectangle" size="md" className="w-80" />
      </Skeleton.Group>
    </div>
  );
}

function BootstrapFailed({ error }: { error?: string }) {
  return (
    <div className="text-main flex flex-col gap-2 p-10" role="alert">
      <h2 className="text-lg font-semibold">This section could not be loaded</h2>
      {error != null && <p className="text-subtle text-sm">{error}</p>}
    </div>
  );
}
