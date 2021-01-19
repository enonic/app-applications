import * as Q from 'q';
import {ApplicationTreeGrid} from './ApplicationTreeGrid';
import {StartApplicationAction} from './StartApplicationAction';
import {StopApplicationAction} from './StopApplicationAction';
import {InstallApplicationAction} from './InstallApplicationAction';
import {UninstallApplicationAction} from './UninstallApplicationAction';
import {TreeGridActions} from 'lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {Application} from 'lib-admin-ui/application/Application';
import {Action} from 'lib-admin-ui/ui/Action';

export class ApplicationBrowseActions implements TreeGridActions<Application> {

    public START_APPLICATION: Action;
    public STOP_APPLICATION: Action;
    public INSTALL_APPLICATION: Action;
    public UNINSTALL_APPLICATION: Action;

    private allActions: Action[] = [];

    private static INSTANCE: ApplicationBrowseActions;

    static init(applicationTreeGrid: ApplicationTreeGrid): ApplicationBrowseActions {
        ApplicationBrowseActions.INSTANCE = new ApplicationBrowseActions(applicationTreeGrid);
        return ApplicationBrowseActions.INSTANCE;
    }

    static get(): ApplicationBrowseActions {
        return ApplicationBrowseActions.INSTANCE;
    }

    constructor(applicationTreeGrid: ApplicationTreeGrid) {

        this.START_APPLICATION = new StartApplicationAction(applicationTreeGrid);
        this.STOP_APPLICATION = new StopApplicationAction(applicationTreeGrid);
        this.INSTALL_APPLICATION = new InstallApplicationAction(applicationTreeGrid);
        this.UNINSTALL_APPLICATION = new UninstallApplicationAction(applicationTreeGrid);

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
