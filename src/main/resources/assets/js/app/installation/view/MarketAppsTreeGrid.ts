import {MarketApplicationFetcher} from '../../resource/MarketApplicationFetcher';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Exception} from '@enonic/lib-admin-ui/Exception';
import {MarketAppsTreeGridHelper} from './MarketAppsTreeGridHelper';
import {InstallUrlApplicationRequest} from '../../resource/InstallUrlApplicationRequest';
import {ApplicationInstallResult} from '../../resource/ApplicationInstallResult';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {MarketListViewer} from './MarketListViewer';
import {MarketApplication, MarketAppStatus} from '../../MarketApplication';
import {MarketApplicationResponse} from '../../MarketApplicationResponse';
import {MarketHelper} from '../../MarketHelper';

enum MarketAppGridState {
    NOT_LOADED, LOADING, LOADED
}

export class MarketAppsTreeGrid
    extends ListBox<MarketApplication> {

    private installedApplications: Application[];

    private installedAppsWereSet: boolean;

    public static debug: boolean = false;

    private loadingStartedListeners: (() => void)[];

    private loadingFinishedListeners: (() => void)[];

    private updateConfirmationDialog?: ConfirmationDialog;

    private state: MarketAppGridState;

    private searchString: string;

    private marketApps: MarketApplication[];

    constructor() {
        super('market-app-tree-grid');

        this.state = MarketAppGridState.NOT_LOADED;
        this.installedAppsWereSet = false;
        this.marketApps = [];
        this.installedApplications = [];
        this.loadingStartedListeners = [];
        this.loadingFinishedListeners = [];

        this.initListeners();
    }

    private initListeners(): void {
        this.subscribeOnApplicationEvents();
    }

    protected createItemView(item: MarketApplication, readOnly: boolean): MarketListViewer {
        const viewer = new MarketListViewer();
        viewer.setItem(item);

        viewer.onActionButtonClicked(() => {
            if (item.getStatus() === MarketAppStatus.NOT_INSTALLED || item.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
                this.installApp(item);
            }
        });

        return viewer;
    }

    protected getItemId(item: MarketApplication): string {
        return item.getId();
    }

    private findNodeByAppUrl(url: string): MarketApplication {
        return this.getItems().find((app: MarketApplication) => app.getLatestVersionDownloadUrl() === url);
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
        const app = this.findNodeByAppUrl(appUrl);

        if (!app) {
            return;
        }

        if (MarketAppsTreeGrid.debug) {
            console.debug(`MarketAppsTreeGrid: progress ${progress}`);
        }

        app.setProgress(progress);
        const viewer: MarketListViewer = this.getItemView(app) as MarketListViewer;
        viewer?.setItem(app);
    }

    private installApp(marketApplication: MarketApplication): void {
        if (this.isMajorVersionUpdate(marketApplication)) {
            this.showUpdateConfirmationDialog(marketApplication);
        } else {
            this.doInstallApp(marketApplication);
        }
    }

    private isMajorVersionUpdate(marketApplication: MarketApplication): boolean {
        const installedApp = this.getInstalledAppByMarketApp(marketApplication);

        if (!installedApp) {
            return false;
        }

        const installedAppMajorVersion: number = +installedApp.getVersion().split('.')[0];
        const marketAppMajorVersion: number = +marketApplication.getLatestVersion().split('.')[0];

        return marketAppMajorVersion > installedAppMajorVersion;
    }

    private showUpdateConfirmationDialog(marketApplication: MarketApplication): void {
        const installedApp = this.getInstalledAppByMarketApp(marketApplication);

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
        this.updateConfirmationDialog.setYesCallback(() => this.doInstallApp(marketApplication));
        this.updateConfirmationDialog.open();
    }

    private generateConfirmationQuestion(marketApplication: MarketApplication): string {
        const linkTitle: string = i18n('dialog.confirm.update.question.link');
        const linkHtml: string = `<a href="${marketApplication.getUrl()}" target="_blank">${linkTitle}</a>`;
        const part1: string = i18n('dialog.confirm.update.question.part1', marketApplication.getDisplayName());
        const part2: string = i18n('dialog.confirm.update.question.part2');
        return `${part1} ${linkHtml} ${part2}`;
    }

    private doInstallApp(marketApplication: MarketApplication): void {
        const oldStatus: MarketAppStatus = marketApplication.getStatus();
        marketApplication.setStatus(MarketAppStatus.INSTALLING);
        this.replaceItems(marketApplication);

        void new InstallUrlApplicationRequest(marketApplication.getLatestVersionDownloadUrl())
            .sendAndParse().then((result: ApplicationInstallResult) => {
                if (result.getFailure()) {
                    throw Error(result.getFailure());
                }

                const status: MarketAppStatus = MarketHelper.installedAppCanBeUpdated(marketApplication, result.getApplication())
                                                ? MarketAppStatus.OLDER_VERSION_INSTALLED
                                                : MarketAppStatus.INSTALLED;
                marketApplication.setStatus(status);
            }).catch((reason) => {
                marketApplication.setStatus(oldStatus);
                DefaultErrorHandler.handle(reason);
            });
    }

    setInstalledApplications(installApplications: Application[]): void {
        this.installedApplications = installApplications;

        if (!this.installedAppsWereSet && this.state === MarketAppGridState.LOADED) {
            this.setItemsIfDataReady();
        }

        this.installedAppsWereSet = true;
    }

    updateAppInstalled(app: Application): void {
        this.replaceInstalledApp(app);
        this.updateApp(app);
    }

    updateAppUninstalled(uninstalled: Application): void {
        const uninstalledKey = uninstalled.getApplicationKey().toString();
        this.installedApplications =
            this.installedApplications.filter((app: Application) => app.getApplicationKey().toString() !== uninstalledKey);
        this.updateApp(uninstalled);
    }

    private updateApp(app: Application): void {
        this.updateAndSortApps(this.marketApps);
        const marketApp = this.marketApps.find((marketApp: MarketApplication) => this.appsHaveMatchingKeys(marketApp, app));

        if (marketApp) {
            this.replaceItems(marketApp);
        }
    }

    private appsHaveMatchingKeys(marketApp: MarketApplication, installedApp: Application): boolean {
        return marketApp.getAppKey().equals(installedApp.getApplicationKey()) ||
               this.replaceDashesWithDotsInMarketApp(marketApp) === installedApp.getApplicationKey().toString();
    }

    private replaceInstalledApp(installedApp: Application): void {
        const index = this.installedApplications.findIndex(
            (app: Application) => app.getApplicationKey().equals(installedApp.getApplicationKey()));

        if (index > -1) {
            this.installedApplications.splice(index, 1, installedApp);
        } else {
            this.installedApplications.push(installedApp);
        }
    }

    load(): void {
        this.clearItems();
        this.state = MarketAppGridState.LOADING;
        this.notifyLoadingStarted();

        MarketApplicationFetcher.fetchApps().then((data: MarketApplicationResponse) => {
            this.state = MarketAppGridState.LOADED;
            this.marketApps = data.getApplications();

            if (this.installedAppsWereSet) {
                this.setItemsIfDataReady();
            }
        }).catch((reason) => {
            this.state = MarketAppGridState.NOT_LOADED;
            const status500Message = i18n('market.error.500');
            const defaultErrorMessage = i18n('market.error.default');
            const exception = new Exception(reason.getStatusCode() === 500 ? status500Message : defaultErrorMessage);
            DefaultErrorHandler.handle(exception);
            return [];
        }).finally(() => {
            this.notifyLoadingFinished();
        });
    }

    private updateAndSortApps(apps: MarketApplication[]): MarketApplication[] {
        this.updateAppsStatuses(apps);
        return apps.sort(MarketAppsTreeGridHelper.compareAppsByStatusAndDisplayName);
    }

    private updateAppsStatuses(applications: MarketApplication[]): void {
        const marketApps = applications.filter(marketApp => !!marketApp.getLatestVersion());

        marketApps.forEach(marketApp => {
            const installedApp = this.getInstalledAppByMarketApp(marketApp);
            marketApp.setStatus(this.getAppStatusForInstallDialog(marketApp, installedApp));
        });
    }

    private getAppStatusForInstallDialog(marketApp: MarketApplication, installedApp?: Application): MarketAppStatus {
        if (installedApp) {
            if (MarketAppsTreeGridHelper.installedAppCanBeUpdated(marketApp, installedApp)) {
               return MarketAppStatus.OLDER_VERSION_INSTALLED;
            }

            return MarketAppStatus.INSTALLED;
        }

        if (marketApp.getStatus() === MarketAppStatus.INSTALLED ||
            marketApp.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
            return MarketAppStatus.NOT_INSTALLED;
        }

        return marketApp.getStatus();
    }

    private getInstalledAppByMarketApp(marketApp: MarketApplication): Application | undefined {
        const marketAppNameNoDashes = this.replaceDashesWithDotsInMarketApp(marketApp);
        const marketAppKey = marketApp.getAppKey();

        return this.installedApplications.find(
            (app: Application) => app.getApplicationKey().equals(marketAppKey) || app.getApplicationKey().toString() ===
                                  marketAppNameNoDashes);
    }

    private replaceDashesWithDotsInMarketApp(marketApp: MarketApplication): string {
        return marketApp.getAppKey().toString().replace(/-/g, '.');
    }

    private filterItemsFunc(marketApp: MarketApplication): boolean {
        if (!this.searchString || marketApp.isEmpty()) {
            // true for an empty app because it is the empty node that triggers loading
            return true;
        }

        const inputValue = this.searchString?.toLowerCase() || '';
        const displayName = marketApp.getDisplayName().toLowerCase();
        const description = marketApp.getDescription().toLowerCase();

        return displayName.indexOf(inputValue) >= 0 || description.indexOf(inputValue) >= 0;
    }

    setSearchString(searchString: string): void {
        this.searchString = searchString;
        this.filterItems();
    }

    private filterItems(): void {
        this.removeChildren();

        this.itemViews.forEach((viewer: MarketListViewer, id: string) => {
            const item = this.getItem(id);

            if (item) {
                const isToBeShown = this.filterItemsFunc(item);

                if (isToBeShown) {
                    this.appendChild(viewer);
                }
            }
        });
    }

    // to be invoked when market apps and installed apps are both set, to create items in list, no need to rerender the list after,
    // just update, add or delete items from it
    private setItemsIfDataReady(): void {
        this.updateAndSortApps(this.marketApps);
        this.setItems(this.marketApps);
    }

    protected updateItemView(itemView: MarketListViewer, item: MarketApplication) {
        itemView.setItem(item);
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

    onLoadingFinished(listener: () => void) {
        this.loadingFinishedListeners.push(listener);
    }

    unLoadingFinished(listener: () => void) {
        this.loadingFinishedListeners = this.loadingFinishedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyLoadingFinished() {
        this.loadingFinishedListeners.forEach((listener) => {
            listener();
        });
    }
}
