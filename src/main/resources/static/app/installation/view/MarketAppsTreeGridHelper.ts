import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {GridColumn, GridColumnBuilder} from '@enonic/lib-admin-ui/ui/grid/GridColumn';
import {MarketApplication, MarketAppStatus, MarketAppStatusFormatter} from '@enonic/lib-admin-ui/application/MarketApplication';
import {MarketAppViewer} from './MarketAppViewer';
import {AEl} from '@enonic/lib-admin-ui/dom/AEl';
import {Application} from '@enonic/lib-admin-ui/application/Application';

export class MarketAppsTreeGridHelper {

    public static generateColumns(): GridColumn<TreeNode<MarketApplication>>[] {
        const nameColumn: GridColumn<TreeNode<MarketApplication>> = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('Name')
            .setId('displayName')
            .setField('displayName')
            .setCssClass('app-name-and-icon')
            .setMinWidth(170)
            .setFormatter(MarketAppsTreeGridHelper.nameFormatter)
            .build();

        const versionColumn: GridColumn<TreeNode<MarketApplication>> = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('Version')
            .setId('version')
            .setField('latestVersion')
            .setCssClass('version')
            .setMinWidth(40)
            .build();

        const appStatusColumns: GridColumn<TreeNode<MarketApplication>> = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('AppStatus')
            .setId('appStatus')
            .setField('status')
            .setCssClass('status')
            .setMinWidth(50)
            .setFormatter(MarketAppsTreeGridHelper.appStatusFormatter)
            .setCssClass('app-status').build();

        return [nameColumn, versionColumn, appStatusColumns];
    }

    private static nameFormatter(row: number, cell: number, value: string, columnDef: Slick.Column<TreeNode<MarketApplication>>,
                                 node: TreeNode<MarketApplication>): string {
        const data: MarketApplication = node.getData();

        if (data.getAppKey()) {
            let viewer: MarketAppViewer = node.getViewer('name') as MarketAppViewer;
            if (!viewer) {
                viewer = new MarketAppViewer();
                node.setViewer('name', viewer);
            }

            viewer.setObject(data, node.calcLevel() > 1);
            return viewer.toString();
        }

        return '';
    }

    public static appStatusFormatter(row: number, cell: number, value: number, columnDef: Slick.Column<TreeNode<MarketApplication>>,
                                     node: TreeNode<MarketApplication>): string {
        const app: MarketApplication = node.getData();
        const statusWrapper: AEl = new AEl();

        if (app.getAppKey()) {
            const status: MarketAppStatus = app.getStatus();
            const progress: number = app.getProgress();

            statusWrapper.appendChild(MarketAppStatusFormatter.createStatusElement(status, progress));
            statusWrapper.addClass(MarketAppStatusFormatter.getStatusCssClass(status));

            if (status !== MarketAppStatus.NOT_INSTALLED && status !== MarketAppStatus.OLDER_VERSION_INSTALLED) {
                statusWrapper.getEl().setTabIndex(-1);
            }
        }

        return statusWrapper.toString();
    }

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
