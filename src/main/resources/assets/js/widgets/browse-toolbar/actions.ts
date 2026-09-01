export type ActionContext<T> = {
  selected: readonly T[];
  active: T | undefined;
};

/**
 * What a section declares. A key, not a label: the list is a module constant, and a phrase resolved there
 * would resolve before any were published.
 */
export type SectionAction<T> = {
  id: string;
  labelKey: string;
  /** Pure — no I/O, no store reads. Unit-tested per section. */
  enabled: (ctx: ActionContext<T>) => boolean;
  run: (ctx: ActionContext<T>) => void | Promise<void>;
  /**
   * Runs when a row is activated — today, double-clicked. At most one action per section carries it, and
   * its own `enabled` still decides: a shortcut to an action the user has, never a way past its rules.
   */
  activatedByRow?: boolean;
};

/** What the toolbar and the row menu render: the same action with its label resolved. */
export type LabelledAction<T> = SectionAction<T> & { label: string };

/**
 * What an action applies to: the ticked rows, or the active row when nothing is ticked. The toolbar and the
 * row context menu both read it, so right-clicking a row is enough to act on it.
 */
export function actionTargets<T>({ selected, active }: ActionContext<T>): readonly T[] {
  if (selected.length > 0) {
    return selected;
  }

  return active === undefined ? [] : [active];
}

/** The action a row activation runs, if the section declared one and it is allowed right now. */
export function rowActivationAction<T>(
  actions: readonly SectionAction<T>[],
  ctx: ActionContext<T>,
): SectionAction<T> | undefined {
  const action = actions.find(({ activatedByRow }) => activatedByRow === true);

  return action !== undefined && action.enabled(ctx) ? action : undefined;
}
