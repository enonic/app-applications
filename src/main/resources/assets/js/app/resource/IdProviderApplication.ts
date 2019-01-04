import '../../api.ts';
import IdProviderMode = api.security.IdProviderMode;
import {IdProviderApplicationJson, ApplicationUserStoreJson} from './json/IdProviderApplicationJson';

export class IdProviderApplication {

    private mode: IdProviderMode;

    private userStores: ApplicationUserStore[];

    public static fromJson(json: IdProviderApplicationJson) {
        const result = new IdProviderApplication();

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
