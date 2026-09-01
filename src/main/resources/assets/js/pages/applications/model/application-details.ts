const TEXT = {
  systemVersionRange: 'applications.details.systemVersionRange',
  systemVersionFrom: 'applications.details.systemVersionFrom',
  systemVersionUpTo: 'applications.details.systemVersionUpTo',
} as const;

export type SystemVersionPhrase = {
  labelKey: string;
  args: readonly string[];
};

/**
 * The phrase and arguments for the platform versions an application accepts. `undefined` where the
 * descriptor names neither bound, so the field is left out rather than rendered empty.
 */
export function systemVersionPhrase(min?: string, max?: string): SystemVersionPhrase | undefined {
  if (min != null && max != null) {
    return { labelKey: TEXT.systemVersionRange, args: [min, max] };
  }

  if (min != null) {
    return { labelKey: TEXT.systemVersionFrom, args: [min] };
  }

  if (max != null) {
    return { labelKey: TEXT.systemVersionUpTo, args: [max] };
  }

  return undefined;
}
