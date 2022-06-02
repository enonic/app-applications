import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

export class StopApplicationEvent extends Event {
    private applications: Application[];

    constructor(applications: Application[]) {
        super();
        this.applications = applications;
    }

    getApplications(): Application[] {
        return this.applications;
    }

    static on(handler: (event: StopApplicationEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: StopApplicationEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
