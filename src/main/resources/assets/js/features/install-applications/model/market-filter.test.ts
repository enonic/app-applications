import { EMPTY_FILTER, fieldTerm, type FilterQuery } from '@enonic/ui-kit';
import { describe, expect, it } from 'vitest';

import {
  filterMarketRows,
  INSTALLED_FIELD,
  LICENSE_FIELD,
  marketFields,
  NO,
  UPGRADE_FIELD,
  VENDOR_FIELD,
  YES,
} from './market-filter';
import type { MarketRow, MarketRowStatus } from './market-rows';

function row(
  key: string,
  status: MarketRowStatus,
  license = 'Apache-2.0',
  vendor = 'Enonic',
): MarketRow {
  return {
    key,
    displayName: key,
    license,
    vendor,
    availableVersion: '2.0.0',
    installedVersion: status === 'install' ? undefined : '1.0.0',
    downloadUrl: `https://repo.enonic.com/${key}.jar`,
    status,
  };
}

const fresh = row('fresh', 'install', 'Enonic License');
const updatable = row('updatable', 'update', 'Apache-2.0', 'Bouvet');
const current = row('current', 'installed', 'GPL-2.0');
const ahead = row('ahead', 'ahead');
const rows = [fresh, updatable, current, ahead];

const LABELS = {
  license: 'License',
  vendor: 'Vendor',
  upgrade: 'Upgrade available',
  installed: 'Installed',
  yes: 'Yes',
  no: 'No',
};

function counts(query: FilterQuery, searched: readonly MarketRow[] = rows) {
  return Object.fromEntries(
    marketFields(rows, searched, query, LABELS).map(({ id, values }) => [
      id,
      Object.fromEntries(values.map((value) => [value.id, value.count])),
    ]),
  );
}

describe('filterMarketRows', () => {
  it('narrows nothing without a term', () => {
    expect(filterMarketRows(rows, EMPTY_FILTER)).toEqual(rows);
  });

  it('narrows to the rows with an update, or without one', () => {
    expect(filterMarketRows(rows, [fieldTerm(UPGRADE_FIELD, YES)])).toEqual([updatable]);
    expect(filterMarketRows(rows, [fieldTerm(UPGRADE_FIELD, NO)])).toEqual([fresh, current, ahead]);
  });

  it('counts every installed version as installed, whatever the market offers', () => {
    expect(filterMarketRows(rows, [fieldTerm(INSTALLED_FIELD, YES)])).toEqual([
      updatable,
      current,
      ahead,
    ]);
    expect(filterMarketRows(rows, [fieldTerm(INSTALLED_FIELD, NO)])).toEqual([fresh]);
  });

  it('narrows by license and vendor, matched without regard to case', () => {
    expect(filterMarketRows(rows, [fieldTerm(LICENSE_FIELD, 'apache-2.0')])).toEqual([
      updatable,
      ahead,
    ]);
    expect(filterMarketRows(rows, [fieldTerm(VENDOR_FIELD, 'bouvet')])).toEqual([updatable]);
  });

  it('matches no license or vendor on a row without one', () => {
    const anonymous = { ...fresh, license: undefined, vendor: undefined };

    expect(filterMarketRows([anonymous], [fieldTerm(LICENSE_FIELD, 'enonic license')])).toEqual([]);
    expect(filterMarketRows([anonymous], [fieldTerm(VENDOR_FIELD, 'enonic')])).toEqual([]);
    expect(filterMarketRows([anonymous], EMPTY_FILTER)).toEqual([anonymous]);
  });

  it('ORs the values of a field and ANDs the fields', () => {
    expect(
      filterMarketRows(rows, [
        fieldTerm(LICENSE_FIELD, 'gpl-2.0'),
        fieldTerm(LICENSE_FIELD, 'enonic license'),
      ]),
    ).toEqual([fresh, current]);
    expect(
      filterMarketRows(rows, [fieldTerm(INSTALLED_FIELD, YES), fieldTerm(VENDOR_FIELD, 'enonic')]),
    ).toEqual([current, ahead]);
  });

  it('leaves out the field it is told to', () => {
    expect(filterMarketRows(rows, [fieldTerm(UPGRADE_FIELD, YES)], UPGRADE_FIELD)).toEqual(rows);
  });
});

describe('marketFields', () => {
  it('offers License, Vendor, Upgrade available and Installed, in that order', () => {
    expect(marketFields(rows, rows, EMPTY_FILTER, LABELS).map(({ id }) => id)).toEqual([
      LICENSE_FIELD,
      VENDOR_FIELD,
      UPGRADE_FIELD,
      INSTALLED_FIELD,
    ]);
  });

  it('counts each value over the rows it was given', () => {
    expect(counts(EMPTY_FILTER)).toEqual({
      [LICENSE_FIELD]: { 'apache-2.0': 2, 'enonic license': 1, 'gpl-2.0': 1 },
      [VENDOR_FIELD]: { bouvet: 1, enonic: 3 },
      [UPGRADE_FIELD]: { [YES]: 1, [NO]: 3 },
      [INSTALLED_FIELD]: { [YES]: 3, [NO]: 1 },
    });
  });

  it('counts each field over what the other fields leave, never over its own terms', () => {
    expect(counts([fieldTerm(INSTALLED_FIELD, NO)])).toEqual({
      [LICENSE_FIELD]: { 'apache-2.0': 0, 'enonic license': 1, 'gpl-2.0': 0 },
      [VENDOR_FIELD]: { bouvet: 0, enonic: 1 },
      [UPGRADE_FIELD]: { [YES]: 0, [NO]: 1 },
      [INSTALLED_FIELD]: { [YES]: 3, [NO]: 1 },
    });
  });

  it('offers every license and vendor in the catalogue, whatever the text leaves', () => {
    expect(counts(EMPTY_FILTER, [fresh])[VENDOR_FIELD]).toEqual({ bouvet: 0, enonic: 1 });
  });

  it('groups two spellings of one name as one value, labelled by the first seen', () => {
    const lower = row('lower', 'install', 'enonic license');
    const [license] = marketFields([fresh, lower], [fresh, lower], EMPTY_FILTER, LABELS);

    expect(license?.values).toEqual([{ id: 'enonic license', label: 'Enonic License', count: 2 }]);
  });

  it('sorts the names by label', () => {
    const [license] = marketFields(rows, rows, EMPTY_FILTER, LABELS);

    expect(license?.values.map(({ label }) => label)).toEqual([
      'Apache-2.0',
      'Enonic License',
      'GPL-2.0',
    ]);
  });
});
