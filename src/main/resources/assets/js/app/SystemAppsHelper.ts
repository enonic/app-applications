import {Application} from '@enonic/lib-admin-ui/application/Application';

export class SystemAppsHelper {

    private static instance: SystemAppsHelper | null = null;

    private readonly systemKeys: Set<string> = new Set<string>();

    static get(): SystemAppsHelper {
        if (!SystemAppsHelper.instance) {
            SystemAppsHelper.instance = new SystemAppsHelper();
        }
        return SystemAppsHelper.instance;
    }

    setSystemFlag(key: string, isSystem: boolean): void {
        if (isSystem) {
            this.systemKeys.add(key);
        } else {
            this.systemKeys.delete(key);
        }
    }

    isSystemApp(application: Application | null | undefined): boolean {
        if (!application) {
            return false;
        }
        const key = application.getApplicationKey().toString();
        return this.systemKeys.has(key);
    }

    isSystemKey(key: string): boolean {
        return this.systemKeys.has(key);
    }
}
