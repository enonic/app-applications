import * as Q from 'q';
import {MarketApplicationFetcher} from '../../resource/MarketApplicationFetcher';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Application} from 'lib-admin-ui/application/Application';
import {Element} from 'lib-admin-ui/dom/Element';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {MarketApplication, MarketAppStatus, MarketAppStatusFormatter} from 'lib-admin-ui/application/MarketApplication';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {ResponsiveItem} from 'lib-admin-ui/ui/responsive/ResponsiveItem';
import {ResponsiveManager} from 'lib-admin-ui/ui/responsive/ResponsiveManager';
import {ApplicationEvent, ApplicationEventType} from 'lib-admin-ui/application/ApplicationEvent';
import {GetApplicationRequest} from 'lib-admin-ui/application/GetApplicationRequest';
import {InstallUrlApplicationRequest} from 'lib-admin-ui/application/InstallUrlApplicationRequest';
import {ApplicationInstallResult} from 'lib-admin-ui/application/ApplicationInstallResult';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {Exception} from 'lib-admin-ui/Exception';
import {MarketApplicationResponse} from 'lib-admin-ui/application/MarketApplicationResponse';
import {MarketHelper} from 'lib-admin-ui/application/MarketHelper';
import {MarketAppsTreeGridHelper} from './MarketAppsTreeGridHelper';

declare let CONFIG;

export class MarketAppsTreeGrid extends TreeGrid<MarketApplication> {

    private installedApplications: Application[];

    public static debug: boolean = false;

    private nodesFilter: (nodes: TreeNode<MarketApplication>[]) => TreeNode<MarketApplication>[];

    private loadingStartedListeners: { (): void; }[];

    constructor() {

        super(new TreeGridBuilder<MarketApplication>()
            .setColumns(MarketAppsTreeGridHelper.generateColumns())
            .setPartialLoadEnabled(true)
            .setLoadBufferSize(2)
            .setCheckableRows(false)
            .setShowToolbar(false)
            .setRowHeight(70)
            .disableMultipleSelection(true)
            .prependClasses('market-app-tree-grid')
            .setSelectedCellCssClass('selected-sort-row')
            .setQuietErrorHandling(true)
            .setAutoLoad(false)
        );

        this.installedApplications = [];
        this.loadingStartedListeners = [];

        this.subscribeAndManageInstallClick();
        this.subscribeOnUninstallEvent();
        this.subscribeOnInstallEvent();

        this.onShown(() => {
            if (this.loading) {
                return;
            }

            this.reload().then(() => {
                this.getGrid().resizeCanvas();
            });
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.initAvailableSizeChangeListener();
            return rendered;
        });
    }

    private initAvailableSizeChangeListener() {
        ResponsiveManager.onAvailableSizeChanged(this, (item: ResponsiveItem) => {
            this.getGrid().resizeCanvas();
        });
    }

    private subscribeOnUninstallEvent() { // set status of market app to NOT_INSTALLED if it was uninstalled
        ApplicationEvent.on((event: ApplicationEvent) => {
            if (ApplicationEventType.UNINSTALLED === event.getEventType()) {
                let nodeToUpdate = this.getRoot().getNodeByDataIdFromCurrent(event.getApplicationKey().toString());
                if (!!nodeToUpdate) {
                    (nodeToUpdate.getData()).setStatus(MarketAppStatus.NOT_INSTALLED);
                    this.reload();
                }
            }
        });
    }

