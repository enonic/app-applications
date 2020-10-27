import {ApplicationBrowseActions} from '../browse/ApplicationBrowseActions';
import {GetApplicationInfoRequest} from '../resource/GetApplicationInfoRequest';
import {ApplicationInfo} from '../resource/ApplicationInfo';
import {ApplicationDataContainer} from './ApplicationDataContainer';
import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {ActionMenu} from 'lib-admin-ui/ui/menu/ActionMenu';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {ViewItem} from 'lib-admin-ui/app/view/ViewItem';
import {Application} from 'lib-admin-ui/application/Application';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';

declare const CONFIG;

export class ApplicationItemStatisticsPanel
    extends ItemStatisticsPanel<Application> {

    private applicationDataContainer: ApplicationDataContainer;
    private actionMenu?: ActionMenu;

    constructor() {
        super('application-item-statistics-panel');

        this.addActionMenu();
        this.addApplicationDataContainer();
    }

    private addActionMenu() {
        const readonlyMode: boolean = CONFIG.readonlyMode === 'true';

        if (readonlyMode) {
            return;
        }

        this.actionMenu =
            new ActionMenu(i18n('application.state.stopped'), ApplicationBrowseActions.get().START_APPLICATION,
                ApplicationBrowseActions.get().STOP_APPLICATION);

        const actionMenuWrapper: DivEl = new DivEl('action-menu-wrapper');
        actionMenuWrapper.appendChild(this.actionMenu);

        this.appendChild(actionMenuWrapper);
    }

    private addApplicationDataContainer() {
        this.applicationDataContainer = new ApplicationDataContainer();
        this.appendChild(this.applicationDataContainer);
    }

    setItem(item: ViewItem<Application>) {
        if (this.skipItemUpdate(item)) {
            return;
        }

        super.setItem(item);

        this.updateHeader();
        this.updateActionMenu();
        this.updateApplicationDataContainer();
    }

    private skipItemUpdate(item: ViewItem<Application>): boolean {
        const currentItem: ViewItem<Application> = this.getItem();

        if (!currentItem) {
            return false;
        }

        return currentItem.equals(item);
    }

    private updateHeader() {
        const application: Application = this.getItem().getModel();

        if (application.hasIconUrl()) {
            this.getHeader().setIconUrl(application.getIconUrl());
        }

        if (application.hasDescription()) {
            this.getHeader().setHeaderSubtitle(application.getDescription(), 'app-description');
        }
    }

    private updateActionMenu() {
        if (!!this.actionMenu) {
            this.actionMenu.setLabel(this.getLocalizedState(this.getItem().getModel().getState()));
        }
    }

    private updateApplicationDataContainer() {
        const application: Application = this.getItem().getModel();
        new GetApplicationInfoRequest(application.getApplicationKey()).sendAndParse().then(
            (appInfo: ApplicationInfo) => this.applicationDataContainer.update(application, appInfo)).catch(DefaultErrorHandler.handle);
    }

    private getLocalizedState(state: string): string {
        switch (state) {
        case Application.STATE_STARTED:
            return i18n('application.state.started');
        case Application.STATE_STOPPED:
            return i18n('application.state.stopped');
        default:
            return '';
        }
    }
}
