import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {ApplicationBrowseItemPanel} from './ApplicationBrowseItemPanel';
import {StopApplicationEvent} from './StopApplicationEvent';
import {StartApplicationEvent} from './StartApplicationEvent';
import {UninstallApplicationEvent} from './UninstallApplicationEvent';
import {ApplicationUploadStartedEvent} from './ApplicationUploadStartedEvent';
import {ApplicationActionRequest} from '../resource/ApplicationActionRequest';
import {BrowsePanel} from 'lib-admin-ui/app/browse/BrowsePanel';
import {BrowseItem} from 'lib-admin-ui/app/browse/BrowseItem';
import {Application, ApplicationUploadMock} from 'lib-admin-ui/application/Application';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {DataChangedEvent, DataChangedType} from 'lib-admin-ui/ui/treegrid/DataChangedEvent';
import {ApplicationEvent, ApplicationEventType} from 'lib-admin-ui/application/ApplicationEvent';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ServerEventsConnection} from 'lib-admin-ui/event/ServerEventsConnection';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {TreeGridActions} from 'lib-admin-ui/ui/treegrid/actions/TreeGridActions';

declare const CONFIG;

export class ApplicationBrowsePanel
    extends BrowsePanel<Application> {

    protected treeGrid: ApplicationTreeGrid;

    constructor() {
        super();

        this.registerEvents();
    }

    protected createToolbar(): Toolbar {
        const toolbar: Toolbar = new Toolbar();
        const readonlyMode: boolean = CONFIG.readonlyMode === 'true';

        if (!readonlyMode) {
            const browseActions: ApplicationBrowseActions = <ApplicationBrowseActions> this.treeGrid.getContextMenu().getActions();
            toolbar.addAction(browseActions.INSTALL_APPLICATION);
            toolbar.addAction(browseActions.UNINSTALL_APPLICATION);
            toolbar.addAction(browseActions.START_APPLICATION);
            toolbar.addAction(browseActions.STOP_APPLICATION);
        }

        return toolbar;
    }

    protected createTreeGrid(): ApplicationTreeGrid {
        return new ApplicationTreeGrid();
    }

    protected createBrowseItemPanel(): ApplicationBrowseItemPanel {
        return new ApplicationBrowseItemPanel();
    }

    protected getBrowseActions(): TreeGridActions<Application> {
        const readonlyMode: boolean = CONFIG.readonlyMode === 'true';
        return readonlyMode ? null : super.getBrowseActions();
    }

    dataToBrowseItem(data: Application): BrowseItem<Application> | null {
        const browseItem: BrowseItem<Application> =
            <BrowseItem<Application>>new BrowseItem<Application>(data)
                .setId(data.getId())
                .setDisplayName(data.getDisplayName())
                .setPath(data.getName());

        if (!ObjectHelper.iFrameSafeInstanceOf(data, ApplicationUploadMock)) {
            browseItem.setIconUrl(data.getIconUrl());
        }

        return browseItem;
    }

    private sendApplicationActionRequest(action: string, applications: Application[]) {
        const applicationKeys: ApplicationKey[] = ApplicationKey.fromApplications(applications);
        new ApplicationActionRequest(applicationKeys, action)
            .sendAndParse()
            .catch(DefaultErrorHandler.handle).done();
    }

    private registerEvents() {
        this.treeGrid.onDataChanged((event: DataChangedEvent<Application>) => {
            if (event.getType() === DataChangedType.UPDATED) {
                this.handleTreeGridUpdated(event);
            }
        });

        StopApplicationEvent.on((event: StopApplicationEvent) =>
            this.sendApplicationActionRequest('stop', event.getApplications()));
        StartApplicationEvent.on((event: StartApplicationEvent) =>
            this.sendApplicationActionRequest('start', event.getApplications()));
        UninstallApplicationEvent.on((event: UninstallApplicationEvent) =>
            this.sendApplicationActionRequest('uninstall', event.getApplications()));

        ApplicationEvent.on((event: ApplicationEvent) => {
            this.handleAppEvent(event);
        });

        ApplicationUploadStartedEvent.on((event) => {
            this.handleNewAppUpload(event);
        });
    }

    private handleTreeGridUpdated(event: DataChangedEvent<Application>) {
        const browseItems: BrowseItem<Application>[] = this.dataItemsToBrowseItems(event.getTreeNodes().map(node => node.getData()));
        this.getBrowseItemPanel().updateItems(browseItems);
        this.getBrowseItemPanel().updatePreviewPanel();
        this.updateBrowseActions(this.dataItemsToBrowseItems(this.treeGrid.getFullSelection()));
    }

    private handleAppEvent(event: ApplicationEvent) {
        if (event.isSystemApplication()) {
            return;
        }

        if (ApplicationEventType.INSTALLED === event.getEventType()) {
            this.handleAppInstalledEvent(event);
        } else if (ApplicationEventType.UNINSTALLED === event.getEventType()) {
            this.handleAppUninstalledEvent(event);
        } else if (ApplicationEventType.STOPPED === event.getEventType()) {
            this.handleAppStoppedEvent(event);
        } else if (event.isNeedToUpdateApplication()) {
            this.treeGrid.updateApplicationNode(event.getApplicationKey());
        }
    }

    private handleAppInstalledEvent(event: ApplicationEvent) {
        this.treeGrid.placeApplicationNode(event.getApplicationKey()).then(() => {
            setTimeout(() => { // timeout lets grid to remove UploadMockNode so that its not counted in the toolbar
                const installedApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
                const installedAppName: string = installedApp ? installedApp.getDisplayName() : event.getApplicationKey().toString();
                showFeedback(i18n('notify.installed', installedAppName));
                this.treeGrid.refresh();
            }, 200);
        });
    }

    private handleAppUninstalledEvent(event: ApplicationEvent) {
        const uninstalledApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
        const uninstalledAppName: string = uninstalledApp ? uninstalledApp.getDisplayName() : event.getApplicationKey().toString();
        showFeedback(i18n('notify.uninstalled', uninstalledAppName));
        this.treeGrid.deleteApplicationNode(event.getApplicationKey());
    }

    private handleAppStoppedEvent(event: ApplicationEvent) {
        setTimeout(() => { // as uninstall usually follows stop event, lets wait to check if app still exists
            const stoppedApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
            // seems to be present in the grid and xp is running
            if (stoppedApp && ServerEventsConnection.get().isConnected()) {
                this.treeGrid.updateApplicationNode(event.getApplicationKey());
            }
        }, 400);
    }

    private handleNewAppUpload(event: ApplicationUploadStartedEvent) {
        event.getUploadItems().forEach((item: UploadItem<Application>) => {
            this.treeGrid.appendUploadNode(item);
        });
    }
}
