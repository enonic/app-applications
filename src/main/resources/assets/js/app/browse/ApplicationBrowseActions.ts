import Q from 'q';
import {StartApplicationAction} from './StartApplicationAction';
import {StopApplicationAction} from './StopApplicationAction';
import {InstallApplicationAction} from './InstallApplicationAction';
import {UninstallApplicationAction} from './UninstallApplicationAction';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class ApplicationBrowseActions implements TreeGridActions<Application> {

    public START_APPLICATION: Action;
    public STOP_APPLICATION: Action;
    public INSTALL_APPLICATION: Action;
    public UNINSTALL_APPLICATION: Action;

    private allActions: Action[] = [];

    constructor(selectionWrapper: SelectableListBoxWrapper<Application>) {
        this.START_APPLICATION = new StartApplicationAction(selectionWrapper);
        this.STOP_APPLICATION = new StopApplicationAction(selectionWrapper);
        this.INSTALL_APPLICATION = new InstallApplicationAction(selectionWrapper);
        this.UNINSTALL_APPLICATION = new UninstallApplicationAction(selectionWrapper);
        this.INSTALL_APPLICATION.setEnabled(true);

        this.allActions.push(this.START_APPLICATION, this.STOP_APPLICATION, this.UNINSTALL_APPLICATION);
    }

    getAllActions(): Action[] {
        return this.allActions;
    }

    updateActionsEnabledState(browseItems: Application[]): Q.Promise<void> {
        return Q(true).then(() => {
            const applicationsSelected = browseItems.length;
            const anySelected = applicationsSelected > 0;

            let anyStarted = false;
            let anyStopped = false;
            let localAppSelected = false;

            browseItems.forEach((browseItem: Application) => {
                let state = browseItem.getState();
                if (state === Application.STATE_STARTED) {
                    anyStarted = true;
                } else if (state === Application.STATE_STOPPED) {
                    anyStopped = true;
                }
                if (browseItem.isLocal()) {
                    localAppSelected = true;
                }
            });

            this.START_APPLICATION.setEnabled(anyStopped);
            this.STOP_APPLICATION.setEnabled(anyStarted);
            this.UNINSTALL_APPLICATION.setEnabled(anySelected && !localAppSelected);
        });
    }
}
