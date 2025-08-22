import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {ApplicationBrowseItemPanel} from './ApplicationBrowseItemPanel';
import {StopApplicationEvent} from './StopApplicationEvent';
import {StartApplicationEvent} from './StartApplicationEvent';
import {UninstallApplicationEvent} from './UninstallApplicationEvent';
import {ApplicationUploadStartedEvent} from './ApplicationUploadStartedEvent';
import {ApplicationActionRequest} from '../resource/ApplicationActionRequest';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {Application, ApplicationBuilder, ApplicationUploadMock} from '@enonic/lib-admin-ui/application/Application';
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
import {AppInstalledEvent} from '../installation/AppInstalledEvent';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {SelectableListBoxWrapper, SelectionMode} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {TreeGridContextMenu} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {ApplicationsGridList} from './ApplicationsGridList';
import {SelectableListBoxKeyNavigator} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxKeyNavigator';
import {GetApplicationRequest} from '../resource/GetApplicationRequest';
import * as Q from 'q';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ApplicationsListViewer} from './ApplicationsListViewer';
import {AppUninstalledEvent} from '../installation/AppUninstalledEvent';

export class ApplicationBrowsePanel
    extends BrowsePanel {

    declare protected treeListBox: ApplicationsGridList;

    declare protected treeActions: ApplicationBrowseActions;

    declare protected toolbar: ListBoxToolbar<Application>;

    declare protected contextMenu: TreeGridContextMenu;

    declare protected selectionWrapper: SelectionWrapperExt;

    declare protected keyNavigator: SelectableListBoxKeyNavigator<Application>;

    constructor() {
        super();

        this.addClass('application-browse-panel');
        this.registerEvents();
    }

    protected initListeners(): void {
        super.initListeners();

        this.treeListBox.whenShown(() => {
            this.treeListBox.load();
        });

        this.treeListBox.onItemsAdded((items: Application[], itemViews: ApplicationsListViewer[]) => {
            items.forEach((item: Application, index) => {
                const listElement = itemViews[index];

                listElement?.onContextMenu((event: MouseEvent) => {
                    event.preventDefault();
                    this.contextMenu.showAt(event.clientX, event.clientY);
                });
            });
        });
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
            const browseActions: ApplicationBrowseActions = this.treeActions;
            toolbar.addActions([
                browseActions.INSTALL_APPLICATION,
                browseActions.UNINSTALL_APPLICATION,
                browseActions.START_APPLICATION,
                browseActions.STOP_APPLICATION
            ]);
        }

        return toolbar;
    }

    protected createBrowseItemPanel(): ApplicationBrowseItemPanel {
        return new ApplicationBrowseItemPanel();
    }

    protected getBrowseActions(): TreeGridActions<Application> {
        const readonlyMode: boolean = CONFIG.isTrue('readonlyMode');
        return readonlyMode ? null : this.treeActions;
    }

    protected createListBoxPanel(): SelectableListBoxPanel<Application> {
        const readonlyMode = CONFIG.isTrue('readonlyMode');

        this.treeListBox = new ApplicationsGridList();

        this.selectionWrapper = new SelectionWrapperExt(this.treeListBox, {
            className: 'applications-list-box-wrapper',
            maxSelected: 0,
            checkboxPosition: 'left',
            highlightMode: true,
        });

        this.toolbar = new ListBoxToolbar<Application>(this.selectionWrapper, {
            refreshAction: () => this.treeListBox.load(),
        });

        if (!readonlyMode) {
            this.treeActions = new ApplicationBrowseActions(this.selectionWrapper);
            this.contextMenu = new TreeGridContextMenu(this.treeActions);
        } else {
            this.toolbar.hideAndDisableSelectionToggler();
        }

        this.keyNavigator = new SelectableListBoxKeyNavigator(this.selectionWrapper);

        const panel = new SelectableListBoxPanel(this.selectionWrapper, this.toolbar);
        panel.addClass('applications-selectable-list-box-panel');

        return panel;
    }

    protected updatePreviewItem() {
        super.updatePreviewItem();

        const hasHighlighted =
            this.selectionWrapper.getSelectedItems().length > 0 && this.selectionWrapper.getSelectionMode() === SelectionMode.HIGHLIGHT;
        this.getBrowseItemPanel().toggleClass('highlighted', hasHighlighted);
    }

    private registerEvents(): void {
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
        if (event.isSystemApplication() || event.getApplicationKey()?.toString() === 'com.enonic.xp.app.applications') {
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
            this.updateAppByKey(event.getApplicationKey()).catch(DefaultErrorHandler.handle);
        }
    }

    private updateAppByKey(key: ApplicationKey): Q.Promise<Application> {
        return this.fetchAppByKey(key).then((application: Application) => {
            this.treeListBox.replaceItems(application);
            return application;
        });
    }

    private fetchAppByKey(applicationKey: ApplicationKey): Q.Promise<Application> {
        return new GetApplicationRequest(applicationKey, true).sendAndParse();
    }

    private handleAppInstalledEvent(event: ApplicationEvent) {
        // if updating local app
        this.removeItemFromList(event.getApplicationKey().toString());
        this.treeListBox.addItems(this.createAppFromEvent(event), false, 0);

        this.updateAppByKey(event.getApplicationKey()).then((application) => {
            showFeedback(i18n('notify.installed', application.getDisplayName()));
            new AppInstalledEvent(application).fire();
        }).catch(DefaultErrorHandler.handle);
    }

    private handleAppUninstalledEvent(event: ApplicationEvent) {
        const uninstalledApp: Application = this.treeListBox.getItem(event.getApplicationKey().getName());
        const uninstalledAppName: string = uninstalledApp ? uninstalledApp.getDisplayName() : event.getApplicationKey().toString();
        showFeedback(i18n('notify.uninstalled', uninstalledAppName));
        this.removeItemFromList(event.getApplicationKey().toString(), true);

        new AppUninstalledEvent(uninstalledApp).fire();
    }

    private createAppFromEvent(event: ApplicationEvent): Application {
        const builder = new ApplicationBuilder();
        builder.id = event.getApplicationKey().toString();
        builder.applicationKey = event.getApplicationKey();
        builder.displayName = event.getName();
        builder.url = event.getApplicationUrl();
        return builder.build();
    }

    private removeItemFromList(appKeyAsString: string, deselect?: boolean) {
        const itemToRemove = this.treeListBox.getItems().find(
            (item: Application) => item.getApplicationKey().getName() === appKeyAsString);

        if (itemToRemove) {
            if (deselect) {
                this.selectionWrapper.deselect(itemToRemove);
            }

            this.treeListBox.removeItems(itemToRemove);
        }
    }

    private handleAppStoppedEvent(event: ApplicationEvent) {
        const stoppedApp: Application = this.treeListBox.getItem(event.getApplicationKey().getName());
        // seems to be present in the grid and xp is running
        if (stoppedApp && ServerEventsConnection.get(CONFIG.getString('eventApiUrl')).isConnected()) {
            this.updateAppByKey(event.getApplicationKey()).catch(DefaultErrorHandler.handle);
        }
    }

    private handleNewAppUpload(event: ApplicationUploadStartedEvent) {
        event.getUploadItems().forEach((item: UploadItem<Application>) => {
            this.appendUploadNode(item);
        });
    }

    appendUploadNode(item: UploadItem<Application>) {
        if (this.isItemUploading(item)) {
            return;
        }

        const appMock = new ApplicationUploadMock(item) as unknown as Application;

        this.treeListBox.addItems(appMock, false, 0);

        const deleteUploadedNodeHandler = () => {
            this.treeListBox.removeItems(appMock);
        };

        item.onProgress((progress: number) => {
            this.treeListBox.replaceItems(appMock);

            if (progress === 100) {
                deleteUploadedNodeHandler();
            }
        });

        item.onUploadStopped(deleteUploadedNodeHandler);

        item.onFailed(() => {
            this.treeListBox.removeItems(appMock);
        });
    }

    private isItemUploading(newItemToUpload: UploadItem<Application>): boolean {
        return  this.treeListBox.getItems().some((item: Application) => item.getName() === newItemToUpload.getName());
    }

    protected enableSelectionMode(): void {
        this.selectionWrapper.filterSelectedItems();
    }

    protected disableSelectionMode(): void {
        this.selectionWrapper.resetFilter();
    }
}

class SelectionWrapperExt extends SelectableListBoxWrapper<Application> {

    filterSelectedItems(): void {
        const selectedItems = this.getSelectedItems();

        this.itemsWrappers.forEach((itemWrapper: Element[], key: string) => {
            itemWrapper[0].setVisible(selectedItems.some((item: Application) => item.getApplicationKey().getName() === key));
        });
    }

    resetFilter(): void {
        this.itemsWrappers.forEach((itemWrapper: Element[]) => {
            itemWrapper[0].setVisible(true);
        });
    }
}

