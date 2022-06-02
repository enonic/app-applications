import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {StartApplicationEvent} from './StartApplicationEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';

export class StartApplicationAction
    extends Action {

    constructor(applicationTreeGrid: ApplicationTreeGrid) {
        super(i18n('action.start'));
        this.setEnabled(false);
        this.onExecuted(() => {
            let applications: Application[] = applicationTreeGrid.getSelectedDataList();
            new StartApplicationEvent(applications).fire();
        });
    }
}
