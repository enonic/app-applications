import { map } from 'nanostores';

export type ApplicationUpload = {
  /** What the operator picked, and all there is to call it by until core has read the jar. */
  fileName: string;
  /** How much of it has gone out, 0–100. Undefined for a queued upload and until the first event. */
  percent?: number;
};

/** The jars on their way to the server, by upload id. */
export const $applicationUploads = map<Record<string, ApplicationUpload>>({});

let lastId = 0;

/**
 * Registers a whole pick at once, so the queue shows rather than one row at a time, and answers the
 * ids. One write, and the ids are not integer-like, so insertion order holds.
 */
export function queueUploads(fileNames: readonly string[]): string[] {
  const queued: Record<string, ApplicationUpload> = {};
  const ids = fileNames.map((fileName) => {
    lastId += 1;
    const id = `upload-${lastId}`;
    queued[id] = { fileName };
    return id;
  });

  $applicationUploads.set({ ...$applicationUploads.get(), ...queued });

  return ids;
}

/** Records progress, ignoring an upload that has already finished or failed. */
export function receiveUploadProgress(id: string, percent: number): void {
  const upload = $applicationUploads.get()[id];
  if (upload == null) {
    return;
  }

  $applicationUploads.setKey(id, { ...upload, percent });
}

export function endUpload(id: string): void {
  const { [id]: _ended, ...rest } = $applicationUploads.get();
  $applicationUploads.set(rest);
}
