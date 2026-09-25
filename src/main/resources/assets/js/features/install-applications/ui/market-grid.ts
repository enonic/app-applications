/**
 * The one grid the rows and the skeleton share. ! Widths are fixed, not content-sized: `auto` columns are
 * measured per grid, so every row would find its own and the versions and buttons would not line up.
 * The version track holds `6.1.0-SNAPSHOT`; a qualifier has no length limit, so anything longer clips.
 */
export const MARKET_GRID_CLASS =
  'grid grid-cols-[1.5rem_minmax(0,1fr)_5.5rem] items-center gap-x-2.5 gap-y-0.5 lg:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem] lg:gap-2.5';

/**
 * The list the rows and the skeleton stack in: it owns the spacing between rows and around them. ! The inset
 * is not decoration — `Dialog.Body` scrolls with no padding of its own, and would clip the focus ring of the
 * first and last rows' buttons.
 */
export const MARKET_LIST_CLASS = 'flex flex-col gap-4 py-2.5';

// ! At least a button tall, so a row with no button and no description keeps the rhythm of the rest.
export const MARKET_ROW_CLASS = 'min-h-9';

export const MARKET_APP_CELL_CLASS = 'col-span-2 row-start-1 min-w-0 lg:col-span-1';

export const MARKET_VERSION_CELL_CLASS =
  'text-subtle col-span-2 col-start-2 row-start-2 -ml-1 min-w-0 truncate p-1 text-xs lg:col-span-1 lg:row-start-1 lg:ml-0 lg:justify-self-end lg:text-sm';

export const MARKET_ACTION_CELL_CLASS = 'col-start-3 row-start-1 flex justify-center ps-2';
