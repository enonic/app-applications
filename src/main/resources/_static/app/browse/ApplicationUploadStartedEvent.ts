import {UploadItem} from '@enonic/lib-admin-ui/ui/uploader/UploadItem';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Event} from '@enonic/lib-admin-ui/event/Event';

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
