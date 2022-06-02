import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class UninstallApplicationEvent extends Event {
    private applications: Application[];

    constructor(applications: Application[]) {
        super();
        this.applications = applications;
    }

    getApplications(): Application[] {
        return this.applications;
    }

    static on(handler: (event: UninstallApplicationEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UninstallApplicationEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
