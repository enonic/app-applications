import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {ApplicationBrowseItemPanel} from './ApplicationBrowseItemPanel';
import {StopApplicationEvent} from './StopApplicationEvent';
import {StartApplicationEvent} from './StartApplicationEvent';
import {UninstallApplicationEvent} from './UninstallApplicationEvent';
import {ApplicationUploadStartedEvent} from './ApplicationUploadStartedEvent';
import {ApplicationActionRequest} from '../resource/ApplicationActionRequest';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {Application, ApplicationUploadMock} from '@enonic/lib-admin-ui/application/Application';
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

export class ApplicationBrowsePanel
    extends BrowsePanel {

    protected treeListBox: ApplicationsGridList;

    protected treeActions: ApplicationBrowseActions;

    protected toolbar: ListBoxToolbar<Application>;

    protected contextMenu: TreeGridContextMenu;

    protected selectionWrapper: SelectionWrapperExt;

    protected keyNavigator: SelectableListBoxKeyNavigator<Application>;

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
            this.updateAppByKey(event.getApplicationKey());
        }
    }

    private updateAppByKey(key: ApplicationKey): void {
        this.fetchAppByKey(key).then((application: Application) => {
            this.treeListBox.replaceItems(application);
        }).catch(DefaultErrorHandler.handle);
    }

    private fetchAppByKey(applicationKey: ApplicationKey): Q.Promise<Application> {
        return new GetApplicationRequest(applicationKey, true).sendAndParse();
    }

    private handleAppInstalledEvent(event: ApplicationEvent) {
        this.fetchAppByKey(event.getApplicationKey()).then((application: Application) => {
            setTimeout(() => { // timeout lets grid to remove UploadMockNode so that its not counted in the toolbar
                showFeedback(i18n('notify.installed', application.getDisplayName()));
                this.treeListBox.addItems(application, false, 0);
                new InstalledAppChangedEvent(this.treeListBox.getItems()).fire();
            }, 200);
        }).catch(DefaultErrorHandler.handle);
    }

    private handleAppUninstalledEvent(event: ApplicationEvent) {
        const uninstalledApp: Application = this.treeListBox.getItem(event.getApplicationKey().getName());
        const uninstalledAppName: string = uninstalledApp ? uninstalledApp.getDisplayName() : event.getApplicationKey().toString();
        showFeedback(i18n('notify.uninstalled', uninstalledAppName));
        const itemToRemove = this.treeListBox.getItems().find(
            (item: Application) => item.getApplicationKey().getName() === event.getApplicationKey().getName());

        if (itemToRemove) {
            this.selectionWrapper.deselect(itemToRemove);
            this.treeListBox.removeItems(itemToRemove);
        }

        new InstalledAppChangedEvent(this.treeListBox.getItems()).fire();
    }

    private handleAppStoppedEvent(event: ApplicationEvent) {
            const stoppedApp: Application = this.treeListBox.getItem(event.getApplicationKey().getName());
            // seems to be present in the grid and xp is running
            if (stoppedApp && ServerEventsConnection.get().isConnected()) {
                this.updateAppByKey(event.getApplicationKey());
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

