import {StopApplicationEvent} from './StopApplicationEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class StopApplicationAction
    extends Action {

    constructor(selectionWrapper: SelectableListBoxWrapper<Application>) {
        super(i18n('action.stop'));
        this.setEnabled(false);
        this.onExecuted(() => {
            let applications: Application[] = selectionWrapper.getSelectedItems();
            new StopApplicationEvent(applications).fire();
        });
    }
}
