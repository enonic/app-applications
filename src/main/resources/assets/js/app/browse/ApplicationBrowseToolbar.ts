import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';

export class ApplicationBrowseToolbar
    extends Toolbar {

    constructor(actions: ApplicationBrowseActions) {
        super();
        super.addAction(actions.INSTALL_APPLICATION);
        super.addAction(actions.UNINSTALL_APPLICATION);
        super.addAction(actions.START_APPLICATION);
        super.addAction(actions.STOP_APPLICATION);
    }
}
