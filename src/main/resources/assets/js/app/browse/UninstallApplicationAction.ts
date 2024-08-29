import {UninstallApplicationDialog} from './UninstallApplicationDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class UninstallApplicationAction
    extends Action {

    constructor(selectionWrapper: SelectableListBoxWrapper<Application>) {
        super(i18n('action.uninstall'));
        this.setEnabled(false);

        this.onExecuted(() => {
            let applications: Application[] = selectionWrapper.getSelectedItems();
            new UninstallApplicationDialog(applications).open();
        });
    }
}
