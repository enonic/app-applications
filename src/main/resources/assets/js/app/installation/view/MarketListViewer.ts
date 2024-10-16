import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {MarketAppViewer} from './MarketAppViewer';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import * as Q from 'q';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {MarketApplication, MarketAppStatus, MarketAppStatusFormatter} from '../../MarketApplication';
import {LiEl} from '@enonic/lib-admin-ui/dom/LiEl';

export class MarketListViewer
    extends LiEl {

    private readonly marketViewer: MarketAppViewer;

    private readonly versionBlock: VersionBlock;

    private readonly statusBlock: StatusBlock;

    constructor() {
        super('market-list-viewer');

        this.marketViewer = new MarketAppViewer();
        this.versionBlock = new VersionBlock('version');
        this.statusBlock = new StatusBlock('app-status');
    }

    setItem(item: MarketApplication): void {
        this.marketViewer.setObject(item);
        this.versionBlock.setItem(item);
        this.statusBlock.setItem(item);
    }

    onActionButtonClicked(listener: () => void): void {
        this.statusBlock.onActionButtonClicked(listener);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.marketViewer);
            this.appendChild(this.versionBlock);
            this.appendChild(this.statusBlock);

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

    setItem(item: MarketApplication): void {
        this.textEl.setHtml(item.getLatestVersion());
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.textEl);

            return rendered;
        });
    }
}

class StatusBlock extends DivEl {

    private readonly button: Button;

    private item: MarketApplication;

    constructor(className?: string) {
        super('text-block ' + (className || ''));

        this.button = new Button('text');
    }

    setItem(item: MarketApplication): void {
        const status: MarketAppStatus = item.getStatus();
        const progress: number = item.getProgress();

        this.button.removeClass(this.getAllStatusClassesAsString());
        this.button.removeChildren();
        this.button.appendChild(MarketAppStatusFormatter.createStatusElement(status, progress));
        this.button.addClass(MarketAppStatusFormatter.getStatusCssClass(status));

        if (status !== MarketAppStatus.NOT_INSTALLED && status !== MarketAppStatus.OLDER_VERSION_INSTALLED) {
            this.button.getEl().setTabIndex(-1);
        }
    }

    private getAllStatusClassesAsString(): string {
        return `${MarketAppStatusFormatter.statusInstallCssClass} ${MarketAppStatusFormatter.statusInstalledCssClass} ${MarketAppStatusFormatter.statusInstallingCssClass} ${MarketAppStatusFormatter.statusUpdateCssClass}`;
    }

    onActionButtonClicked(listener: () => void): void {
        this.button.onClicked(listener);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.button);

            return rendered;
        });
    }
}
