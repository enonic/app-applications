import * as Q from 'q';
import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {ApplicationRowFormatter} from './ApplicationRowFormatter';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {Application} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {i18n} from 'lib-admin-ui/util/Messages';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {GetApplicationRequest} from 'lib-admin-ui/application/GetApplicationRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ListApplicationsRequest} from 'lib-admin-ui/application/ListApplicationsRequest';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';

declare const CONFIG;

export class ApplicationTreeGrid extends TreeGrid<Application> {

    constructor() {
        const builder = new TreeGridBuilder<Application>().setColumnConfig([{
            name: i18n('field.name'),
            id: 'displayName',
            field: 'displayName',
            formatter: ApplicationRowFormatter.nameFormatter,
            style: {cssClass: 'name', minWidth: 250}
        }, {
            name: i18n('field.version'),
            id: 'version',
            field: 'version',
            style: {cssClass: 'version', minWidth: 50, maxWidth: 130}
        }, {
            name: i18n('field.state'),
            id: 'state',
            field: 'state',
            formatter: ApplicationRowFormatter.stateFormatter,
            style: {cssClass: 'state', minWidth: 80, maxWidth: 100}
        }]).prependClasses('application-grid');

        const readonlyMode: boolean = CONFIG.readonlyMode === 'true';

        builder.setCheckableRows(!readonlyMode);

        super(builder);

        if (!readonlyMode) {
            this.setContextMenu(new TreeGridContextMenu(ApplicationBrowseActions.init(this)));
        } else {
            this.getToolbar().hideAndDisableSelectionToggler();
        }
    }

    fetchRoot(): Q.Promise<Application[]> {
        return new ListApplicationsRequest().sendAndParse();
    }

    fetch(node: TreeNode<Application>, dataId?: string): Q.Promise<Application> {
        return this.fetchByKey(node.getData().getApplicationKey());
    }

    private fetchByKey(applicationKey: ApplicationKey): Q.Promise<Application> {
        let deferred = Q.defer<Application>();
        new GetApplicationRequest(applicationKey,
            true).sendAndParse().then((application: Application) => {
            deferred.resolve(application);
        }).catch((reason: any) => {
            DefaultErrorHandler.handle(reason);
        });

        return deferred.promise;
    }

    private placeNode(data: Application) {
        const parentNode: TreeNode<Application> = this.getRoot().getDefaultRoot();

        let index: number = parentNode.getChildren().length;

        for (let i = 0; i < index; i++) {
            if (parentNode.getChildren()[i].getData().getDisplayName().localeCompare(data.getDisplayName()) >= 0) {
                index = i;
                break;
            }
        }

        return this.insertDataToParentNode(data, parentNode, index);
    }

    updateApplicationNode(applicationKey: ApplicationKey) {
        this.fetchByKey(applicationKey).then((data: Application) => {
            this.updateNodeByData(data);
        }).catch(DefaultErrorHandler.handle);
    }

    getByApplicationKey(applicationKey: ApplicationKey): Application {
        const node: TreeNode<Application> = this.getRoot().getNodeByDataId(applicationKey.toString());

        return !!node ? node.getData() : null;
    }

    placeApplicationNode(applicationKey: ApplicationKey): Q.Promise<void> {
        return this.fetchByKey(applicationKey)
            .then((data: Application) => {
                this.placeNode(data);
                return Q(null);
            });
    }

    appendUploadNode(item: UploadItem<Application>) {

        // let appMock: ApplicationUploadMock = new ApplicationUploadMock(item);
        //
        // this.appendNode(<any>appMock, false).done();
        //
        // let deleteUploadedNodeHandler = () => {
        //     let nodeToRemove = this.getRoot().getCurrentRoot().findNode(item.getId());
        //     if (nodeToRemove) {
        //         this.deleteNode(nodeToRemove.getData());
        //         this.invalidate();
        //     }
        // };
        //
        // item.onProgress((progress: number) => {
        //     this.invalidate();
        //     if (progress === 100) {
        //         deleteUploadedNodeHandler();
        //     }
        // });
        //
        // item.onUploadStopped(deleteUploadedNodeHandler);
        //
        // item.onFailed(() => {
        //     this.deleteNode(<any>appMock);
        // });
    }

}
