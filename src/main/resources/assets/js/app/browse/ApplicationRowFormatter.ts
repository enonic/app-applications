import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {ApplicationViewer} from 'lib-admin-ui/application/ApplicationViewer';
import {Application, ApplicationUploadMock} from 'lib-admin-ui/application/Application';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ProgressBar} from 'lib-admin-ui/ui/ProgressBar';

export class ApplicationRowFormatter {

    public static nameFormatter(row: number, cell: number, value: any, columnDef: any, node: TreeNode<Application>) {
        let viewer = <ApplicationViewer>node.getViewer('name');
        if (!viewer) {
            viewer = new ApplicationViewer();
            viewer.setObject(node.getData());
            node.setViewer('name', viewer);
        }
        return viewer.toString();
    }

    public static stateFormatter(row: number, cell: number, value: any, columnDef: any, node: TreeNode<Application>) {
        const data = node.getData();
        const statusEl = new DivEl();

        if (data instanceof Application) {   // default node
            statusEl.getEl().setText(value);
        } else if (ObjectHelper.iFrameSafeInstanceOf(data, ApplicationUploadMock)) {   // uploading node
            const status = new ProgressBar((<any>data).getUploadItem().getProgress());
            statusEl.appendChild(status);
        }

        return statusEl.toString();
    }
}
