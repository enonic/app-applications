import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {InstallAppPromptEvent} from '../installation/InstallAppPromptEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';

export class InstallApplicationAction
    extends Action {

    constructor(applicationTreeGrid: ApplicationTreeGrid) {
        super(i18n('action.install'));
        this.setEnabled(false);
        this.onExecuted(() => {
            const installedApplications: Application[] = applicationTreeGrid.getDefaultData();
            new InstallAppPromptEvent(installedApplications).fire();
        });
    }
}
