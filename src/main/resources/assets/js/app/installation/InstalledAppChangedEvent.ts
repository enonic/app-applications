import {Application} from 'lib-admin-ui/application/Application';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class InstalledAppChangedEvent
    extends Event {

    private readonly installedApplications: Application[];

    constructor(installedApplications: Application[]) {
        super();
        this.installedApplications = installedApplications;
    }

    getInstalledApplications(): Application[] {
        return this.installedApplications;
    }

    static on(handler: (event: InstalledAppChangedEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: InstalledAppChangedEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
