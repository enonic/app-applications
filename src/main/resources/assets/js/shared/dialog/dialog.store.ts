import { atom, type ReadableAtom } from 'nanostores';

export type DialogStore<P> = {
  $payload: ReadableAtom<P | undefined>;
  open: (payload: P) => void;
  close: () => void;
};

export function createDialogStore<P>(): DialogStore<P> {
  const $payload = atom<P | undefined>(undefined);

  return {
    $payload,

    open(payload) {
      $payload.set(payload);
    },

    close() {
      if ($payload.get() !== undefined) {
        $payload.set(undefined);
      }
    },
  };
}
