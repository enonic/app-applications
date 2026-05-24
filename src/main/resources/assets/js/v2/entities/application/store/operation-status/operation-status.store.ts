import {computed, map} from 'nanostores';
import type {OperationStatusState} from './operation-status.types';

function initialState(): OperationStatusState {
    return {
        installing: {},
        starting: new Set(),
        stopping: new Set(),
    };
}

/**
 * Cross-feature, per-application action status. Tracks installs, starts, and
 * stops in flight; rendered by toolbars and rows to drive disabled / spinner
 * states. Lives under the `application` entity because the lifecycle it
 * represents is the application's, not any one feature's.
 *
 * Exported as `$appActions` for historical continuity with the previous
 * `app-actions.store.ts` consumers.
 */
export const $appActions = map<OperationStatusState>(initialState());

export {initialState as initialOperationStatusState};

/** True when at least one install is in progress. Drives the global install indicator. */
export const $isInstalling = computed($appActions, (a) => Object.keys(a.installing).length > 0);
