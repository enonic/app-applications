import {$upload, initialUploadState} from './upload.store';
import type {UploadProgress} from './upload.types';

/** Inserts or replaces an upload entry by id. */
export function setUpload(progress: UploadProgress): void {
    const {uploads} = $upload.get();
    $upload.setKey('uploads', {...uploads, [progress.id]: progress});
}

/** Patches an existing upload entry. No-op if the id is unknown. */
export function patchUpload(id: string, patch: Partial<Omit<UploadProgress, 'id'>>): void {
    const {uploads} = $upload.get();
    const current = uploads[id];
    if (!current) return;
    $upload.setKey('uploads', {...uploads, [id]: {...current, ...patch}});
}

/** Removes an upload entry. */
export function removeUpload(id: string): void {
    const {uploads} = $upload.get();
    if (!(id in uploads)) return;
    const next = {...uploads};
    delete next[id];
    $upload.setKey('uploads', next);
}

/** Drops every upload that has finished (status `done` or `error`). */
export function clearFinishedUploads(): void {
    const {uploads} = $upload.get();
    const next: Record<string, UploadProgress> = {};
    for (const [id, up] of Object.entries(uploads)) {
        if (up.status !== 'done' && up.status !== 'error') {
            next[id] = up;
        }
    }
    $upload.setKey('uploads', next);
}

/** Resets the store to an empty state. */
export function resetUploads(): void {
    $upload.set(initialUploadState());
}
