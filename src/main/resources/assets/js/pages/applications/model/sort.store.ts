import { atom } from 'nanostores';

import {
  DEFAULT_SORT_DIRECTION,
  type SortDirection,
} from '../../../widgets/browse-list/browse-sort';

export const $applicationsSort = atom<SortDirection>(DEFAULT_SORT_DIRECTION);

export function setApplicationsSort(direction: SortDirection): void {
  $applicationsSort.set(direction);
}
