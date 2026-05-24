import {markStarting, markStopping} from '../../entities/application/store/operation-status';
import {startApplications as startApi, stopApplications as stopApi} from './api/changeApplicationState';

/**
 * Marks the given keys as `starting` and fires the start request. Used by
 * toolbars and context menus so they don't need to coordinate the in-flight
 * marker with the API call themselves.
 */
export function startSelectedApplications(keys: string[]): void {
    if (keys.length === 0) return;
    markStarting(keys);
    void startApi(keys);
}

/** Marks the given keys as `stopping` and fires the stop request. */
export function stopSelectedApplications(keys: string[]): void {
    if (keys.length === 0) return;
    markStopping(keys);
    void stopApi(keys);
}

export {startApi as startApplications, stopApi as stopApplications};
