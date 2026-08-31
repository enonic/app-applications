import { errAsync, type ResultAsync } from 'neverthrow';

import { AppError, requestJson } from '../../../shared/api';
import { serverAppUrl } from '../../../shared/config';

// The wire shape of XP core's `server:app` start/stop/uninstall endpoints (ApplicationApiHandler):
// one POST per action for any number of keys, answered with a per-key outcome.
type LifecycleResultDto = {
  results: { id: string; success: boolean }[];
};

export type LifecycleOutcome = {
  failedKeys: string[];
};

/** Starts the given applications through XP's `server:app` api. */
export function postStartApplications(
  keys: readonly string[],
): ResultAsync<LifecycleOutcome, AppError> {
  return postLifecycleAction(serverAppUrl('start'), keys);
}

/** Stops the given applications through XP's `server:app` api. */
export function postStopApplications(
  keys: readonly string[],
): ResultAsync<LifecycleOutcome, AppError> {
  return postLifecycleAction(serverAppUrl('stop'), keys);
}

/** Uninstalls the given applications through XP's `server:app` api. */
export function postUninstallApplications(
  keys: readonly string[],
): ResultAsync<LifecycleOutcome, AppError> {
  return postLifecycleAction(serverAppUrl('uninstall'), keys);
}

// *
// * Internal
// *

function postLifecycleAction(
  url: string | undefined,
  keys: readonly string[],
): ResultAsync<LifecycleOutcome, AppError> {
  // ! Unreachable once the bootstrap has filled the config store — nothing renders before it — so
  // ! this is calling too early rather than a state the section has to show.
  if (url == null) {
    return errAsync(new AppError('The section has not read its configuration'));
  }

  return requestJson<LifecycleResultDto>(url, { method: 'POST', body: { key: keys } }).map(
    ({ results }) => ({
      failedKeys: results.filter(({ success }) => !success).map(({ id }) => id),
    }),
  );
}
