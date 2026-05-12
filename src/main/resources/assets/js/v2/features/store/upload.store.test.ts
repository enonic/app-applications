import {beforeEach, describe, expect, it} from 'vitest';
import {
    $activeUploadCount,
    $hasActiveUploads,
    $upload,
    clearFinishedUploads,
    patchUpload,
    removeUpload,
    resetUploads,
    setUpload,
} from './upload.store';

describe('upload.store', () => {
    beforeEach(() => {
        resetUploads();
    });

    describe('setUpload', () => {
        it('adds an entry by id', () => {
            setUpload({id: '1', name: 'a.zip', progress: 0, status: 'queued'});
            expect($upload.get().uploads['1']).toEqual({
                id: '1',
                name: 'a.zip',
                progress: 0,
                status: 'queued',
            });
        });

        it('overwrites the existing entry for the same id', () => {
            setUpload({id: '1', name: 'a.zip', progress: 0, status: 'queued'});
            setUpload({id: '1', name: 'a.zip', progress: 50, status: 'uploading'});
            expect($upload.get().uploads['1'].status).toBe('uploading');
            expect($upload.get().uploads['1'].progress).toBe(50);
        });
    });

    describe('patchUpload', () => {
        it('merges patch into the existing entry', () => {
            setUpload({id: '1', name: 'a.zip', progress: 0, status: 'queued'});
            patchUpload('1', {progress: 75, status: 'uploading'});
            expect($upload.get().uploads['1']).toEqual({
                id: '1',
                name: 'a.zip',
                progress: 75,
                status: 'uploading',
            });
        });

        it('no-ops for unknown ids', () => {
            patchUpload('unknown', {progress: 50});
            expect($upload.get().uploads['unknown']).toBeUndefined();
        });
    });

    describe('removeUpload', () => {
        it('removes the entry', () => {
            setUpload({id: '1', name: 'a.zip', status: 'queued'});
            removeUpload('1');
            expect($upload.get().uploads['1']).toBeUndefined();
        });

        it('no-ops for unknown ids', () => {
            setUpload({id: '1', name: 'a.zip', status: 'queued'});
            removeUpload('unknown');
            expect($upload.get().uploads['1']).toBeDefined();
        });
    });

    describe('clearFinishedUploads', () => {
        it('removes done and error entries; keeps queued/uploading', () => {
            setUpload({id: '1', name: 'a', status: 'done'});
            setUpload({id: '2', name: 'b', status: 'error', error: 'boom'});
            setUpload({id: '3', name: 'c', status: 'uploading', progress: 50});
            setUpload({id: '4', name: 'd', status: 'queued'});

            clearFinishedUploads();

            const ids = Object.keys($upload.get().uploads).sort();
            expect(ids).toEqual(['3', '4']);
        });
    });

    describe('$hasActiveUploads', () => {
        it('is false when no uploads are queued/uploading', () => {
            setUpload({id: '1', name: 'a', status: 'done'});
            expect($hasActiveUploads.get()).toBe(false);
        });

        it('is true when at least one upload is queued or uploading', () => {
            setUpload({id: '1', name: 'a', status: 'uploading', progress: 50});
            expect($hasActiveUploads.get()).toBe(true);
        });
    });

    describe('$activeUploadCount', () => {
        it('counts only queued or uploading entries', () => {
            setUpload({id: '1', name: 'a', status: 'done'});
            setUpload({id: '2', name: 'b', status: 'uploading', progress: 10});
            setUpload({id: '3', name: 'c', status: 'queued'});
            setUpload({id: '4', name: 'd', status: 'error', error: 'boom'});
            expect($activeUploadCount.get()).toBe(2);
        });
    });
});
