import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {InstalledAppChangedEvent} from './InstalledAppChangedEvent';

export class InstallAppPromptEvent
    extends InstalledAppChangedEvent {

    constructor(installedApplications: Application[]) {
        super(installedApplications);
    }

    static on(handler: (event: InstallAppPromptEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: InstallAppPromptEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
