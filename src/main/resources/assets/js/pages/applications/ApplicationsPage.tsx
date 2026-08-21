import { useEffect, useState } from 'preact/hooks';

import type { Host } from '../../shared/sections';

export type ApplicationsPageProps = {
  host: Host;
};

export function ApplicationsPage({ host }: ApplicationsPageProps) {
  const [theme, setTheme] = useState(host.theme.get());

  useEffect(() => host.theme.subscribe(setTheme), [host]);

  return (
    <div className="flex flex-col gap-4 p-10 text-[var(--color-main)]">
      <h2 className="text-2xl font-semibold">Hello from app-applications</h2>

      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm">
        <dt className="font-semibold">baseUrl</dt>
        <dd>{host.baseUrl}</dd>
        <dt className="font-semibold">locale</dt>
        <dd>{host.locale}</dd>
        <dt className="font-semibold">theme</dt>
        <dd>{theme}</dd>
      </dl>
    </div>
  );
}
