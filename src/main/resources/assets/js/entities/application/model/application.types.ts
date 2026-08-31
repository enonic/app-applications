export type ApplicationState = 'STARTED' | 'STOPPED';

export type Application = {
  key: string;
  displayName: string;
  description?: string;
  version?: string;
  state: ApplicationState;
  system: boolean;
  local: boolean;
  icon?: string;
  modifiedTime?: string;
  minSystemVersion?: string;
  maxSystemVersion?: string;
  vendorName?: string;
  vendorUrl?: string;
};

export type ApplicationItem = {
  key: string;
  name: string;
  displayName: string;
  description?: string;
};

export type AdminToolItem = ApplicationItem & { url: string };

export type AdminExtensionItem = ApplicationItem & { interfaces: readonly string[] };

export type ApiItem = ApplicationItem & { documentationUrl?: string };

export type IdProviderMode = 'LOCAL' | 'EXTERNAL' | 'MIXED';

export type IdProviderInstance = {
  key: string;
  displayName: string;
};

export type ApplicationIdProvider = {
  mode?: IdProviderMode;
  usedBy: readonly IdProviderInstance[];
};

export type ApplicationInfo = {
  contentTypes: readonly ApplicationItem[];
  mixins: readonly ApplicationItem[];
  formFragments: readonly ApplicationItem[];
  pages: readonly ApplicationItem[];
  parts: readonly ApplicationItem[];
  layouts: readonly ApplicationItem[];
  macros: readonly ApplicationItem[];
  tasks: readonly ApplicationItem[];
  adminTools: readonly AdminToolItem[];
  adminExtensions: readonly AdminExtensionItem[];
  apis: readonly ApiItem[];
  deploymentUrl?: string;
  /** Only an application that declares an id provider descriptor has one. */
  idProvider?: ApplicationIdProvider;
};
