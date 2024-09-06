import {Application} from '@enonic/lib-admin-ui/application/Application';
import {MarketApplication, MarketAppStatus} from '../../MarketApplication';

export class MarketAppsTreeGridHelper {

    public static installedAppCanBeUpdated(marketApp: MarketApplication, installedApp: Application): boolean {
        return this.compareVersionNumbers(marketApp.getLatestVersion(), installedApp.getVersion()) > 0;
    }

    private static compareVersionNumbers(v1: string, v2: string): number {
        const v1parts: number[] = v1.split('.').map((el) => {
            return parseInt(el, 10);
        });

        const v2parts: number[] = v2.split('.').map((el) => {
            return parseInt(el, 10);
        });

        for (let i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }

            if (v1parts[i] === v2parts[i]) {
                continue;
            }
            if (v1parts[i] > v2parts[i]) {
                return 1;
            }

            return -1;
        }

        if (v1parts.length !== v2parts.length) {
            return -1;
        }

        return 0;
    }

    public static compareAppsByStatusAndDisplayName(app1: MarketApplication, app2: MarketApplication): number {
        if (app1.getStatus() === app2.getStatus()) {
            return app1.getDisplayName().localeCompare(app2.getDisplayName());
        } else if (app1.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
            return -1;
        } else if (app2.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
            return 1;
        }

        return app1.getDisplayName().localeCompare(app2.getDisplayName());
    }
}
