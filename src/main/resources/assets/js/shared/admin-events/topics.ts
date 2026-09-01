/**
 * What the `applications` topic carries. The hub publishes ids and never data, and a download in
 * flight rides `applicationProgress` instead, so no message here ever describes one.
 */
export type ApplicationsMessage = {
  eventType: string;
  key?: string;
  systemApplication?: boolean;
};

/** The hub hands a payload over as `unknown`, so this is a wire boundary: checked, never cast. */
export function toApplicationsMessage(data: unknown): ApplicationsMessage | undefined {
  if (data == null || typeof data !== 'object') {
    return undefined;
  }

  const { eventType, key, systemApplication } = data as Partial<ApplicationsMessage>;
  if (typeof eventType !== 'string') {
    return undefined;
  }

  return {
    eventType,
    key: typeof key === 'string' ? key : undefined,
    systemApplication: typeof systemApplication === 'boolean' ? systemApplication : undefined,
  };
}

/**
 * What the `applicationProgress` topic carries: a download core is working through, and how far it
 * has got. There is no terminal message — 100% means the download finished, not the install.
 */
export type ApplicationProgressMessage = {
  /** The download url, which is all core reports a progressing install by. */
  url: string;
  /** 0–100, and stuck at 0 for a download core has no content length to measure against. */
  percent: number;
};

/** The same wire boundary as above: the hub hands the payload over as `unknown`. */
export function toApplicationProgressMessage(
  data: unknown,
): ApplicationProgressMessage | undefined {
  if (data == null || typeof data !== 'object') {
    return undefined;
  }

  const { url, percent } = data as Partial<ApplicationProgressMessage>;
  if (typeof url !== 'string' || url === '') {
    return undefined;
  }

  // A width comes out of this, so anything the host let through unchecked is refused here.
  if (typeof percent !== 'number' || !Number.isFinite(percent) || percent < 0 || percent > 100) {
    return undefined;
  }

  return { url, percent };
}
