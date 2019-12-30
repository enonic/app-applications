import {Application} from 'lib-admin-ui/application/Application';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class InstallAppPromptEvent
    extends Event {

    private installedApplications: Application[];

    constructor(installedApplications: Application[]) {
        super();
        this.installedApplications = installedApplications;
    }

    getInstalledApplications(): Application[] {
        return this.installedApplications;
    }

    static on(handler: (event: InstallAppPromptEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: InstallAppPromptEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
