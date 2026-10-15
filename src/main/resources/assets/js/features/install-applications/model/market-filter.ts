import { valuesOf, type FilterField, type FilterQuery, type FilterValue } from '@enonic/ui-kit';
import { BellDot, Building2, Download, Scale } from 'lucide-react';

import type { MarketRow } from './market-rows';

export const LICENSE_FIELD = 'license';
export const VENDOR_FIELD = 'vendor';
export const UPGRADE_FIELD = 'upgrade';
export const INSTALLED_FIELD = 'installed';

export const YES = 'yes';
export const NO = 'no';

type MarketFieldId =
  | typeof LICENSE_FIELD
  | typeof VENDOR_FIELD
  | typeof UPGRADE_FIELD
  | typeof INSTALLED_FIELD;

const FIELD_IDS: readonly MarketFieldId[] = [
  LICENSE_FIELD,
  VENDOR_FIELD,
  UPGRADE_FIELD,
  INSTALLED_FIELD,
];

export type MarketFieldLabels = {
  license: string;
  vendor: string;
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
    terms.every(([field, values]) => {
      const value = valueOf(field, row);
      return values.size === 0 || (value !== undefined && values.has(value));
    }),
  );
}

/**
 * The fields the dialog filters by, each counted over the rows the text and the *other* fields leave, so
 * a count says what picking that value would leave.
 *
 * ! Which licenses and vendors exist comes from the whole catalogue, `rows`, and only the counts from
 * ! `searched`: a picked value survives a search that excludes it rather than vanishing while it goes on
 * ! narrowing.
 */
export function marketFields(
  rows: readonly MarketRow[],
  searched: readonly MarketRow[],
  query: FilterQuery,
  labels: MarketFieldLabels,
): FilterField[] {
  const facet = (field: MarketFieldId): MarketRow[] => filterMarketRows(searched, query, field);

  return [
    {
      id: LICENSE_FIELD,
      label: labels.license,
      icon: Scale,
      values: namedValues(rows, facet(LICENSE_FIELD), LICENSE_FIELD, ({ license }) => license),
    },
    {
      id: VENDOR_FIELD,
      label: labels.vendor,
      icon: Building2,
      values: namedValues(rows, facet(VENDOR_FIELD), VENDOR_FIELD, ({ vendor }) => vendor),
    },
    {
      id: UPGRADE_FIELD,
      label: labels.upgrade,
      icon: BellDot,
      values: yesNo(facet(UPGRADE_FIELD), UPGRADE_FIELD, labels),
    },
    {
      id: INSTALLED_FIELD,
      label: labels.installed,
      icon: Download,
      values: yesNo(facet(INSTALLED_FIELD), INSTALLED_FIELD, labels),
    },
  ];
}

// *
// * Internal
// *

/**
 * The value a row holds for a field. A license or a vendor is matched by its name lowercased, so two
 * spellings of one name are one value; a row without one matches none.
 */
function valueOf(field: MarketFieldId, { status, license, vendor }: MarketRow): string | undefined {
  switch (field) {
    case LICENSE_FIELD:
      return license?.toLowerCase();
    case VENDOR_FIELD:
      return vendor?.toLowerCase();
    case UPGRADE_FIELD:
      return status === 'update' ? YES : NO;
    case INSTALLED_FIELD:
      return status === 'install' ? NO : YES;
  }
}

/** One value per name in `rows`, labelled by the first spelling seen, counted over `matched`. */
function namedValues(
  rows: readonly MarketRow[],
  matched: readonly MarketRow[],
  field: MarketFieldId,
  nameOf: (row: MarketRow) => string | undefined,
): FilterValue[] {
  const labels = new Map<string, string>();
  for (const row of rows) {
    const name = nameOf(row);
    if (name !== undefined && !labels.has(name.toLowerCase())) {
      labels.set(name.toLowerCase(), name);
    }
  }

  const counts = new Map<string, number>();
  for (const row of matched) {
    const id = valueOf(field, row);
    if (id !== undefined) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return [...labels]
    .map(([id, label]) => ({ id, label, count: counts.get(id) ?? 0 }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

function yesNo(
  rows: readonly MarketRow[],
  field: MarketFieldId,
  labels: Pick<MarketFieldLabels, 'yes' | 'no'>,
): FilterValue[] {
  const yes = rows.filter((row) => valueOf(field, row) === YES).length;

  return [
    { id: YES, label: labels.yes, count: yes },
    { id: NO, label: labels.no, count: rows.length - yes },
  ];
}
