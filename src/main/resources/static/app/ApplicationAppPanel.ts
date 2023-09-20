import {ApplicationBrowsePanel} from './browse/ApplicationBrowsePanel';
import {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ShowBrowsePanelEvent} from '@enonic/lib-admin-ui/app/ShowBrowsePanelEvent';
import {Application} from '@enonic/lib-admin-ui/application/Application';

export class ApplicationAppPanel
    extends AppPanel {

    constructor(path?: Path) {

        super();

        this.route(path);
    }

    private route(path?: Path) {
        let action = path ? path.getElement(0) : undefined;
        let id;

        switch (action) {
        case 'edit':
            id = path.getElement(1);
            if (id) {
                //TODO
            }
            break;
        case 'view' :
            id = path.getElement(1);
            if (id) {
                //TODO
            }
            break;
        default:
            new ShowBrowsePanelEvent().fire();
            break;
        }
    }

    protected createBrowsePanel() {
        return new ApplicationBrowsePanel();
    }
}
