import {InstallAppPromptEvent} from '../installation/InstallAppPromptEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class InstallApplicationAction
    extends Action {

    constructor(selectionWrapper: SelectableListBoxWrapper<Application>) {
        super(i18n('action.install'));
        this.setEnabled(false);
        this.onExecuted(() => {
            const installedApplications: Application[] = selectionWrapper.getList().getItems();
            new InstallAppPromptEvent(installedApplications).fire();
        });
    }
}
