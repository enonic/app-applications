import '../../api.ts';
import IdProviderMode = api.security.IdProviderMode;
import {ApplicationIdProviderJson, ApplicationUserStoreJson} from './json/ApplicationIdProviderJson';

export class ApplicationIdProvider {

    private mode: IdProviderMode;

    private userStores: ApplicationUserStore[];

    public static fromJson(json: ApplicationIdProviderJson) {
        const result = new ApplicationIdProvider();

        result.mode = IdProviderMode[json.mode];
        result.userStores = json.userStores ? json.userStores.map(userStoreJson => ApplicationUserStore.fromJson(userStoreJson)) : [];
        return result;
    }

    getMode(): api.security.IdProviderMode {
        return this.mode;
    }

    getUserStores(): ApplicationUserStore[] {
        return this.userStores;
    }
}

export class ApplicationUserStore {

    private displayName: string;

    private path: string;

    public static fromJson(json: ApplicationUserStoreJson) {
        const result = new ApplicationUserStore();

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
