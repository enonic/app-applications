import {MarketApplication} from './MarketApplication';
import {Application} from '@enonic/lib-admin-ui/application/Application';

export class MarketHelper {

    static installedAppCanBeUpdated(marketApp: MarketApplication, installedApp: Application): boolean {
        return this.compareVersionNumbers(marketApp.getLatestVersion(), installedApp.getVersion()) > 0;
    }

    private static compareVersionNumbers(v1: string, v2: string): number {
        const v1HasPrerelease = /^\d+(?:\.\d+)*-.+/.test(v1);
        const v2HasPrerelease = /^\d+(?:\.\d+)*-.+/.test(v2);
        const v1Core = v1.split('-', 2)[0];
        const v2Core = v2.split('-', 2)[0];

        let v1parts = v1Core.split('.').map((el) => {
            return parseInt(el, 10);
        });
        let v2parts = v2Core.split('.').map((el) => {
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

        if (v1HasPrerelease && !v2HasPrerelease) {
            return -1;
        }

        if (!v1HasPrerelease && v2HasPrerelease) {
            return 1;
        }

        return 0;
    }
}
