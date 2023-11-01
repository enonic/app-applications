import Q from 'q';
import {MarketApplicationFetcher} from '../../resource/MarketApplicationFetcher';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {TreeGrid} from '@enonic/lib-admin-ui/ui/treegrid/TreeGrid';
import {MarketApplication, MarketAppStatus, MarketAppStatusFormatter} from '@enonic/lib-admin-ui/application/MarketApplication';
import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {ResponsiveItem} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveItem';
import {ResponsiveManager} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveManager';
import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Exception} from '@enonic/lib-admin-ui/Exception';
import {MarketApplicationResponse} from '@enonic/lib-admin-ui/application/MarketApplicationResponse';
import {MarketHelper} from '@enonic/lib-admin-ui/application/MarketHelper';
import {MarketAppsTreeGridHelper} from './MarketAppsTreeGridHelper';
import {InstallUrlApplicationRequest} from '../../resource/InstallUrlApplicationRequest';
import {ApplicationInstallResult} from '../../resource/ApplicationInstallResult';
import {KeyHelper} from '@enonic/lib-admin-ui/ui/KeyHelper';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';

interface GridEventData {
    row: number;
}

interface RowCountChangedEventData
    extends Slick.EventData {
    previous: number;
    current: number;
}

export type MarketAppsTreeGridFilter = (item: TreeNode<MarketApplication>, args: MarketAppsTreeGridFilterArgs) => boolean;

export interface MarketAppsTreeGridFilterArgs {
    searchString: string
}

