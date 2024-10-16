import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class AppUninstalledEvent
    extends Event {

    private readonly application: Application;

    constructor(application: Application) {
        super();
        this.application = application;
    }

    getApplication(): Application {
        return this.application;
    }

    static on(handler: (event: AppUninstalledEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: AppUninstalledEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
