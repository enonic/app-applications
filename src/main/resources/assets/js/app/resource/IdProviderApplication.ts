import {ApplicationIdProviderJson, IdProviderApplicationJson} from './json/IdProviderApplicationJson';
import {IdProviderMode} from '@enonic/lib-admin-ui/security/IdProviderMode';

export class IdProviderApplication {

    private mode: IdProviderMode;

    private idProviders: ApplicationIdProvider[];

    public static fromJson(json: IdProviderApplicationJson) {
        const result = new IdProviderApplication();

        result.mode = IdProviderMode[json.mode];
        result.idProviders = json.idProviders ? json.idProviders.map(idProviderJson => ApplicationIdProvider.fromJson(idProviderJson)) : [];
        return result;
    }

    getMode(): IdProviderMode {
        return this.mode;
    }

    getIdProviders(): ApplicationIdProvider[] {
        return this.idProviders;
    }
}

export class ApplicationIdProvider {

    private displayName: string;

    private path: string;

    public static fromJson(json: ApplicationIdProviderJson) {
        const result = new ApplicationIdProvider();

        result.displayName = json.displayName;
        result.path = json.path;

        return result;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getPath(): string {
        return this.path;
    }
}
