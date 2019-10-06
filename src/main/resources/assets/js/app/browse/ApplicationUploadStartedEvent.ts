import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Application} from 'lib-admin-ui/application/Application';
import {Event} from 'lib-admin-ui/event/Event';

export class ApplicationUploadStartedEvent
    extends Event {

    private uploadItems: UploadItem<Application>[];

    constructor(items: UploadItem<Application>[]) {
        super();
        this.uploadItems = items;
    }

    getUploadItems(): UploadItem<Application>[] {
        return this.uploadItems;
    }

    static on(handler: (event: ApplicationUploadStartedEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: ApplicationUploadStartedEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
