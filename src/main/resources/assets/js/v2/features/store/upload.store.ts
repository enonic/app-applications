import {computed, map} from 'nanostores';

//
// * Types
//

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'error';

export interface UploadProgress {
    /** Stable id for the upload (uuid or the underlying uploader's id). */
    id: string;
    /** Original filename, used in the UI. */
    name: string;
    /** Percentage 0..100. `undefined` when indeterminate. */
    progress?: number;
    status: UploadStatus;
    /** Error message when `status === 'error'`. */
    error?: string;
}

interface UploadStore {
    uploads: Record<string, UploadProgress>;
}

//
// * Store state
//

export const $upload = map<UploadStore>(initialState());

function initialState(): UploadStore {
    return {uploads: {}};
}

//
// * Mutators
//

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
    $upload.set(initialState());
}

//
// * Derived state
//

/** True when at least one upload is queued or uploading. */
export const $hasActiveUploads = computed($upload, ({uploads}) => {
    return Object.values(uploads).some((u) => u.status === 'queued' || u.status === 'uploading');
});

/** Number of uploads currently queued or uploading. */
export const $activeUploadCount = computed($upload, ({uploads}) => {
    return Object.values(uploads).filter((u) => u.status === 'queued' || u.status === 'uploading').length;
});
