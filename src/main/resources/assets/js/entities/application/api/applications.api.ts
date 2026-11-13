import { AppError } from '@enonic/ui-utils';
import { requestJson } from '@enonic/ui-utils/request';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';

import {
  type GraphQlRoot,
  requestGraphQl,
  requestGraphQlDocument,
  requestUploadJson,
} from '../../../shared/api';
import { serverAppUrl } from '../../../shared/config';
import type { Application, ApplicationState } from '../model/application.types';

// The last four are the details panel's, not a row's: they are scalars off the application and
// descriptor this query already loads, while `applicationInfo` costs a jar walk per field.
const APPLICATION_FIELDS = `
  key
  displayName
  description
  version
  state
  system
  local
  modifiedTime
  systemVersion
  vendorName
  vendorUrl
`;

export const APPLICATIONS_ROOT: GraphQlRoot = {
  field: 'applications',
  selection: `{${APPLICATION_FIELDS}}`,
};

// ! A document rather than a root: `application(key:)` answers `null` for a key nothing is installed
// ! under, which is an answer the store acts on — it drops the row — and `requestGraphQl` treats a
// ! missing field as a failure.
const APPLICATION_DOCUMENT = `
  query Application($key: String!) {
    application(key: $key) {${APPLICATION_FIELDS}}
  }
`;

type ApplicationRowDto = {
  key: string;
  displayName: string;
  description: string | null;
  version: string | null;
  state: ApplicationState;
  system: boolean;
  local: boolean;
  modifiedTime: string | null;
  systemVersion: string | null;
  vendorName: string | null;
  vendorUrl: string | null;
};

type ApplicationsResult = { applications: ApplicationRowDto[] };

type ApplicationResult = { application: ApplicationRowDto | null };

// The one field read off core's own list (`GET server:app/`, ApplicationInfoJson): the rest of a row still
// comes from the section's schema. ! Absent rather than null for an application that ships no icon.
type IconHashesDto = { applications: { key: string; iconHash?: string }[] };

type IconUrls = ReadonlyMap<string, string>;

// The wire shape both of XP core's install endpoints answer with (ApplicationInfoJson): the
// application as it now stands installed. Its key is core's, which need not be the key the market
// listed it as.
type InstalledApplicationDto = {
  key: string;
  version: string;
  /**
   * The descriptor's title. ! Absent rather than null where an application ships none — core's mapper is
   * configured `NON_NULL`.
   */
  title?: string;
};

export type InstallFromUrlParams = {
  /** A download url out of the market catalogue. */
  url: string;
  /**
   * The checksum the market published. Core requires one unless `installUrl.checksumRequired` is off, and
   * pre-XP-8 releases have none — so it is optional here, and core is what refuses.
   */
  sha512?: string;
};

export type InstallFromFileParams = {
  /** The jar the operator picked. */
  file: File;
  /** How much of it has gone out, 0–100. */
  onProgress?: (percent: number) => void;
};

export type InstalledApplication = {
  key: string;
  version: string;
  /** What to call it, for a caller that has no name of its own — an upload has only a file name. */
  displayName: string;
};

export function fetchApplications(signal?: AbortSignal): ResultAsync<Application[], AppError> {
  return ResultAsync.combine([
    requestGraphQl<ApplicationsResult>(APPLICATIONS_ROOT, { signal }),
    fetchIconUrls(signal),
  ]).map(([{ applications }, iconUrls]) => applications.map((dto) => toApplication(dto, iconUrls)));
}

export function fetchApplication(
  key: string,
  signal?: AbortSignal,
): ResultAsync<Application | undefined, AppError> {
  return ResultAsync.combine([
    requestGraphQlDocument<ApplicationResult>(APPLICATION_DOCUMENT, { key }, signal),
    fetchIconUrls(signal),
  ]).map(([{ application }, iconUrls]) =>
    application == null ? undefined : toApplication(application, iconUrls),
  );
}

/** Installs an application from a url through XP's `server:app` api. */
export function postInstallApplicationFromUrl({
  url,
  sha512,
}: InstallFromUrlParams): ResultAsync<InstalledApplication, AppError> {
  const endpoint = serverAppUrl('installUrl');

  // ! Unreachable once the bootstrap has filled the config store — nothing renders before it — so
  // ! this is calling too early rather than a state the section has to show.
  if (endpoint == null) {
    return errAsync(new AppError('The section has not read its configuration'));
  }

  return requestJson<InstalledApplicationDto>(endpoint, {
    method: 'POST',
    body: { URL: url, ...(sha512 != null && { sha512 }) },
  }).map(toInstalledApplication);
}

/** Installs an application from a jar the operator picked, through XP's `server:app` api. */
export function postInstallApplicationFromFile({
  file,
  onProgress,
}: InstallFromFileParams): ResultAsync<InstalledApplication, AppError> {
  const endpoint = serverAppUrl('install');

  if (endpoint == null) {
    return errAsync(new AppError('The section has not read its configuration'));
  }

  const formData = new FormData();
  formData.append('file', file);

  return requestUploadJson<InstalledApplicationDto>(endpoint, { formData, onProgress }).map(
    toInstalledApplication,
  );
}

// *
// * Internal
// *

// An application with no descriptor title is named by its key, which is what the browse list shows
// for it too.
function toInstalledApplication({
  key,
  version,
  title,
}: InstalledApplicationDto): InstalledApplication {
  return { key, version, displayName: title ?? key };
}

// ? An icon is decoration, so a core that cannot answer — a host tool that does not mount the api, an XP
// ? older than the icon route — costs the icons and not the list. `server:app` has no read for one
// ? application, so a single row's reload reads every hash as well.
function fetchIconUrls(signal?: AbortSignal): ResultAsync<IconUrls, never> {
  const list = serverAppUrl();
  const icon = serverAppUrl('icon');

  if (list == null || icon == null) {
    return okAsync(new Map());
  }

  return requestJson<IconHashesDto>(`${list}/`, { signal })
    .map(({ applications }) => {
      const urls = new Map<string, string>();

      for (const { key, iconHash } of applications) {
        if (iconHash != null) {
          urls.set(key, `${icon}?key=${encodeURIComponent(key)}&v=${encodeURIComponent(iconHash)}`);
        }
      }

      return urls;
    })
    .orElse(() => okAsync(new Map()));
}

function toApplication(dto: ApplicationRowDto, iconUrls: IconUrls): Application {
  return {
    key: dto.key,
    displayName: dto.displayName,
    description: dto.description ?? undefined,
    version: dto.version ?? undefined,
    state: dto.state,
    system: dto.system,
    local: dto.local,
    icon: iconUrls.get(dto.key),
    modifiedTime: dto.modifiedTime ?? undefined,
    systemVersion: dto.systemVersion ?? undefined,
    vendorName: dto.vendorName ?? undefined,
    vendorUrl: dto.vendorUrl ?? undefined,
  };
}
