import * as Q from 'q';
import {ApplicationInput} from './view/ApplicationInput';
import {MarketAppsTreeGrid} from './view/MarketAppsTreeGrid';
import {ApplicationUploaderEl} from './ApplicationUploaderEl';
import {ApplicationUploadStartedEvent} from '../browse/ApplicationUploadStartedEvent';
import {Application} from 'lib-admin-ui/application/Application';
import {ModalDialog} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {DropzoneContainer} from 'lib-admin-ui/ui/uploader/UploaderEl';
import {ButtonEl} from 'lib-admin-ui/dom/ButtonEl';
import {i18n} from 'lib-admin-ui/util/Messages';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';
import {UploadFailedEvent} from 'lib-admin-ui/ui/uploader/UploadFailedEvent';
import {NotifyManager} from 'lib-admin-ui/notify/NotifyManager';
import {UploadStartedEvent} from 'lib-admin-ui/ui/uploader/UploadStartedEvent';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {MarketApplication} from 'lib-admin-ui/application/MarketApplication';

export class InstallAppDialog
    extends ModalDialog {

    private dropzoneContainer: DropzoneContainer;

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

        this.clearButton = new ButtonEl();

        this.dropzoneContainer = new DropzoneContainer(true);

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
            this.marketAppsTreeGrid.reload();
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
            this.marketAppsTreeGrid.reload();
            this.clearButton.hide();
            this.applicationInput.getTextInput().giveFocus();
        });

        this.initUploaderListeners();
        this.initDragAndDropUploaderEvents();

        this.onShown(() => {
            this.clearButton.hide();
        });
    }

    updateInstallApplications(installApplications: Application[]) {
        this.marketAppsTreeGrid.updateInstallApplications(installApplications);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.dropzoneContainer.hide();
            this.appendChild(this.dropzoneContainer);

            this.getBody().addClass('mask-wrapper');

            this.clearButton.addClass('clear-button icon-close');
            this.applicationInput.appendChild(this.clearButton);
            this.applicationInput.getUploader().addDropzone(this.dropzoneContainer.getDropzone().getId());

            this.header.appendChildren<DivEl>(this.applicationInput, this.statusMessage);

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
            NotifyManager.get().showWarning(uploader.getFailure());

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
        if (this.applicationInput && !StringHelper.isEmpty(this.applicationInput.getValue())) {
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
