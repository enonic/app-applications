import {beforeEach, describe, expect, it} from 'vitest';
import {
    $hasToasts,
    $notifications,
    dismissToast,
    pushToast,
    resetNotifications,
} from './notifications.store';

describe('notifications.store', () => {
    beforeEach(() => {
        resetNotifications();
    });

    describe('pushToast', () => {
        it('appends a toast with the given tone and message', () => {
            const id = pushToast({tone: 'success', message: 'All good'});

            const items = $notifications.get();
            expect(items).toHaveLength(1);
            expect(items[0]).toMatchObject({id, tone: 'success', message: 'All good'});
        });

        it('preserves stacking order', () => {
            const a = pushToast({tone: 'info', message: 'a'});
            const b = pushToast({tone: 'warning', message: 'b'});
            const c = pushToast({tone: 'error', message: 'c'});

            expect($notifications.get().map((n) => n.id)).toEqual([a, b, c]);
        });

        it('defaults duration to 5000ms when not given', () => {
            pushToast({tone: 'info', message: 'hi'});
            expect($notifications.get()[0].duration).toBe(5000);
        });

        it('forwards an explicit duration (including 0 for sticky)', () => {
            pushToast({tone: 'info', message: 'hi', duration: 0});
            pushToast({tone: 'info', message: 'hi too', duration: 1_200});

            expect($notifications.get().map((n) => n.duration)).toEqual([0, 1_200]);
        });

        it('returns unique ids for repeated pushes', () => {
            const ids = new Set<string>();
            for (let i = 0; i < 5; i++) {
                ids.add(pushToast({tone: 'info', message: 'x'}));
            }
            expect(ids.size).toBe(5);
        });
    });

    describe('dismissToast', () => {
        it('removes the toast with the given id', () => {
            const a = pushToast({tone: 'info', message: 'a'});
            const b = pushToast({tone: 'info', message: 'b'});

            dismissToast(a);

            expect($notifications.get().map((n) => n.id)).toEqual([b]);
        });

        it('is a no-op when the id is unknown', () => {
            pushToast({tone: 'info', message: 'a'});
            const before = $notifications.get();
            dismissToast('unknown');
            expect($notifications.get()).toBe(before);
        });
    });

    describe('$hasToasts', () => {
        it('is false when the stack is empty', () => {
            expect($hasToasts.get()).toBe(false);
        });

        it('is true while toasts are stacked', () => {
            const id = pushToast({tone: 'info', message: 'a'});
            expect($hasToasts.get()).toBe(true);

            dismissToast(id);
            expect($hasToasts.get()).toBe(false);
        });
    });
});
