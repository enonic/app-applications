import * as Q from 'q';
import {ApplicationBrowseActions} from './ApplicationBrowseActions';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {Application, ApplicationUploadMock} from 'lib-admin-ui/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {ApplicationTreeGridHelper} from './ApplicationTreeGridHelper';
import {ListApplicationsRequest} from '../resource/ListApplicationsRequest';
import {GetApplicationRequest} from '../resource/GetApplicationRequest';
import {ResponsiveRanges} from 'lib-admin-ui/ui/responsive/ResponsiveRanges';
import {Body} from 'lib-admin-ui/dom/Body';
import {CONFIG} from 'lib-admin-ui/util/Config';

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
        new GetApplicationRequest(applicationKey, true).sendAndParse()
            .then((application: Application) => deferred.resolve(application))
            .catch(DefaultErrorHandler.handle);

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
        const uploadNode: TreeNode<Application> = this.dataToTreeNode(<Application><unknown>appMock, this.getRoot().getDefaultRoot());
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
