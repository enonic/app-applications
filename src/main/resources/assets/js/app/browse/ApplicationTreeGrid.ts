import * as Q from 'q';
import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {Application, ApplicationUploadMock} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {TreeGrid} from '@enonic/lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeGridBuilder} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {UploadItem} from '@enonic/lib-admin-ui/ui/uploader/UploadItem';
import {ApplicationTreeGridHelper} from './ApplicationTreeGridHelper';
import {ListApplicationsRequest} from '../resource/ListApplicationsRequest';
import {GetApplicationRequest} from '../resource/GetApplicationRequest';
import {ResponsiveRanges} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveRanges';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class ApplicationTreeGrid
    extends TreeGrid<Application> {

    constructor() {
        const builder: TreeGridBuilder<Application> = new TreeGridBuilder<Application>()
            .setColumnConfig(ApplicationTreeGridHelper.generateColumnsConfig())
            .prependClasses('application-grid');

        const columns = builder.getColumns().slice(0);
        const updateColumns = () => {
            const checkSelIsMoved = ResponsiveRanges._540_720.isFitOrSmaller(Body.get().getEl().getWidth());
            this.setColumns(columns.slice(0), checkSelIsMoved);
        };
        builder.setColumnUpdater(updateColumns);

        const readonlyMode = CONFIG.isTrue('readonlyMode');
        builder.setCheckableRows(!readonlyMode);

        super(builder);
    }

    fetchRoot(): Q.Promise<Application[]> {
        return new ListApplicationsRequest().sendAndParse();
    }

    fetch(node: TreeNode<Application>, dataId?: string): Q.Promise<Application> {
        return this.fetchByKey(node.getData().getApplicationKey());
    }

    private fetchByKey(applicationKey: ApplicationKey): Q.Promise<Application> {
        let deferred = Q.defer<Application>();
        new GetApplicationRequest(applicationKey, true).sendAndParse()
            .then((application: Application) => deferred.resolve(application))
            .catch(DefaultErrorHandler.handle);

        return deferred.promise;
    }

}