    private findNodeByAppUrl(url: string): TreeNode<MarketApplication> {
        let nodes: TreeNode<MarketApplication>[] = this.getGrid().getDataView().getItems();
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.getData().getLatestVersionDownloadUrl() === url) {
                return node;
            }
        }
        return null;
    }

    private subscribeOnInstallEvent() { // update status of market app
        ApplicationEvent.on((event: ApplicationEvent) => {

            let nodeToUpdate;

            if (MarketAppsTreeGrid.debug) {
                console.debug('MarketAppsTreeGrid: app event', event.getEventType(), event.getProgress());
            }

            switch (event.getEventType()) {
            case ApplicationEventType.PROGRESS:

                //TODO: send appKey from backend instead of looking for it!
                nodeToUpdate = this.findNodeByAppUrl(event.getApplicationUrl());
                if (!!nodeToUpdate) {

                    if (MarketAppsTreeGrid.debug) {
                        console.debug('MarketAppsTreeGrid: progress', event.getApplicationUrl(), event.getProgress());
                    }

                    let app = <MarketApplication>nodeToUpdate.getData();
                    app.setProgress(event.getProgress());

                    let row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
                    if (row > -1) {
                        let cell = this.getGrid().getColumnIndex('appStatus');
                        this.getGrid().updateCell(row, cell);
                    }
                }
                break;
            case ApplicationEventType.INSTALLED:

                nodeToUpdate = this.getRoot().getCurrentRoot().findNode(event.getApplicationKey().toString());
                if (!!nodeToUpdate) {

                    if (MarketAppsTreeGrid.debug) {
                        console.debug('MarketAppsTreeGrid: installed', event.getApplicationUrl(), event.getProgress());
                    }

                    const app = <MarketApplication>nodeToUpdate.getData();
                    app.setStatus(MarketAppStatus.INSTALLED);

                    new GetApplicationRequest(event.getApplicationKey(), true).sendAndParse()
                        .then((application: Application) => {
                            if (application) {
                                const marketApplication: MarketApplication = <MarketApplication>nodeToUpdate.getData();

                                if (MarketHelper.installedAppCanBeUpdated(marketApplication, application)) {
                                    marketApplication.setStatus(MarketAppStatus.OLDER_VERSION_INSTALLED);
                                } else {
                                    marketApplication.setStatus(MarketAppStatus.INSTALLED);
                                }
                                let row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
                                if (row > -1) {
                                    this.getGrid().updateRow(row);
                                }
                            }
                        });
                }
                break;
            }
        });
    }

    private subscribeAndManageInstallClick() {
        this.getGrid().subscribeOnClick((event, data) => {
            const node = this.getItem(data.row);
            const app = node.getData();
            const url = app.getLatestVersionDownloadUrl();
            const {target} = event;
            const status = app.getStatus();
            const elem = Element.fromHtmlElement(target.tagName.toLowerCase() === 'a' ? target : target.parentElement);

            if ((elem.hasClass(MarketAppStatusFormatter.statusInstallCssClass) ||
                 elem.hasClass(MarketAppStatusFormatter.statusUpdateCssClass))) {

                app.setStatus(MarketAppStatus.INSTALLING);

                let row = this.getGrid().getDataView().getRowById(node.getId());
                if (row > -1) {
                    this.getGrid().updateCell(row, this.getGrid().getColumnIndex('appStatus'));
                }

                if (MarketAppsTreeGrid.debug) {
                    console.debug('MarketAppsTreeGrid: starting install', url, elem);
                }

                new InstallUrlApplicationRequest(url)
                    .sendAndParse().then((result: ApplicationInstallResult) => {
                    // ApplicationEvent.un(progressHandler);
                    if (!result.getFailure()) {

                        elem.removeClass(MarketAppStatusFormatter.statusInstallCssClass + ' ' +
                                         MarketAppStatusFormatter.statusUpdateCssClass);
                        elem.addClass(MarketAppStatusFormatter.getStatusCssClass(MarketAppStatus.INSTALLED));

                    } else {
                        elem.removeChildren();
                        elem.appendChild(MarketAppStatusFormatter.createStatusElement(status));
                        app.setStatus(status);
                        if (row > -1) {
                            this.getGrid().updateCell(row, this.getGrid().getColumnIndex('appStatus'));
                        }
                        DefaultErrorHandler.handle(result.getFailure());
                    }

                }).catch((reason: any) => {
                    elem.removeChildren();
                    elem.appendChild(MarketAppStatusFormatter.createStatusElement(status));
                    DefaultErrorHandler.handle(reason);
                });
            }
        });
    }



    isEmptyNode(node: TreeNode<MarketApplication>): boolean {
        const data = node.getData();
        return !data.getAppKey();
    }

    sortNodeChildren(node: TreeNode<MarketApplication>) {
        this.initData(this.getRoot().getCurrentRoot().treeToList());
    }

    updateInstallApplications(installApplications: Application[]) {
        this.installedApplications = installApplications;
    }

    fetchChildren(): Q.Promise<MarketApplication[]> {
        this.notifyLoadingStarted();
        this.hideErrorPanelIfVisible();

        return MarketApplicationFetcher.fetchApps(CONFIG.xpVersion).then((data: MarketApplicationResponse) => {
            const loadedApps: MarketApplication[] = data.getApplications();
            this.updateAppsStatuses(loadedApps);
            loadedApps.sort(this.compareAppsByStatus);

            this.getRoot().getCurrentRoot().setMaxChildren(data.getMetadata().getTotalHits());

            return loadedApps;
        }).catch((reason: any) => {
            const status500Message = i18n('market.error.500');
            const defaultErrorMessage = i18n('market.error.default');
            const exception = new Exception(reason.getStatusCode() === 500 ? status500Message : defaultErrorMessage);
            DefaultErrorHandler.handle(exception);
            return [];
        });
    }

    private hideErrorPanelIfVisible() {
        if (this.getErrorPanel().isVisible()) {
            this.hideErrorPanel();
            this.mask();
        }
    }

    private updateAppsStatuses(applications: MarketApplication[]) {
        applications.filter(app => !!app.getLatestVersion()).forEach(this.updateAppStatus.bind(this));
    }

    private updateAppStatus(marketApp: MarketApplication) {
        for (let i = 0; i < this.installedApplications.length; i++) {
            if (marketApp.getAppKey().equals(this.installedApplications[i].getApplicationKey())) {
                if (MarketAppsTreeGridHelper.installedAppCanBeUpdated(marketApp, this.installedApplications[i])) {
                    marketApp.setStatus(MarketAppStatus.OLDER_VERSION_INSTALLED);
                } else {
                    marketApp.setStatus(MarketAppStatus.INSTALLED);
                }
                break;
            }
        }
    }

    private compareAppsByStatus(app1: MarketApplication, app2: MarketApplication): number {
        if ((app1.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) &&
            (app2.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED)) {
            return app1.getDisplayName().localeCompare(app2.getDisplayName());
        }

        if (app1.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
            return -1;
        }

        return 1;
    }

    initData(nodes: TreeNode<MarketApplication>[]) {
        const items = this.nodesFilter ? this.nodesFilter(nodes) : nodes;
        super.initData(items);
        this.getGrid().getCanvasNode().style.height = (70 * items.length + 'px');
        this.getGrid().resizeCanvas();
    }

    getDataId(data: MarketApplication): string {
        return data.getAppKey() ? data.getAppKey().toString() : '';
    }

    setNodesFilter(filterFunc: (nodes: TreeNode<MarketApplication>[]) => TreeNode<MarketApplication>[]) {
        this.nodesFilter = filterFunc;
    }

    isDataViewEmpty(): boolean {
        return this.getGrid().getDataView().getLength() === 0;
    }

    onLoadingStarted(listener: () => void) {
        this.loadingStartedListeners.push(listener);
    }

    unLoadingStarted(listener: () => void) {
        this.loadingStartedListeners = this.loadingStartedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyLoadingStarted() {
        this.loadingStartedListeners.forEach((listener) => {
            listener();
        });
    }
}
