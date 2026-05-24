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

export interface UploadState {
    uploads: Record<string, UploadProgress>;
}
