import {afterEach, describe, expect, it} from 'vitest';
import {
    $hasToasts,
    $notifications,
    dismissToast,
    pushToast,
    resetNotifications,
} from './index';

describe('shared/ui/toaster/store/notifications', () => {
    afterEach(() => {
        resetNotifications();
    });

    describe('pushToast', () => {
        it('returns a unique id', () => {
            const id1 = pushToast({tone: 'info', message: 'one'});
            const id2 = pushToast({tone: 'info', message: 'two'});
            expect(id1).not.toBe(id2);
        });

        it('appends to the stack with default 5s duration', () => {
            pushToast({tone: 'success', message: 'hi'});
            const [item] = $notifications.get();
            expect(item.message).toBe('hi');
            expect(item.tone).toBe('success');
            expect(item.duration).toBe(5_000);
        });

        it('honors explicit duration including 0 (sticky)', () => {
            pushToast({tone: 'warning', message: 'sticky', duration: 0});
            const [item] = $notifications.get();
            expect(item.duration).toBe(0);
        });
    });

    describe('dismissToast', () => {
        it('removes the toast by id', () => {
            const id = pushToast({tone: 'info', message: 'remove me'});
            dismissToast(id);
            expect($notifications.get()).toHaveLength(0);
        });

        it('is a no-op for unknown ids', () => {
            pushToast({tone: 'info', message: 'still here'});
            dismissToast('unknown');
            expect($notifications.get()).toHaveLength(1);
        });
    });

    describe('$hasToasts', () => {
        it('is false when empty, true otherwise', () => {
            expect($hasToasts.get()).toBe(false);
            pushToast({tone: 'info', message: 'x'});
            expect($hasToasts.get()).toBe(true);
        });
    });
});
