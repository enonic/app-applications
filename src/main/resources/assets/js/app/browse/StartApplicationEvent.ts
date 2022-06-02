import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

export class StartApplicationEvent extends Event {
    private applications: Application[];

    constructor(applications: Application[]) {
        super();

        this.applications = applications;
    }

    getApplications(): Application[] {
        return this.applications;
    }

    static on(handler: (event: StartApplicationEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: StartApplicationEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
