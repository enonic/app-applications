import {computed, map} from 'nanostores';
import type {UploadState} from './upload.types';

function initialState(): UploadState {
    return {uploads: {}};
}

export const $upload = map<UploadState>(initialState());

export {initialState as initialUploadState};

/** True when at least one upload is queued or uploading. */
export const $hasActiveUploads = computed($upload, ({uploads}) => {
    return Object.values(uploads).some((u) => u.status === 'queued' || u.status === 'uploading');
});

/** Number of uploads currently queued or uploading. */
export const $activeUploadCount = computed($upload, ({uploads}) => {
    return Object.values(uploads).filter((u) => u.status === 'queued' || u.status === 'uploading').length;
});
