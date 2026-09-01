import { useEffect, useState } from 'preact/hooks';

export type DialogLayer = {
  blocked: boolean;
  nested: boolean;
};

export function layerOf(stack: readonly number[], id: number): DialogLayer {
  const index = stack.indexOf(id);

  return {
    blocked: index !== -1 && index < stack.length - 1,
    nested: index > 0,
  };
}

let stack: readonly number[] = [];
let nextId = 0;

const listeners = new Set<() => void>();

function announce(): void {
  listeners.forEach((listener) => listener());
}

export function useDialogLayer(open: boolean): DialogLayer {
  const [id] = useState(() => {
    nextId += 1;
    return nextId;
  });
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = (): void => rerender((count) => count + 1);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    stack = [...stack, id];
    announce();

    return () => {
      stack = stack.filter((candidate) => candidate !== id);
      announce();
    };
  }, [open, id]);

  return layerOf(stack, id);
}
