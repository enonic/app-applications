import { ApplicationsPage } from '../pages/applications/ApplicationsPage';
import type { Host } from '../shared/sections';

export type AppProps = {
  host: Host;
};

// TODO: [extensions] This is where the section's own config and phrases are loaded from its GraphQL
// endpoint, once that lands.
export function App({ host }: AppProps) {
  return <ApplicationsPage host={host} />;
}
