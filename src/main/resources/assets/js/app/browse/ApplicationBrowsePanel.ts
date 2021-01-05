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
import {TreeGridActions} from 'lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ApplicationEvent, ApplicationEventType} from 'lib-admin-ui/application/ApplicationEvent';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ServerEventsConnection} from 'lib-admin-ui/event/ServerEventsConnection';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';

declare const CONFIG;

export class ApplicationBrowsePanel
    extends BrowsePanel {

    protected treeGrid: ApplicationTreeGrid;

    constructor() {
        super();

        this.addClass('application-browse-panel');
        this.registerEvents();
    }

    protected createToolbar(): Toolbar {
        const toolbar: Toolbar = new Toolbar();
        const readonlyMode: boolean = CONFIG.readonlyMode === 'true';

        toolbar.toggleClass('read-only', readonlyMode);
        if (readonlyMode) {
            const spanEl = SpanEl.fromText(i18n('field.managed'), 'main-text');
            const spanEl2 = SpanEl.fromText(i18n('field.managed.help'), 'secondary-text');
            const divEl = new DivEl('readonly-help').appendChildren(spanEl, spanEl2);
            toolbar.appendChild(divEl);
        } else {
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

    private sendApplicationActionRequest(action: string, applications: Application[]) {
        const applicationKeys: ApplicationKey[] = ApplicationKey.fromApplications(applications);
        new ApplicationActionRequest(applicationKeys, action)
            .sendAndParse()
            .catch(DefaultErrorHandler.handle).done();
    }

    private registerEvents() {
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
        } else if (event.isNeedToUpdateApplication() && event.getApplicationKey()) {
            this.treeGrid.updateApplicationNode(event.getApplicationKey());
        }
    }

    private handleAppInstalledEvent(event: ApplicationEvent) {
        this.treeGrid.placeApplicationNode(event.getApplicationKey()).then(() => {
            setTimeout(() => { // timeout lets grid to remove UploadMockNode so that its not counted in the toolbar
                const installedApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
                const installedAppName: string = installedApp ? installedApp.getDisplayName() : event.getApplicationKey().toString();
                showFeedback(i18n('notify.installed', installedAppName));
                this.treeGrid.reload();
            }, 200);
        });
    }

    private handleAppUninstalledEvent(event: ApplicationEvent) {
        const uninstalledApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
        const uninstalledAppName: string = uninstalledApp ? uninstalledApp.getDisplayName() : event.getApplicationKey().toString();
        showFeedback(i18n('notify.uninstalled', uninstalledAppName));
        this.treeGrid.deleteNodeByDataId(event.getApplicationKey().toString());
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
