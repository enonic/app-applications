import { valuesOf, type FilterField, type FilterQuery, type FilterValue } from '@enonic/ui-kit';
import { BellDot, Download } from 'lucide-react';

import type { MarketRow } from './market-rows';

export const UPGRADE_FIELD = 'upgrade';
export const INSTALLED_FIELD = 'installed';

export const YES = 'yes';
export const NO = 'no';

type MarketFieldId = typeof UPGRADE_FIELD | typeof INSTALLED_FIELD;

const FIELD_IDS: readonly MarketFieldId[] = [UPGRADE_FIELD, INSTALLED_FIELD];

export type MarketFieldLabels = {
  upgrade: string;
  installed: string;
  yes: string;
  no: string;
};

/**
 * The rows every field's terms let through: values of one field ORed, fields ANDed. `except` leaves one
 * field out, which is how that field's own counts are taken.
 */
export function filterMarketRows(
  rows: readonly MarketRow[],
  query: FilterQuery,
  except?: MarketFieldId,
): MarketRow[] {
  const terms = FIELD_IDS.filter((field) => field !== except).map(
    (field) => [field, valuesOf(query, field)] as const,
  );

  return rows.filter((row) =>
    terms.every(([field, values]) => values.size === 0 || values.has(answer(field, row))),
  );
}

/**
 * The fields the dialog filters by, each counted over the rows the text and the *other* field leave, so
 * a count says what picking that value would leave.
 */
export function marketFields(
  searched: readonly MarketRow[],
  query: FilterQuery,
  labels: MarketFieldLabels,
): FilterField[] {
  return [
    {
      id: UPGRADE_FIELD,
      label: labels.upgrade,
      icon: BellDot,
      values: yesNo(filterMarketRows(searched, query, UPGRADE_FIELD), UPGRADE_FIELD, labels),
    },
    {
      id: INSTALLED_FIELD,
      label: labels.installed,
      icon: Download,
      values: yesNo(filterMarketRows(searched, query, INSTALLED_FIELD), INSTALLED_FIELD, labels),
    },
  ];
}

// *
// * Internal
// *

function answer(field: MarketFieldId, { status }: MarketRow): typeof YES | typeof NO {
  switch (field) {
    case UPGRADE_FIELD:
      return status === 'update' ? YES : NO;
    case INSTALLED_FIELD:
      return status === 'install' ? NO : YES;
  }
}

function yesNo(
  rows: readonly MarketRow[],
  field: MarketFieldId,
  labels: Pick<MarketFieldLabels, 'yes' | 'no'>,
): FilterValue[] {
  const yes = rows.filter((row) => answer(field, row) === YES).length;

  return [
    { id: YES, label: labels.yes, count: yes },
    { id: NO, label: labels.no, count: rows.length - yes },
  ];
}
