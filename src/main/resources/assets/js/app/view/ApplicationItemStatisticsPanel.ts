import {ApplicationBrowseActions} from '../browse/ApplicationBrowseActions';
import {GetApplicationInfoRequest} from '../resource/GetApplicationInfoRequest';
import {ApplicationInfo} from '../resource/ApplicationInfo';
import {ApplicationDataContainer} from './ApplicationDataContainer';
import Application = api.application.Application;
import i18n = api.util.i18n;
import DivEl = api.dom.DivEl;
import ViewItem = api.app.view.ViewItem;

export class ApplicationItemStatisticsPanel
    extends api.app.view.ItemStatisticsPanel<api.application.Application> {

    private applicationDataContainer: ApplicationDataContainer;
    private actionMenu: api.ui.menu.ActionMenu;

    constructor() {
        super('application-item-statistics-panel');

        this.addActionMenu();
        this.addApplicationDataContainer();
    }

    private addActionMenu() {
        this.actionMenu =
            new api.ui.menu.ActionMenu(i18n('application.state.stopped'), ApplicationBrowseActions.get().START_APPLICATION,
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
        this.actionMenu.setLabel(this.getLocalizedState(this.getItem().getModel().getState()));
    }

    private updateApplicationDataContainer() {
        const application: Application = this.getItem().getModel();
        new GetApplicationInfoRequest(application.getApplicationKey()).sendAndParse().then(
            (appInfo: ApplicationInfo) => this.applicationDataContainer.update(application, appInfo)).catch(api.DefaultErrorHandler.handle);
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
