import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {Application, ApplicationUploadMock} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationViewer} from '@enonic/lib-admin-ui/application/ApplicationViewer';
import * as Q from 'q';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {ProgressBar} from '@enonic/lib-admin-ui/ui/ProgressBar';

export class ApplicationsListViewer extends DivEl {

    private itemViewer: ApplicationViewer;

    private versionBlock: VersionBlock;

    private stateBlock: StatusBlock;

    constructor() {
        super('applications-list-viewer');

        this.initElements();
    }

    private initElements(): void {
        this.itemViewer = new ApplicationViewerExt();
        this.versionBlock = new VersionBlock('version');
        this.stateBlock = new StatusBlock('state');
    }

    setItem(application: Application | ApplicationUploadMock): void {
        this.itemViewer.setObject(application as Application);
        this.versionBlock.setItem(application);
        this.stateBlock.setItem(application);
    }

    getItem(): Application {
        return this.itemViewer.getObject();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.itemViewer);
            this.appendChild(this.versionBlock);
            this.appendChild(this.stateBlock);

            return rendered;
        });
    }

}

class VersionBlock extends DivEl {

    private readonly textEl: SpanEl;

    constructor(className?: string) {
        super('text-block ' + (className || ''));

        this.textEl = new SpanEl('text');
    }

    setItem(item: Application | ApplicationUploadMock): void {
        if (item instanceof Application) {
            this.textEl.setHtml(item.getVersion());
        } else {
            this.textEl.setHtml('');
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.textEl);

            return rendered;
        });
    }
}

class StatusBlock extends DivEl {

    private readonly textEl: SpanEl;

    private readonly progressEl?: ProgressBar;

    constructor(className?: string) {
        super('text-block ' + (className || ''));

        this.textEl = new SpanEl('text');
        this.progressEl = new ProgressBar();
    }

    setItem(item: Application | ApplicationUploadMock): void {
        if (item instanceof Application) {
            this.textEl.show();
            this.textEl.setHtml(item.getState());
            this.progressEl.hide();
        } else {
            this.progressEl.show();
            this.progressEl.setValue(item.getUploadItem().getProgress());
            this.textEl.hide();
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.textEl);
            this.appendChild(this.progressEl);

            return rendered;
        });
    }
}

class ApplicationViewerExt extends ApplicationViewer {

    resolveDisplayName(object: Application): string {
        return super.resolveDisplayName(object)?.trim();
    }

    resolveSubName(object: Application | ApplicationUploadMock): string {
        return super.resolveSubName(object)?.trim();
    }
}
