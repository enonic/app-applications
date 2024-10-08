import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {ApplicationBrowseItemPanel} from './ApplicationBrowseItemPanel';
import {StopApplicationEvent} from './StopApplicationEvent';
import {StartApplicationEvent} from './StartApplicationEvent';
import {UninstallApplicationEvent} from './UninstallApplicationEvent';
import {ApplicationUploadStartedEvent} from './ApplicationUploadStartedEvent';
import {ApplicationActionRequest} from '../resource/ApplicationActionRequest';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ServerEventsConnection} from '@enonic/lib-admin-ui/event/ServerEventsConnection';
import {UploadItem} from '@enonic/lib-admin-ui/ui/uploader/UploadItem';
import {Toolbar, ToolbarConfig} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {InstalledAppChangedEvent} from '../installation/InstalledAppChangedEvent';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class ApplicationBrowsePanel
    extends BrowsePanel {

    protected treeGrid: ApplicationTreeGrid;

    constructor() {
        super();

        this.addClass('application-browse-panel');
        this.registerEvents();
    }

    private static sendApplicationActionRequest(action: string, applications: Application[]) {
        const applicationKeys: ApplicationKey[] = ApplicationKey.fromApplications(applications);
        new ApplicationActionRequest(applicationKeys, action)
            .sendAndParse()
            .catch(DefaultErrorHandler.handle).done();
    }

    protected createToolbar(): Toolbar<ToolbarConfig> {
        const toolbar: Toolbar<ToolbarConfig> = new Toolbar<ToolbarConfig>();
        const readonlyMode: boolean = CONFIG.isTrue('readonlyMode');

        toolbar.toggleClass('read-only', readonlyMode);
        if (readonlyMode) {
            const spanEl = SpanEl.fromText(i18n('field.managed'), 'main-text');
            const spanEl2 = SpanEl.fromText(i18n('field.managed.help'), 'secondary-text');
            const divEl = new DivEl('readonly-help').appendChildren(spanEl, spanEl2);
            toolbar.appendChild(divEl);
        } else {
            const browseActions: ApplicationBrowseActions = this.treeGrid.getContextMenu().getActions() as ApplicationBrowseActions;
            toolbar.addActions([
                browseActions.INSTALL_APPLICATION,
                browseActions.UNINSTALL_APPLICATION,
                browseActions.START_APPLICATION,
                browseActions.STOP_APPLICATION
            ]);
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
        const readonlyMode: boolean = CONFIG.isTrue('readonlyMode');
        return readonlyMode ? null : super.getBrowseActions();
    }

    protected updatePreviewItem() {
        super.updatePreviewItem();

        const hasHighlighted = this.treeGrid.hasHighlightedNode();
        this.getBrowseItemPanel().toggleClass('highlighted', hasHighlighted);
    }

    private registerEvents() {
        StopApplicationEvent.on((event: StopApplicationEvent) =>
            ApplicationBrowsePanel.sendApplicationActionRequest('stop', event.getApplications()));
        StartApplicationEvent.on((event: StartApplicationEvent) =>
            ApplicationBrowsePanel.sendApplicationActionRequest('start', event.getApplications()));
        UninstallApplicationEvent.on((event: UninstallApplicationEvent) =>
            ApplicationBrowsePanel.sendApplicationActionRequest('uninstall', event.getApplications()));

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

        switch (event.getEventType()) {
        case ApplicationEventType.INSTALLED:
            this.handleAppInstalledEvent(event);
            return;
        case ApplicationEventType.UNINSTALLED:
            this.handleAppUninstalledEvent(event);
            return;
        case ApplicationEventType.STOPPED:
            this.handleAppStoppedEvent(event);
            return;
        }

        if (event.isNeedToUpdateApplication() && event.getApplicationKey()) {
            this.treeGrid.updateApplicationNode(event.getApplicationKey());
        }
    }

    private handleAppInstalledEvent(event: ApplicationEvent) {
        this.treeGrid.placeApplicationNode(event.getApplicationKey()).then(() => {
            setTimeout(() => { // timeout lets grid to remove UploadMockNode so that its not counted in the toolbar
                const installedApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
                const installedAppName: string = installedApp ? installedApp.getDisplayName() : event.getApplicationKey().toString();
                showFeedback(i18n('notify.installed', installedAppName));
                this.treeGrid.reload().then(() => {
                    new InstalledAppChangedEvent(this.treeGrid.getDefaultData()).fire();
                });
            }, 200);
        });
    }

    private handleAppUninstalledEvent(event: ApplicationEvent) {
        const uninstalledApp: Application = this.treeGrid.getByApplicationKey(event.getApplicationKey());
        const uninstalledAppName: string = uninstalledApp ? uninstalledApp.getDisplayName() : event.getApplicationKey().toString();
        showFeedback(i18n('notify.uninstalled', uninstalledAppName));
        this.treeGrid.deleteNodeByDataId(event.getApplicationKey().toString());
        new InstalledAppChangedEvent(this.treeGrid.getDefaultData()).fire();
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
