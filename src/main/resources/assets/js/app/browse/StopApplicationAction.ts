import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {StopApplicationEvent} from './StopApplicationEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';

export class StopApplicationAction
    extends Action {

    constructor(applicationTreeGrid: ApplicationTreeGrid) {
        super(i18n('action.stop'));
        this.setEnabled(false);
        this.onExecuted(() => {
            let applications: Application[] = applicationTreeGrid.getSelectedDataList();
            new StopApplicationEvent(applications).fire();
        });
    }
}
