import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {UninstallApplicationDialog} from './UninstallApplicationDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';

export class UninstallApplicationAction
    extends Action {

    constructor(applicationTreeGrid: ApplicationTreeGrid) {
        super(i18n('action.uninstall'));
        this.setEnabled(false);

        this.onExecuted(() => {
            let applications: Application[] = applicationTreeGrid.getSelectedDataList();
            new UninstallApplicationDialog(applications).open();
        });
    }
}
