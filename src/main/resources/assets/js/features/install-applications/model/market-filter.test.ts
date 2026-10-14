import { EMPTY_FILTER, fieldTerm, type FilterQuery } from '@enonic/ui-kit';
import { describe, expect, it } from 'vitest';

import {
  filterMarketRows,
  INSTALLED_FIELD,
  marketFields,
  NO,
  UPGRADE_FIELD,
  YES,
} from './market-filter';
import type { MarketRow, MarketRowStatus } from './market-rows';

function row(key: string, status: MarketRowStatus): MarketRow {
  return {
    key,
    displayName: key,
    availableVersion: '2.0.0',
    installedVersion: status === 'install' ? undefined : '1.0.0',
    downloadUrl: `https://repo.enonic.com/${key}.jar`,
    status,
  };
}

const fresh = row('fresh', 'install');
const updatable = row('updatable', 'update');
const current = row('current', 'installed');
const ahead = row('ahead', 'ahead');
const rows = [fresh, updatable, current, ahead];

const LABELS = { upgrade: 'Upgrade available', installed: 'Installed', yes: 'Yes', no: 'No' };

function counts(query: FilterQuery) {
  return Object.fromEntries(
    marketFields(rows, query, LABELS).map(({ id, values }) => [
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

  it('ORs the values of a field and ANDs the fields', () => {
    expect(
      filterMarketRows(rows, [fieldTerm(INSTALLED_FIELD, YES), fieldTerm(INSTALLED_FIELD, NO)]),
    ).toEqual(rows);
    expect(
      filterMarketRows(rows, [fieldTerm(INSTALLED_FIELD, YES), fieldTerm(UPGRADE_FIELD, NO)]),
    ).toEqual([current, ahead]);
  });

  it('leaves out the field it is told to', () => {
    expect(filterMarketRows(rows, [fieldTerm(UPGRADE_FIELD, YES)], UPGRADE_FIELD)).toEqual(rows);
  });
});

describe('marketFields', () => {
  it('counts each value over the rows it was given', () => {
    expect(counts(EMPTY_FILTER)).toEqual({
      [UPGRADE_FIELD]: { [YES]: 1, [NO]: 3 },
      [INSTALLED_FIELD]: { [YES]: 3, [NO]: 1 },
    });
  });

  it('counts each field over what the other field leaves, never over its own terms', () => {
    expect(counts([fieldTerm(INSTALLED_FIELD, NO)])).toEqual({
      [UPGRADE_FIELD]: { [YES]: 0, [NO]: 1 },
      [INSTALLED_FIELD]: { [YES]: 3, [NO]: 1 },
    });
  });
});
