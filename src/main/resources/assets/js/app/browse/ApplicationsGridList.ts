import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ListApplicationsRequest} from '../resource/ListApplicationsRequest';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {ApplicationsListViewer} from './ApplicationsListViewer';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';

export class ApplicationsGridList
    extends ListBox<Application> {

    constructor() {
        super('applications-grid-list');
    }

    protected createItemView(item: Application, readOnly: boolean): ApplicationsListViewer {
        const viewer = new ApplicationsListViewer();
        viewer.setItem(item);
        return viewer;
    }

    protected getItemId(item: Application): string {
        return item.getId();
    }

    protected updateItemView(itemView: ApplicationsListViewer, item: Application): void {
        itemView.setItem(item);
    }

    load(): void {
        new ListApplicationsRequest().sendAndParse().then((applications: Application[]) => {
            this.setItems(applications);
        }).catch(DefaultErrorHandler.handle);
    }
}
