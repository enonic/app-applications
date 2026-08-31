/**
 * The one grid the header, the rows and the skeleton share. ! Widths are fixed, not content-sized: `auto`
 * columns are measured per grid, so every row would find its own and the header would stand over none.
 * The version tracks hold `6.1.0-SNAPSHOT`; a qualifier has no length limit, so anything longer clips.
 */
export const MARKET_GRID_CLASS =
  'grid grid-cols-[1.5rem_minmax(0,1fr)_6rem] items-center gap-x-2.5 gap-y-0.5 px-2.5 lg:grid-cols-[minmax(0,1fr)_8rem_7.5rem_7rem] lg:gap-2.5';

export const MARKET_APP_CELL_CLASS = 'col-span-2 row-start-1 min-w-0 lg:col-span-1';

export const MARKET_VERSIONS_CLASS =
  '-ml-1 col-span-2 col-start-2 row-start-2 flex min-w-0 items-center gap-0.5 lg:contents';

export const MARKET_VERSION_CELL_CLASS =
  'text-subtle truncate p-1 text-xs lg:justify-self-end lg:text-sm';

export const MARKET_ACTION_CELL_CLASS =
  'col-start-3 row-start-1 flex justify-center lg:col-start-4';
