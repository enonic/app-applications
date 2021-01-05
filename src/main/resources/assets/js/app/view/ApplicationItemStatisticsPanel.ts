import {ApplicationBrowseActions} from '../browse/ApplicationBrowseActions';
import {GetApplicationInfoRequest} from '../resource/GetApplicationInfoRequest';
import {ApplicationInfo} from '../resource/ApplicationInfo';
import {ApplicationDataContainer} from './ApplicationDataContainer';
import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {ActionMenu} from 'lib-admin-ui/ui/menu/ActionMenu';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {Application} from 'lib-admin-ui/application/Application';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ApplicationItemStatisticsHeader} from './ApplicationItemStatisticsHeader';

declare const CONFIG;

export class ApplicationItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly applicationDataContainer: ApplicationDataContainer;

    private actionMenu?: ActionMenu;

    private readonly header: ApplicationItemStatisticsHeader;

    constructor() {
        super('application-item-statistics-panel');

        this.addActionMenu();
        this.applicationDataContainer = new ApplicationDataContainer();
        this.header = new ApplicationItemStatisticsHeader();
    }

    private addActionMenu() {
        const readonlyMode: boolean = CONFIG.readonlyMode === 'true';

        if (readonlyMode) {
            return;
        }

        this.actionMenu =
            new ActionMenu(i18n('application.state.stopped'), ApplicationBrowseActions.get().START_APPLICATION,
                ApplicationBrowseActions.get().STOP_APPLICATION);
    }

    setItem(item: Application) {
        if (this.skipItemUpdate(item)) {
            return;
        }

        super.setItem(item);
        this.header.setItem(item);
        this.updateActionMenu();
        this.updateApplicationDataContainer();
    }

    private skipItemUpdate(item: Application): boolean {
        const currentItem: Application = <Application>this.getItem();

        if (!currentItem) {
            return false;
        }

        return currentItem.equals(item);
    }

    private updateActionMenu() {
        if (!!this.actionMenu) {
            this.actionMenu.setLabel(this.getLocalizedState((<Application>this.getItem()).getState()));
        }
    }

    private updateApplicationDataContainer() {
        const application: Application = <Application>this.getItem();
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

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.header);
            this.appendChild(this.applicationDataContainer);

            if (this.actionMenu) {
                const actionMenuWrapper: DivEl = new DivEl('action-menu-wrapper');
                actionMenuWrapper.appendChild(this.actionMenu);

                this.appendChild(actionMenuWrapper);
            }

            return rendered;
        });
    }
}
