import {Application} from 'lib-admin-ui/application/Application';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';
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
