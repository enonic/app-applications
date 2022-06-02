import {ApplicationBrowseActions} from '../browse/ApplicationBrowseActions';
import {GetApplicationInfoRequest} from '../resource/GetApplicationInfoRequest';
import {ApplicationInfo} from '../resource/ApplicationInfo';
import {ApplicationDataContainer} from './ApplicationDataContainer';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ActionMenu} from '@enonic/lib-admin-ui/ui/menu/ActionMenu';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ApplicationItemStatisticsHeader} from './ApplicationItemStatisticsHeader';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {StartApplicationEvent} from '../browse/StartApplicationEvent';
import {StopApplicationEvent} from '../browse/StopApplicationEvent';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class ApplicationItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly applicationDataContainer: ApplicationDataContainer;

    private actionMenu?: ActionMenu;

    private startAction: Action;

    private stopAction: Action;

    private readonly header: ApplicationItemStatisticsHeader;

    constructor() {
        super('application-item-statistics-panel');

        this.addActionMenu();
        this.applicationDataContainer = new ApplicationDataContainer();
        this.header = new ApplicationItemStatisticsHeader();
    }

    private addActionMenu() {
        const readonlyMode: boolean = CONFIG.isTrue('readonlyMode');

        if (readonlyMode) {
            return;
        }

        this.startAction = new Action(i18n('action.start')).onExecuted(() => new StartApplicationEvent([this.getItem()]).fire());
        this.stopAction = new Action(i18n('action.stop')).onExecuted(() => new StopApplicationEvent([this.getItem()]).fire());
        this.actionMenu = new ActionMenu(i18n('application.state.stopped'), this.startAction, this.stopAction);
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
        const currentItem: Application = this.getItem();

        if (!currentItem) {
            return false;
        }

        return currentItem.equals(item);
    }

    private updateActionMenu() {
        if (!!this.actionMenu) {
            const app: Application = this.getItem();
            this.actionMenu.setLabel(this.getLocalizedState(app.getState()));
            this.startAction.setVisible(!app.isStarted());
            this.stopAction.setVisible(app.isStarted());
        }
    }

    private updateApplicationDataContainer() {
        const application: Application = this.getItem();
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

    getItem(): Application {
        return <Application>super.getItem();
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
