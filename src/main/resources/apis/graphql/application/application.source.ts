import { encodeApplicationIcon } from '/lib/icon';
import {
  get,
  getDescriptor,
  list,
  type Application,
  type ApplicationDescriptor,
} from '/lib/xp/app';

export type ApplicationSource = Application & {
  descriptor: ApplicationDescriptor | null;
};

export function displayNameOf(source: ApplicationSource): string {
  const title = source.descriptor?.title;
  return title != null && title.length > 0 ? title : source.key;
}

export function iconDataUriOf(source: ApplicationSource): string | undefined {
  const mimeType = source.descriptor?.icon?.mimeType;
  if (mimeType == null) {
    return undefined;
  }

  const encoded = encodeApplicationIcon({ application: source.key });
  return encoded == null ? undefined : `data:${mimeType};base64,${encoded}`;
}

export function getApplication(key: string): ApplicationSource | null {
  const application = get({ key });
  if (application == null) {
    return null;
  }

  return { ...application, descriptor: getDescriptor({ key }) };
}

export function listApplications(): ApplicationSource[] {
  return list()
    .map((application) => ({
      ...application,
      descriptor: getDescriptor({ key: application.key }),
    }))
    .sort(byDisplayName);
}

// *
// * Helpers
// *

function byDisplayName(a: ApplicationSource, b: ApplicationSource): number {
  return displayNameOf(a).localeCompare(displayNameOf(b), undefined, { sensitivity: 'base' });
}
