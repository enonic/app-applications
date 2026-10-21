import { valuesOf, type FilterField, type FilterQuery, type FilterValue } from '@enonic/ui-kit';
import { BellDot, Power } from 'lucide-react';

import type { Application, ApplicationState } from '../../../entities/application';
import type { MarketApplicationsState } from '../../../entities/market';
import { matchesEveryWord } from '../../../shared/filter';

export const STATE_FIELD = 'state';
export const UPGRADE_FIELD = 'upgrade';

export const YES = 'yes';
export const NO = 'no';

type ApplicationFieldId = typeof STATE_FIELD | typeof UPGRADE_FIELD;

const FIELD_IDS: readonly ApplicationFieldId[] = [STATE_FIELD, UPGRADE_FIELD];

const STATES: readonly ApplicationState[] = ['STARTED', 'STOPPED'];

export type ApplicationFieldLabels = {
  state: string;
  started: string;
  stopped: string;
  upgrade: string;
  yes: string;
  no: string;
  marketFailed: string;
};

/**
 * ? The applications XP ships are noise, so the list leaves them out unless the header's toggle asks
 * ? for them — as the app this replaces did, off by default.
 */
export function withoutSystem(applications: readonly Application[]): Application[] {
  return applications.filter(({ system }) => !system);
}

/**
 * Display name, description and key, word by word, over the loaded applications. ? The key is searched
 * where other sections leave it out: it does not echo the display name, and admins know apps by it.
 */
export function searchApplications(
  applications: readonly Application[],
  query: string,
): Application[] {
  return applications.filter(({ displayName, description, key }) =>
    matchesEveryWord(query, [displayName, description, key]),
  );
}

/**
 * The applications every field's terms let through: values of one field ORed, fields ANDed. `except`
 * leaves one field out, which is how that field's own counts are taken.
 *
 * `upgradable` holds the keys the market has a newer version of.
 */
export function filterApplications(
  applications: readonly Application[],
  query: FilterQuery,
  upgradable: Pick<ReadonlySet<string>, 'has'>,
  except?: ApplicationFieldId,
): Application[] {
  const terms = FIELD_IDS.filter((field) => field !== except).map(
    (field) => [field, valuesOf(query, field)] as const,
  );

  return applications.filter((application) =>
    terms.every(([field, values]) => passes(field, application, values, upgradable)),
  );
}

/**
 * The fields this section filters by, each counted over the rows the text and the *other* fields leave,
 * so a count says what picking that value would leave.
 *
 * ! `market` is absent in managed mode, which never loads it: no Upgrade field rather than one that
 * ! says no to every application.
 */
export function applicationFields(
  searched: readonly Application[],
  query: FilterQuery,
  upgradable: Pick<ReadonlySet<string>, 'has'>,
  market: Pick<MarketApplicationsState, 'status'> | undefined,
  labels: ApplicationFieldLabels,
): FilterField[] {
  const facet = (field: ApplicationFieldId): Application[] =>
    filterApplications(searched, query, upgradable, field);

  const fields: FilterField[] = [
    {
      id: STATE_FIELD,
      label: labels.state,
      icon: Power,
      values: stateValues(facet(STATE_FIELD), labels),
    },
  ];

  if (market !== undefined) {
    fields.push({
      id: UPGRADE_FIELD,
      label: labels.upgrade,
      icon: BellDot,
      values: yesNo(facet(UPGRADE_FIELD), ({ key }) => upgradable.has(key), labels),
      loading: market.status === 'loading',
      notice: market.status === 'error' ? labels.marketFailed : undefined,
    });
  }

  return fields;
}

// *
// * Internal
// *

function passes(
  field: ApplicationFieldId,
  application: Application,
  values: ReadonlySet<string>,
  upgradable: Pick<ReadonlySet<string>, 'has'>,
): boolean {
  switch (field) {
    case STATE_FIELD:
      return values.size === 0 || values.has(application.state);
    case UPGRADE_FIELD:
      return values.size === 0 || values.has(upgradable.has(application.key) ? YES : NO);
  }
}

function yesNo(
  applications: readonly Application[],
  isYes: (application: Application) => boolean,
  labels: Pick<ApplicationFieldLabels, 'yes' | 'no'>,
): FilterValue[] {
  const yes = applications.filter(isYes).length;

  return [
    { id: YES, label: labels.yes, count: yes },
    { id: NO, label: labels.no, count: applications.length - yes },
  ];
}

function stateValues(
  applications: readonly Application[],
  labels: Pick<ApplicationFieldLabels, 'started' | 'stopped'>,
): FilterValue[] {
  const label: Record<ApplicationState, string> = {
    STARTED: labels.started,
    STOPPED: labels.stopped,
  };

  return STATES.map((state) => ({
    id: state,
    label: label[state],
    count: applications.filter((application) => application.state === state).length,
  }));
}
