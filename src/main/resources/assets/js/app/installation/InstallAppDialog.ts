import {ApplicationInput} from './view/ApplicationInput';
import {MarketAppsTreeGrid} from './view/MarketAppsTreeGrid';
import {ApplicationUploaderEl} from './ApplicationUploaderEl';
import {ApplicationUploadStartedEvent} from '../browse/ApplicationUploadStartedEvent';
import TreeNode = api.ui.treegrid.TreeNode;
import Application = api.application.Application;
import DivEl = api.dom.DivEl;
import MarketApplication = api.application.MarketApplication;
import UploadFailedEvent = api.ui.uploader.UploadFailedEvent;
import UploadStartedEvent = api.ui.uploader.UploadStartedEvent;
import ButtonEl = api.dom.ButtonEl;
import StringHelper = api.util.StringHelper;
import i18n = api.util.i18n;

export class InstallAppDialog
    extends api.ui.dialog.ModalDialog {

    private dropzoneContainer: api.ui.uploader.DropzoneContainer;

    private applicationInput: ApplicationInput;

    private statusMessage: StatusMessage;

    private clearButton: ButtonEl;

    private marketAppsTreeGrid: MarketAppsTreeGrid;

    constructor() {
        super({
            title: i18n('dialog.install'),
            class: 'install-application-dialog'
        });
    }

    protected initElements() {
        super.initElements();

        this.statusMessage = new StatusMessage();

        this.applicationInput = new ApplicationInput(this.getCancelAction(), 'large').setPlaceholder(i18n('dialog.install.search'));

        this.clearButton = new api.dom.ButtonEl();

        this.dropzoneContainer = new api.ui.uploader.DropzoneContainer(true);

        this.marketAppsTreeGrid = new MarketAppsTreeGrid();
    }

    protected postInitElements() {
        super.postInitElements();

        this.setElementToFocusOnShow(this.applicationInput);
        this.marketAppsTreeGrid.setNodesFilter(this.filterNodes.bind(this));
    }

    protected initListeners() {
        super.initListeners();

        this.applicationInput.onTextValueChanged(() => {
            this.clearButton.setVisible(!StringHelper.isEmpty(this.applicationInput.getValue()));
            this.marketAppsTreeGrid.mask();
            this.marketAppsTreeGrid.refresh();
        });

        this.applicationInput.onAppInstallStarted(() => {
            this.marketAppsTreeGrid.mask();
            this.statusMessage.showInstalling();
        });

        this.applicationInput.onAppInstallFinished(() => {
            this.clearButton.setVisible(!StringHelper.isEmpty(this.applicationInput.getValue()));
            this.marketAppsTreeGrid.unmask();
        });

        this.applicationInput.onAppInstallFailed((message: string) => {
            this.clearButton.setVisible(!StringHelper.isEmpty(this.applicationInput.getValue()));

            this.marketAppsTreeGrid.invalidate();
            this.marketAppsTreeGrid.initData([]);
            this.marketAppsTreeGrid.unmask();

            this.statusMessage.showFailed(message);
        });

        this.marketAppsTreeGrid.onLoaded(() => {
            this.statusMessage.reset();

            if (this.marketAppsTreeGrid.isDataViewEmpty()) {
                this.statusMessage.showNoResult();
            } else {
                this.statusMessage.hide();
            }
            this.removeClass('loading');
            this.notifyResize();
        });

        this.marketAppsTreeGrid.onLoadingStarted(() => {
            this.addClass('loading');
            this.statusMessage.showLoading();
            this.marketAppsTreeGrid.mask();
        });

        this.clearButton.onClicked(() => {
            this.applicationInput.reset();
            this.marketAppsTreeGrid.refresh();
            this.clearButton.hide();
            this.applicationInput.getTextInput().giveFocus();
        });

        this.initUploaderListeners();
        this.initDragAndDropUploaderEvents();

        this.onShown(() => {
            this.clearButton.hide();
        });
    }

    updateInstallApplications(installApplications: api.application.Application[]) {
        this.marketAppsTreeGrid.updateInstallApplications(installApplications);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.dropzoneContainer.hide();
            this.appendChild(this.dropzoneContainer);

            this.getBody().addClass('mask-wrapper');

            this.clearButton.addClass('clear-button');
            this.applicationInput.appendChild(this.clearButton);
            this.applicationInput.getUploader().addDropzone(this.dropzoneContainer.getDropzone().getId());

            this.header.appendChildren(...[this.applicationInput, this.statusMessage]);

            const marketAppsDiv: DivEl = new DivEl('market-apps');
            marketAppsDiv.appendChild(this.marketAppsTreeGrid);
            this.appendChildToContentPanel(marketAppsDiv);

            return rendered;
        });
    }

    // in order to toggle appropriate handlers during drag event
    // we catch drag enter on this element and trigger uploader to appear,
    // then catch drag leave on uploader's dropzone to get back to previous state
    private initDragAndDropUploaderEvents() {
        let dragOverEl;
        this.onDragEnter((event: DragEvent) => {
            const target = <HTMLElement> event.target;

            if (!!dragOverEl || dragOverEl === this.getHTMLElement()) {
                this.dropzoneContainer.show();
            }
            dragOverEl = target;
        });

        this.applicationInput.getUploader().onDropzoneDragLeave(() => this.dropzoneContainer.hide());
        this.applicationInput.getUploader().onDropzoneDrop(() => this.dropzoneContainer.hide());
    }

    private initUploaderListeners() {

        const uploadFailedHandler = (event: UploadFailedEvent<Application>, uploader: ApplicationUploaderEl) => {
            api.notify.NotifyManager.get().showWarning(uploader.getFailure());

            this.resetFileInputWithUploader();
        };

        this.applicationInput.onUploadFailed((event) => {
            uploadFailedHandler(event, this.applicationInput.getUploader());
        });

        const uploadStartedHandler = (event: UploadStartedEvent<Application>) => {
            new ApplicationUploadStartedEvent(event.getUploadItems()).fire();
            this.close();
        };

        this.applicationInput.onUploadStarted(uploadStartedHandler);
    }

    show() {
        this.resetFileInputWithUploader();
        super.show();
        this.statusMessage.reset();
    }

    hide() {
        super.hide();
        this.statusMessage.reset();
        this.applicationInput.reset();
    }

    close() {
        this.applicationInput.reset();
        super.close();
    }

    private resetFileInputWithUploader() {
        if (this.applicationInput) {
            this.applicationInput.reset();
        }
    }

    private filterNodes(nodes: TreeNode<MarketApplication>[]): TreeNode<MarketApplication>[] {
        let items = nodes;
        if (this.applicationInput && !api.util.StringHelper.isEmpty(this.applicationInput.getValue())) {
            items = nodes.filter((node: TreeNode<MarketApplication>) => {
                return this.nodePassesFilterCondition(node);
            });
        }

        return items;
    }

    private nodePassesFilterCondition(node: TreeNode<MarketApplication>): boolean {
        const app: MarketApplication = node.getData();
        // true for empty app because empty app is empty node that triggers loading
        return app.isEmpty() ? true : this.appHasFilterEntry(app);
    }

    private appHasFilterEntry(app: MarketApplication): boolean {
        return this.applicationInput.hasMatchInEntry(app.getDisplayName()) ||
               this.applicationInput.hasMatchInEntry(app.getDescription());
    }
}

class StatusMessage
    extends DivEl {

    constructor() {
        super('status-message');
    }

    showLoading() {
        this.show();
        this.setHtml(i18n('market.loadAppList'));
    }

    showInstalling() {
        this.removeClass('failed');
        this.setHtml(i18n('market.installingApp'));
    }

    showNoResult() {
        this.show();
        this.setHtml(i18n('market.noAppsFound'));
    }

    showFailed(message: string) {
        this.show();
        this.addClass('failed');
        this.setHtml(message);
    }

    reset() {
        this.removeClass('failed');
    }
}
