import { describe, expect, it } from 'vitest';

import { type ActionContext, actionTargets, rowActivationAction } from './actions';

const a = { id: 'a' };
const b = { id: 'b' };

function context(overrides: Partial<ActionContext<typeof a>> = {}): ActionContext<typeof a> {
  return { selected: [], active: undefined, ...overrides };
}

describe('actionTargets', () => {
  it('takes the ticked rows when there are any', () => {
    expect(actionTargets(context({ selected: [a, b], active: a }))).toEqual([a, b]);
  });

  it('falls back to the active row', () => {
    expect(actionTargets(context({ active: b }))).toEqual([b]);
  });

  it('has no target with nothing ticked and no active row', () => {
    expect(actionTargets(context())).toEqual([]);
  });
});

describe('rowActivationAction', () => {
  const edit = {
    id: 'edit',
    labelKey: 'edit',
    enabled: (ctx: ActionContext<typeof a>) => actionTargets(ctx).length === 1,
    run: () => undefined,
    activatedByRow: true,
  };

  const remove = {
    id: 'delete',
    labelKey: 'delete',
    enabled: () => true,
    run: () => undefined,
  };

  it('answers the action the section marked, when it is allowed', () => {
    expect(rowActivationAction([remove, edit], context({ active: a }))?.id).toBe('edit');
  });

  // ! A double click is a shortcut to an action the user already has, never a way past its rules.
  it('answers nothing while that action is disabled', () => {
    expect(
      rowActivationAction([remove, edit], context({ selected: [a, b], active: b })),
    ).toBeUndefined();
  });

  it('answers nothing where the section marked no action at all', () => {
    expect(rowActivationAction([remove], context({ active: a }))).toBeUndefined();
  });
});
