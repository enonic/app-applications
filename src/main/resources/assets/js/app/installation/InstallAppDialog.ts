import '../../api.ts';
import {ApplicationInput} from './view/ApplicationInput';
import {MarketAppsTreeGrid} from './view/MarketAppsTreeGrid';
import {MarketApplication} from '../market/MarketApplication';
import {ApplicationUploaderEl} from './ApplicationUploaderEl';
import {ApplicationUploadStartedEvent} from '../browse/ApplicationUploadStartedEvent';
import TreeNode = api.ui.treegrid.TreeNode;
import FileUploadStartedEvent = api.ui.uploader.FileUploadStartedEvent;
import FileUploadFailedEvent = api.ui.uploader.FileUploadFailedEvent;
import Application = api.application.Application;
import i18n = api.util.i18n;
import DivEl = api.dom.DivEl;

export class InstallAppDialog
    extends api.ui.dialog.ModalDialog {

    private dropzoneContainer: api.ui.uploader.DropzoneContainer;

    private applicationInput: ApplicationInput;

    private statusMessage: api.dom.DivEl;

    private clearButton: api.dom.ButtonEl;

    private marketAppsTreeGrid: MarketAppsTreeGrid;

    constructor() {
        super({title: i18n('dialog.install')});

        this.addClass('install-application-dialog hidden');

        this.getBody().addClass('mask-wrapper');

        this.initElements();
        this.setupListeners();
    }

    private initElements() {
        this.statusMessage = new api.dom.DivEl('status-message');

        this.applicationInput = new ApplicationInput(this.getCancelAction(), 'large').setPlaceholder(i18n('dialog.install.search'));

        this.clearButton = this.createClearFilterButton();

        this.dropzoneContainer = new api.ui.uploader.DropzoneContainer(true);

        this.marketAppsTreeGrid = new MarketAppsTreeGrid();
        this.marketAppsTreeGrid.setNodesFilter(this.filterNodes.bind(this));
    }

    private setupListeners() {
        this.applicationInput.onTextValueChanged(() => {
            this.clearButton.toggleClass('hidden', api.util.StringHelper.isEmpty(this.applicationInput.getValue()));
            this.marketAppsTreeGrid.refresh();
        });

        const showMask = api.util.AppHelper.debounce(this.marketAppsTreeGrid.mask.bind(this.marketAppsTreeGrid), 300, false);
        this.applicationInput.getTextInput().onValueChanged(() => {
            if (!this.applicationInput.isUrlTyped()) {
                showMask();
            }
        });
        this.applicationInput.onAppInstallStarted(() => {
            this.marketAppsTreeGrid.mask();
        });

        this.applicationInput.onAppInstallFinished(() => {
            this.clearButton.toggleClass('hidden', api.util.StringHelper.isEmpty(this.applicationInput.getValue()));
            this.marketAppsTreeGrid.unmask();
        });

        this.applicationInput.onAppInstallFailed((message: string) => {
            this.clearButton.toggleClass('hidden', api.util.StringHelper.isEmpty(this.applicationInput.getValue()));

            this.marketAppsTreeGrid.invalidate();
            this.marketAppsTreeGrid.initData([]);
            this.marketAppsTreeGrid.unmask();

            this.statusMessage.addClass('empty failed');
            this.statusMessage.setHtml(message);
        });

        this.marketAppsTreeGrid.onLoaded(() => {
            this.refreshStatusMessage();

            if (this.marketAppsTreeGrid.getGrid().getDataView().getLength() === 0) {
                this.statusMessage.addClass('empty');
                this.statusMessage.setHtml(i18n('market.noAppsFound'));
            } else {
                this.statusMessage.removeClass('empty');
            }
            this.statusMessage.addClass('loaded');
            this.notifyResize();
        });

        this.initUploaderListeners();
        this.initDragAndDropUploaderEvents();

        this.onShown(() => {
            this.applicationInput.giveFocus();
            this.clearButton.addClass('hidden');
        });
    }

    updateInstallApplications(installApplications: api.application.Application[]) {
        this.marketAppsTreeGrid.updateInstallApplications(installApplications);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.dropzoneContainer.hide();
            this.appendChild(this.dropzoneContainer);

            this.applicationInput.appendChild(this.clearButton);
            this.applicationInput.getUploader().addDropzone(this.dropzoneContainer.getDropzone().getId());

            this.header.appendChildren(...[this.applicationInput, this.statusMessage]);

            const marketAppsDiv: DivEl = new DivEl('market-apps');
            marketAppsDiv.appendChild(this.marketAppsTreeGrid);
            this.appendChildToContentPanel(marketAppsDiv);

            return rendered;
        });
    }

    public createClearFilterButton(): api.dom.ButtonEl {
        const clearButton = new api.dom.ButtonEl();
        clearButton.addClass('clear-button hidden');
        clearButton.onClicked(() => {
            this.applicationInput.reset();
            this.marketAppsTreeGrid.refresh();
            clearButton.addClass('hidden');
            this.applicationInput.getTextInput().giveFocus();
        });
        return clearButton;
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

        const uploadFailedHandler = (event: FileUploadFailedEvent<Application>, uploader: ApplicationUploaderEl) => {
            api.notify.NotifyManager.get().showWarning(uploader.getFailure());

            this.resetFileInputWithUploader();
        };

        this.applicationInput.onUploadFailed((event) => {
            uploadFailedHandler(event, this.applicationInput.getUploader());
        });

        const uploadStartedHandler = (event: FileUploadStartedEvent<Application>) => {
            new ApplicationUploadStartedEvent(event.getUploadItems()).fire();
            this.close();
        };

        this.applicationInput.onUploadStarted(uploadStartedHandler);
    }

    open() {
        this.resetFileInputWithUploader();
        this.removeClass('hidden');

        super.open();

        this.refreshStatusMessage();
    }

    close() {
        this.refreshStatusMessage();
        this.addClass('hidden');
        this.removeClass('animated');
        this.applicationInput.reset();
        super.close();
    }

    private resetFileInputWithUploader() {
        if (this.applicationInput) {
            this.applicationInput.reset();
        }
    }

    private refreshStatusMessage() {
        if (this.statusMessage) {
            this.statusMessage.removeClass('failed loaded');
            this.statusMessage.setHtml(i18n('market.loadAppList'));
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
