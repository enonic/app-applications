import { useStore } from '@nanostores/preact';

import { $config } from '../../shared/config';
import { useI18n } from '../../shared/i18n';
import type { Host } from '../../shared/sections';

export type ApplicationsPageProps = {
  host: Host;
  /** Subscribed once in `App`, which needs it for the root's theme class anyway. */
  theme: 'light' | 'dark';
};

export function ApplicationsPage({ host, theme }: ApplicationsPageProps) {
  const config = useStore($config);

  const heading = useI18n('applications.heading');

  return (
    <div className="text-main flex flex-col gap-6 p-10">
      <h2 className="text-2xl font-semibold">{heading}</h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-subtle text-sm font-semibold">From the shell</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm">
          <dt className="font-semibold">baseUrl</dt>
          <dd>{host.baseUrl}</dd>
          <dt className="font-semibold">locale</dt>
          <dd>{host.locale}</dd>
          <dt className="font-semibold">theme</dt>
          <dd>{theme}</dd>
        </dl>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-subtle text-sm font-semibold">From its own endpoint</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm">
          <dt className="font-semibold">appId</dt>
          <dd>{config?.appId}</dd>
          <dt className="font-semibold">appVersion</dt>
          <dd>{config?.appVersion}</dd>
          <dt className="font-semibold">heading phrase</dt>
          <dd>{heading}</dd>
        </dl>
      </section>
    </div>
  );
}
