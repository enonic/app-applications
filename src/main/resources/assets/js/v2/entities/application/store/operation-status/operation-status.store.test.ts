import {beforeEach, describe, expect, it} from 'vitest';
import {
    $appActions,
    $isInstalling,
    clearInstalling,
    clearStarting,
    clearStopping,
    isPending,
    markStarting,
    markStopping,
    resetAppActions,
    setInstalling,
} from './index';

describe('entities/application/store/operation-status', () => {
    beforeEach(() => {
        resetAppActions();
    });

    describe('setInstalling', () => {
        it('records install progress for a key', () => {
            setInstalling({key: 'app-a', progress: 25, label: 'Downloading'});
            expect($appActions.get().installing['app-a']).toEqual({
                key: 'app-a',
                progress: 25,
                label: 'Downloading',
            });
        });

        it('overwrites the existing record for the same key', () => {
            setInstalling({key: 'app-a', progress: 10});
            setInstalling({key: 'app-a', progress: 90});
            expect($appActions.get().installing['app-a'].progress).toBe(90);
        });

        it('does not affect other in-flight installs', () => {
            setInstalling({key: 'app-a', progress: 10});
            setInstalling({key: 'app-b', progress: 50});
            expect(Object.keys($appActions.get().installing).sort()).toEqual(['app-a', 'app-b']);
        });
    });

    describe('clearInstalling', () => {
        it('removes the record', () => {
            setInstalling({key: 'app-a', progress: 10});
            clearInstalling('app-a');
            expect($appActions.get().installing['app-a']).toBeUndefined();
        });

        it('no-ops for unknown keys', () => {
            setInstalling({key: 'app-a', progress: 10});
            clearInstalling('unknown');
            expect($appActions.get().installing['app-a']).toBeDefined();
        });
    });

    describe('markStarting / clearStarting', () => {
        it('adds and removes keys from the starting set', () => {
            markStarting(['a', 'b']);
            expect($appActions.get().starting.has('a')).toBe(true);
            expect($appActions.get().starting.has('b')).toBe(true);

            clearStarting(['a']);
            expect($appActions.get().starting.has('a')).toBe(false);
            expect($appActions.get().starting.has('b')).toBe(true);
        });

        it('no-ops on empty input', () => {
            markStarting(['a']);
            markStarting([]);
            clearStarting([]);
            expect($appActions.get().starting.has('a')).toBe(true);
        });
    });

    describe('markStopping / clearStopping', () => {
        it('adds and removes keys from the stopping set', () => {
            markStopping(['a']);
            expect($appActions.get().stopping.has('a')).toBe(true);

            clearStopping(['a']);
            expect($appActions.get().stopping.has('a')).toBe(false);
        });
    });

    describe('$isInstalling', () => {
        it('is false when nothing is installing', () => {
            expect($isInstalling.get()).toBe(false);
        });

        it('is true when at least one install is recorded', () => {
            setInstalling({key: 'a'});
            expect($isInstalling.get()).toBe(true);
        });

        it('flips back to false when all installs are cleared', () => {
            setInstalling({key: 'a'});
            setInstalling({key: 'b'});
            clearInstalling('a');
            clearInstalling('b');
            expect($isInstalling.get()).toBe(false);
        });
    });

    describe('isPending', () => {
        it('is true if the key is installing', () => {
            setInstalling({key: 'a'});
            expect(isPending('a')).toBe(true);
        });

        it('is true if the key is starting', () => {
            markStarting(['a']);
            expect(isPending('a')).toBe(true);
        });

        it('is true if the key is stopping', () => {
            markStopping(['a']);
            expect(isPending('a')).toBe(true);
        });

        it('is false for keys with no pending action', () => {
            expect(isPending('a')).toBe(false);
        });
    });
});
