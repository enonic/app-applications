import {ApplicationBrowseToolbar} from './ApplicationBrowseToolbar';
import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {ApplicationBrowseItemPanel} from './ApplicationBrowseItemPanel';
import {StopApplicationEvent} from './StopApplicationEvent';
import {StartApplicationEvent} from './StartApplicationEvent';
import {UninstallApplicationEvent} from './UninstallApplicationEvent';
import {ApplicationUploadStartedEvent} from './ApplicationUploadStartedEvent';
import {ApplicationActionRequest} from '../resource/ApplicationActionRequest';
import ApplicationKey = api.application.ApplicationKey;
import Application = api.application.Application;
import TreeNode = api.ui.treegrid.TreeNode;
import BrowseItem = api.app.browse.BrowseItem;
import ApplicationEvent = api.application.ApplicationEvent;
import ApplicationEventType = api.application.ApplicationEventType;
import ServerEventsConnection = api.event.ServerEventsConnection;
import ApplicationUploadMock = api.application.ApplicationUploadMock;
import i18n = api.util.i18n;
import DataChangedType = api.ui.treegrid.DataChangedType;
import DataChangedEvent = api.ui.treegrid.DataChangedEvent;

export class ApplicationBrowsePanel extends api.app.browse.BrowsePanel<Application> {

    protected treeGrid: ApplicationTreeGrid;

    constructor() {
        super();

        this.registerEvents();
    }

    protected createToolbar(): ApplicationBrowseToolbar {
        const browseActions: ApplicationBrowseActions = <ApplicationBrowseActions> this.treeGrid.getContextMenu().getActions();

        return new ApplicationBrowseToolbar(browseActions);
    }

    protected createTreeGrid(): ApplicationTreeGrid {
        return new ApplicationTreeGrid();
    }

    protected createBrowseItemPanel(): ApplicationBrowseItemPanel {
        return new ApplicationBrowseItemPanel();
    }

    treeNodeToBrowseItem(node: TreeNode<Application>): BrowseItem<Application>|null {

        if (!node || !node.getData()) {
            return null;
        }

        const nodeData: Application = node.getData();
        const browseItem: BrowseItem<Application> =
            <BrowseItem<Application>>new BrowseItem<Application>(nodeData)
            .setId(nodeData.getId())
            .setDisplayName(nodeData.getDisplayName())
            .setPath(nodeData.getName());

        if (!api.ObjectHelper.iFrameSafeInstanceOf(nodeData, ApplicationUploadMock)) {
            browseItem.setIconUrl(nodeData.getIconUrl());
        }

        return browseItem;
    }

    treeNodesToBrowseItems(nodes: TreeNode<Application>[]): BrowseItem<Application>[] {
        const browseItems: BrowseItem<Application>[] = [];

        // do not proceed duplicated content. still, it can be selected
        nodes.forEach((node: TreeNode<Application>, index: number) => {
            let i = 0;
            for (; i <= index; i++) {
                if (nodes[i].getData().getId() === node.getData().getId()) {
                    break;
                }
            }
            if (i === index) {
                const item = this.treeNodeToBrowseItem(node);
                if (item) {
                    browseItems.push(item);
                }
            }
        });
        return browseItems;
    }

    private sendApplicationActionRequest(action: string, applications: Application[]) {
        const applicationKeys: ApplicationKey[] = ApplicationKey.fromApplications(applications);
        new ApplicationActionRequest(applicationKeys, action)
            .sendAndParse()
            .catch(api.DefaultErrorHandler.handle).done();
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
        const browseItems: BrowseItem<Application>[] = this.treeNodesToBrowseItems(event.getTreeNodes());
        this.getBrowseItemPanel().updateItems(browseItems);
        this.getBrowseItemPanel().updatePreviewPanel();
        this.getBrowseActions().updateActionsEnabledState(this.treeNodesToBrowseItems(this.treeGrid.getRoot().getFullSelection()));
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
                this.treeGrid.triggerSelectionChangedListeners();
                const installedApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
                const installedAppName: string = installedApp ? installedApp.getDisplayName() : event.getApplicationKey().toString();
                api.notify.showFeedback(i18n('notify.installed', installedAppName));
                this.treeGrid.refresh();
            }, 200);
        });
    }

    private handleAppUninstalledEvent(event: ApplicationEvent) {
        const uninstalledApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
        const uninstalledAppName: string = uninstalledApp ? uninstalledApp.getDisplayName() : event.getApplicationKey().toString();
        api.notify.showFeedback(i18n('notify.uninstalled', uninstalledAppName));
        this.treeGrid.deleteApplicationNode(event.getApplicationKey());
    }

    private handleAppStoppedEvent(event: ApplicationEvent) {
        setTimeout(() => { // as uninstall usually follows stop event, lets wait to check if app still exists
            const stoppedApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
            // seems to be present in the grid and xp is running
            if (stoppedApp && ServerEventsConnection.getInstance().isConnected()) {
                this.treeGrid.updateApplicationNode(event.getApplicationKey());
            }
        }, 400);
    }

    private handleNewAppUpload(event: ApplicationUploadStartedEvent) {
        event.getUploadItems().forEach((item: api.ui.uploader.UploadItem<Application>) => {
            this.treeGrid.appendUploadNode(item);
        });
    }
}
