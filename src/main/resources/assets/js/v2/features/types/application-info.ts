//
// * Wire format (server JSON)
//

export interface ApplicationInfoJson {
    contentTypes?: {
        contentTypes?: ContentTypeSummaryJson[];
    };
    pages?: BaseDescriptorsJson;
    parts?: BaseDescriptorsJson;
    layouts?: BaseDescriptorsJson;
    macros?: {
        macros?: MacroJson[];
    };
    tasks?: {
        tasks?: ApplicationTaskJson[];
    };
    idProviderApplication?: IdProviderApplicationJson;
    deployment?: ApplicationDeploymentJson;
    widgets?: {
        descriptors?: ExtensionDescriptorJson[];
    };
    tools?: {
        descriptors?: AdminToolDescriptorJson[];
    };
    apis?: {
        descriptors?: ApiDescriptorJson[];
    };
}

interface BaseDescriptorJson {
    key: string;
    name: string;
    title: string;
    description: string;
}

interface BaseDescriptorsJson {
    descriptors?: BaseDescriptorJson[];
}

interface ContentTypeSummaryJson {
    name: string;
    displayName?: string;
}

interface MacroJson {
    key: string;
    name: string;
    displayName: string;
    description: string;
    iconUrl: string;
}

interface ApplicationTaskJson {
    key: string;
    description: string;
}

interface AdminToolDescriptorJson {
    key: string;
    application: string;
    name: string;
    title: string;
    description: string;
    icon: string;
    toolUrl: string;
}

interface ApiDescriptorJson {
    key: string;
    name: string;
    mount: string[];
    allowedPrincipals: string[];
    title?: string;
    description?: string;
    documentationUrl?: string;
}

interface ExtensionDescriptorJson {
    title: string;
    description: string;
    iconUrl: string;
    url: string;
    interfaces: string[];
    key: string;
}

interface IdProviderApplicationJson {
    mode?: string;
    idProviders?: {
        displayName?: string;
        path?: string;
    }[];
}

interface ApplicationDeploymentJson {
    url?: string;
}

//
// * Flat DTOs
//

export type IdProviderMode = 'LOCAL' | 'EXTERNAL' | 'MIXED';

export interface DescriptorDto {
    key: string;
    name: string;
}

export interface MacroDto {
    key: string;
    displayName: string;
}

export interface TaskDto {
    key: string;
    description: string;
}

export interface AdminToolDto {
    key: string;
    title: string;
    toolUrl: string;
}

export interface ExtensionDto {
    key: string;
    displayName: string;
    interfaces: string[];
}

export interface ApiDescriptorDto {
    key: string;
    name: string;
    title: string;
}

export interface IdProviderDto {
    path: string;
}

export interface IdProviderApplicationDto {
    mode?: IdProviderMode;
    idProviders: IdProviderDto[];
}

export interface ApplicationInfoDto {
    contentTypes: string[];
    pages: DescriptorDto[];
    parts: DescriptorDto[];
    layouts: DescriptorDto[];
    macros: MacroDto[];
    tasks: TaskDto[];
    tools: AdminToolDto[];
    widgets: ExtensionDto[];
    apis: ApiDescriptorDto[];
    idProviderApplication?: IdProviderApplicationDto;
    deploymentUrl: string;
}

//
// * Conversion
//

const SYSTEM_PREFIX = 'system:';

/**
 * Converts the raw `application/info` payload into a flat DTO ready to be cached
 * in nanostores. Filters macros owned by the `system` application (parity with
 * the legacy `ApplicationDataContainer.getMacroNames`).
 */
export function toApplicationInfoDto(json: ApplicationInfoJson): ApplicationInfoDto {
    return {
        contentTypes: contentTypeNames(json.contentTypes?.contentTypes ?? []),
        pages: mapDescriptors(json.pages?.descriptors),
        parts: mapDescriptors(json.parts?.descriptors),
        layouts: mapDescriptors(json.layouts?.descriptors),
        macros: mapMacros(json.macros?.macros ?? []),
        tasks: mapTasks(json.tasks?.tasks ?? []),
        tools: mapTools(json.tools?.descriptors ?? []),
        widgets: mapWidgets(json.widgets?.descriptors ?? []),
        apis: mapApis(json.apis?.descriptors ?? []),
        idProviderApplication: mapIdProviderApplication(json.idProviderApplication),
        deploymentUrl: trailingSlash(json.deployment?.url ?? ''),
    };
}

function contentTypeNames(types: ContentTypeSummaryJson[]): string[] {
    return types.map((t) => localName(t.name)).filter(Boolean);
}

function localName(qualifiedName: string): string {
    if (!qualifiedName) return '';
    const colon = qualifiedName.lastIndexOf(':');
    return colon < 0 ? qualifiedName : qualifiedName.substring(colon + 1);
}

function mapDescriptors(descriptors: BaseDescriptorJson[] | undefined): DescriptorDto[] {
    return (descriptors ?? []).map((d) => ({key: d.key, name: d.name}));
}

function mapMacros(macros: MacroJson[]): MacroDto[] {
    return macros.filter((m) => !m.key.startsWith(SYSTEM_PREFIX)).map((m) => ({
        key: m.key,
        displayName: m.displayName,
    }));
}

function mapTasks(tasks: ApplicationTaskJson[]): TaskDto[] {
    return tasks.map((t) => ({key: t.key, description: t.description}));
}

function mapTools(tools: AdminToolDescriptorJson[]): AdminToolDto[] {
    return tools.map((t) => ({key: t.key, title: t.title, toolUrl: t.toolUrl}));
}

function mapWidgets(widgets: ExtensionDescriptorJson[]): ExtensionDto[] {
    return widgets.map((w) => ({
        key: w.key,
        displayName: w.title,
        interfaces: w.interfaces ?? [],
    }));
}

function mapApis(apis: ApiDescriptorJson[]): ApiDescriptorDto[] {
    return apis.map((a) => ({
        key: a.key,
        name: a.name,
        title: a.title ?? '',
    }));
}

function mapIdProviderApplication(json: IdProviderApplicationJson | undefined): IdProviderApplicationDto | undefined {
    if (!json || !json.mode) return undefined;
    const mode = toIdProviderMode(json.mode);
    if (!mode) return undefined;
    return {
        mode,
        idProviders: (json.idProviders ?? []).map((p) => ({path: p.path ?? ''})),
    };
}

function toIdProviderMode(raw: string): IdProviderMode | undefined {
    if (raw === 'LOCAL' || raw === 'EXTERNAL' || raw === 'MIXED') return raw;
    return undefined;
}

function trailingSlash(url: string): string {
    if (!url) return '';
    return url.endsWith('/') ? url : `${url}/`;
}
