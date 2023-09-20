import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {ApplicationViewer} from '@enonic/lib-admin-ui/application/ApplicationViewer';
import {Application, ApplicationUploadMock} from '@enonic/lib-admin-ui/application/Application';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ProgressBar} from '@enonic/lib-admin-ui/ui/ProgressBar';

export class ApplicationRowFormatter {

    public static nameFormatter(row: number, cell: number, value: unknown, columnDef: unknown, node: TreeNode<Application>) {
        let viewer: ApplicationViewer = node.getViewer('name') as ApplicationViewer;

        if (!viewer) {
            viewer = new ApplicationViewer();
            viewer.setObject(node.getData());
            node.setViewer('name', viewer);
        }

        return viewer.toString();
    }

    public static stateFormatter(row: number, cell: number, value: unknown, columnDef: unknown, node: TreeNode<Application>) {
        const data: Application = node.getData();
        const statusEl: DivEl = new DivEl();

        if (data instanceof Application) {   // default node
            statusEl.getEl().setText(value as string);
        } else if (ObjectHelper.iFrameSafeInstanceOf(data, ApplicationUploadMock)) {   // uploading node
            const status = new ProgressBar((data as ApplicationUploadMock).getUploadItem().getProgress());
            statusEl.appendChild(status);
            statusEl.getEl().setWidth('100%');
        }

        return statusEl.toString();
    }
}