export class MarketAppsTreeGrid
    extends TreeGrid<MarketApplication> {

    private installedApplications: Application[];

    public static debug: boolean = false;

    private loadingStartedListeners: (() => void)[];

    private updateConfirmationDialog?: ConfirmationDialog;

    constructor(filter: MarketAppsTreeGridFilter) {

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

        this.getGridData().setFilter(filter);

        this.installedApplications = [];
        this.loadingStartedListeners = [];

        this.initListeners();
    }

    private initListeners(): void {
        this.subscribeAndManageInstallClick();
        this.subscribeOnApplicationEvents();
        this.onShown(() => {
            if (!this.loading) {
                this.getCurrentData();
                const marketApps = this.getRoot().getAllNodes().map(node => node.getData());
                this.updateAppsStatuses(marketApps);
            }
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

    private findNodeByAppUrl(url: string): TreeNode<MarketApplication> {
        const nodes: TreeNode<MarketApplication>[] = this.getGrid().getDataView().getItems();
        for (const node of nodes) {
            if (node.getData().getLatestVersionDownloadUrl() === url) {
                return node;
            }
        }
        return null;
    }

    private subscribeOnApplicationEvents() { // update status of market app
        ApplicationEvent.on((event: ApplicationEvent) => {

            if (MarketAppsTreeGrid.debug) {
                console.debug('MarketAppsTreeGrid: app event', event.getEventType(), event.getProgress());
            }

            switch (event.getEventType()) {
            case ApplicationEventType.PROGRESS:
                this.handleApplicationProgress(event.getApplicationUrl(), event.getProgress());
                break;
            case ApplicationEventType.INSTALLED:
                // Since Market App ID and Application key may differ, handle it in InstallUrlApplicationRequest response
                break;
            case ApplicationEventType.UNINSTALLED:
                // No need to reload grid on uninstall event to update state
                break;
            }
        });
    }

    private handleApplicationProgress(appUrl: string, progress: number): void {
        // TODO: send appKey from backend instead of looking for it!
        const nodeToUpdate = this.findNodeByAppUrl(appUrl);
        if (!nodeToUpdate) {
            return;
        }

        if (MarketAppsTreeGrid.debug) {
            console.debug(`MarketAppsTreeGrid: progress ${progress}`);
        }

        let app = nodeToUpdate.getData();
        app.setProgress(progress);

        let row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
        if (row > -1) {
            let cell = this.getGrid().getColumnIndex('appStatus');
            this.getGrid().updateCell(row, cell);
        }
    }

    private installAppByRow(row: number): void {
        const marketApplication: MarketApplication = this.getItem(row)?.getData();

        if (!marketApplication) {
            return;
        }

        if (this.isMajorVersionUpdate(marketApplication)) {
            this.showUpdateConfirmationDialog(marketApplication, row);
        } else {
            this.doInstallApp(marketApplication, row);
        }
    }

    private isMajorVersionUpdate(marketApplication: MarketApplication): boolean {
        const installedApp: Application =
            this.installedApplications.find((app: Application) => app.getApplicationKey().equals(marketApplication.getAppKey()));

        if (!installedApp) {
            return false;
        }

        const installedAppMajorVersion: number = +installedApp.getVersion().split('.')[0];
        const marketAppMajorVersion: number = +marketApplication.getLatestVersion().split('.')[0];

        return marketAppMajorVersion > installedAppMajorVersion;
    }

    private showUpdateConfirmationDialog(marketApplication: MarketApplication, row: number): void {
        const installedApp: Application =
            this.installedApplications.find((app: Application) => app.getApplicationKey().equals(marketApplication.getAppKey()));

        if (!this.updateConfirmationDialog) {
            this.updateConfirmationDialog = new ConfirmationDialog();
            this.updateConfirmationDialog.addClass('confirm-upgrade-dialog');
        }

        this.updateConfirmationDialog.setHeading(
            i18n('dialog.confirm.update.title',
                `${marketApplication.getDisplayName()} ${installedApp.getVersion()}`,
                marketApplication.getLatestVersion())
        );
        this.updateConfirmationDialog.setQuestion(this.generateConfirmationQuestion(marketApplication), false);
        this.updateConfirmationDialog.setYesCallback(() => this.doInstallApp(marketApplication, row));
        this.updateConfirmationDialog.open();
    }

    private generateConfirmationQuestion(marketApplication: MarketApplication): string {
        const linkTitle: string = i18n('dialog.confirm.update.question.link');
        const linkHtml: string = `<a href="${marketApplication.getUrl()}" target="_blank">${linkTitle}</a>`;
        const part1: string = i18n('dialog.confirm.update.question.part1', marketApplication.getDisplayName());
        const part2: string = i18n('dialog.confirm.update.question.part2');
        return `${part1} ${linkHtml} ${part2}`;
    }

    private doInstallApp(marketApplication: MarketApplication, row: number): void {
        const oldStatus: MarketAppStatus = marketApplication.getStatus();
        marketApplication.setStatus(MarketAppStatus.INSTALLING);
        this.getGrid().updateRow(row);

        void new InstallUrlApplicationRequest(marketApplication.getLatestVersionDownloadUrl())
            .sendAndParse().then((result: ApplicationInstallResult) => {
                if (result.getFailure()) {
                    throw result.getFailure();
                }

                const status: MarketAppStatus = MarketHelper.installedAppCanBeUpdated(marketApplication, result.getApplication())
                                                ? MarketAppStatus.OLDER_VERSION_INSTALLED
                                                : MarketAppStatus.INSTALLED;
                marketApplication.setStatus(status);
            }).catch((reason) => {
                marketApplication.setStatus(oldStatus);
                DefaultErrorHandler.handle(reason);
            }).finally(() => {
                this.getGrid().updateRow(row);
            });
    }

    private subscribeAndManageInstallClick() {
        this.getGrid().subscribeOnClick(({target}, data) => {
            const elem: Element = Element.fromHtmlElement(target.tagName.toLowerCase() === 'a' ? target : target.parentElement);
            const canInstall = elem.hasClass(MarketAppStatusFormatter.statusInstallCssClass) ||
                               elem.hasClass(MarketAppStatusFormatter.statusUpdateCssClass);
            if (!canInstall) {
                return;
            }

            const {row} = (data as GridEventData);
            this.installAppByRow(row);
        });

        this.getGrid().setOnKeyDown((event) => {
            if (KeyHelper.isEnterKey(event)) {
                if (event.target.tagName.toLowerCase() === 'a') {
                    event.target.click();
                }
            }
        });
    }

    isEmptyNode(node: TreeNode<MarketApplication>): boolean {
        const data = node.getData();
        return !data.getAppKey();
    }

    updateInstallApplications(installApplications: Application[]) {
        this.installedApplications = installApplications;

        const apps = this.updateAndSortApps(this.getDefaultData());

        super.initData(this.dataToTreeNodes(apps, this.getRoot().getDefaultRoot()));
    }

    fetchChildren(): Q.Promise<MarketApplication[]> {
        this.notifyLoadingStarted();
        this.hideErrorPanelIfVisible();

        return MarketApplicationFetcher.fetchApps().then((data: MarketApplicationResponse) => {
            const totalHits = data.getMetadata().getTotalHits();
            this.getRoot().getCurrentRoot().setMaxChildren(totalHits);
            return this.updateAndSortApps(data.getApplications());
        }).catch((reason) => {
            const status500Message = i18n('market.error.500');
            const defaultErrorMessage = i18n('market.error.default');
            const exception = new Exception(reason.getStatusCode() === 500 ? status500Message : defaultErrorMessage);
            DefaultErrorHandler.handle(exception);
            return [];
        });
    }

    private updateAndSortApps(apps: MarketApplication[]): MarketApplication[] {
        this.updateAppsStatuses(apps);
        return apps.sort(MarketAppsTreeGridHelper.compareAppsByStatusAndDisplayName);
    }

    private hideErrorPanelIfVisible() {
        if (this.getErrorPanel().isVisible()) {
            this.hideErrorPanel();
            this.mask();
        }
    }

    private updateAppsStatuses(applications: MarketApplication[]) {
        const marketApps = applications.filter(marketApp => !!marketApp.getLatestVersion());
        const installedApps = this.installedApplications.slice();
        const installedAppsIds = installedApps.map(app => app.getApplicationKey().toString());
        const getInstalledAppIndex = (marketApp: MarketApplication) => installedAppsIds.indexOf(marketApp.getAppKey().toString());

        marketApps.forEach(marketApp => {
            const installedAppIndex = getInstalledAppIndex(marketApp);
            const isMarketAppInstalled = installedAppIndex >= 0;
            if (isMarketAppInstalled) {
                if (MarketAppsTreeGridHelper.installedAppCanBeUpdated(marketApp, installedApps[installedAppIndex])) {
                    marketApp.setStatus(MarketAppStatus.OLDER_VERSION_INSTALLED);
                } else {
                    marketApp.setStatus(MarketAppStatus.INSTALLED);
                }
            } else if (marketApp.getStatus() === MarketAppStatus.INSTALLED ||
                       marketApp.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
                marketApp.setStatus(MarketAppStatus.NOT_INSTALLED);
            }
        });
    }

    initData(nodes: TreeNode<MarketApplication>[]) {
        super.initData(nodes);
        this.getGrid().getCanvasNode().style.height = (`${70 * nodes.length}px`);
        this.getGrid().resizeCanvas();
    }

    getDataId(data: MarketApplication): string {
        return data.getAppKey() ? data.getAppKey().toString() : '';
    }

    setFilterArgs(args: MarketAppsTreeGridFilterArgs) {
        this.getGridData().setFilterArgs(args);
        this.getGridData().refresh();
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

    onRowCountChanged(listener: (eventData: Slick.EventData, args: RowCountChangedEventData) => void): void {
        this.getGridData().onRowCountChanged(listener);
    }
}
