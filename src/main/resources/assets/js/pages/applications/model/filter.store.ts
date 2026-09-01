import { createSelectionStore } from '../../../shared/selection';

/**
 * Whether the one filter entry is ticked. A single id over the same store the other sections use,
 * rather than a boolean atom: nothing ticked is what `clear()` restores, and here nothing ticked is
 * the default the section wants — system applications hidden.
 */
export const applicationsFilter = createSelectionStore<string>();
