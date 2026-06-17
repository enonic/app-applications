import {beforeEach, describe, expect, it} from 'vitest';
import {$isReadonly, $readonly, setReadonly} from './index';

describe('shared/config/readonly', () => {
    beforeEach(() => {
        $readonly.set(false);
    });

    it('toggles the readonly flag', () => {
        setReadonly(true);
        expect($readonly.get()).toBe(true);

        setReadonly(false);
        expect($readonly.get()).toBe(false);
    });

    it('$isReadonly reflects the flag', () => {
        setReadonly(true);
        expect($isReadonly.get()).toBe(true);

        setReadonly(false);
        expect($isReadonly.get()).toBe(false);
    });
});
