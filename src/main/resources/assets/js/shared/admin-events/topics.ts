/**
 * What the `applications` topic carries. The hub publishes ids and never data, and it excludes
 * `PROGRESS`, so no message on this topic ever describes a download in flight.
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
