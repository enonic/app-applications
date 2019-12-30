import {ApplicationBrowsePanel} from './browse/ApplicationBrowsePanel';
import {AppPanel} from 'lib-admin-ui/app/AppPanel';
import {Path} from 'lib-admin-ui/rest/Path';
import {ShowBrowsePanelEvent} from 'lib-admin-ui/app/ShowBrowsePanelEvent';
import {Application} from 'lib-admin-ui/application/Application';

export class ApplicationAppPanel
    extends AppPanel<Application> {

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
