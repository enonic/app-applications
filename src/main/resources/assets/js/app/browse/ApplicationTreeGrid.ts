import * as Q from 'q';
import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {Application, ApplicationUploadMock} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {GetApplicationRequest} from 'lib-admin-ui/application/GetApplicationRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ListApplicationsRequest} from 'lib-admin-ui/application/ListApplicationsRequest';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {ApplicationTreeGridHelper} from './ApplicationTreeGridHelper';

declare const CONFIG;

export class ApplicationTreeGrid extends TreeGrid<Application> {

    constructor() {
        const builder: TreeGridBuilder<Application> = new TreeGridBuilder<Application>()
            .setColumnConfig(ApplicationTreeGridHelper.generateColumnsConfig())
            .prependClasses('application-grid');

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
        const appMock: ApplicationUploadMock = new ApplicationUploadMock(item);
        const parent: TreeNode<Application> = this.getRoot().getDefaultRoot();
        const uploadNode: TreeNode<Application> = this.dataToTreeNode(<any>appMock, this.getRoot().getDefaultRoot());
        this.insertNodeToParentNode(uploadNode, parent, 0);

        const deleteUploadedNodeHandler = () => {
            const nodeToRemove: TreeNode<Application> = this.getRoot().getCurrentRoot().findNode(appMock.getId());

            if (nodeToRemove) {
                this.deleteNode(uploadNode);
                this.invalidate();
            }
        };

        item.onProgress((progress: number) => {
            this.invalidateNodes([uploadNode]);
            if (progress === 100) {
                deleteUploadedNodeHandler();
            }
        });

        item.onUploadStopped(deleteUploadedNodeHandler);

        item.onFailed(() => {
            this.deleteNode(uploadNode);
        });
    }

}
