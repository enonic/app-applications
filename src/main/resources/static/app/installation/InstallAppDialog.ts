import Q from 'q';
import {ApplicationInput} from './view/ApplicationInput';
import {MarketAppsTreeGrid} from './view/MarketAppsTreeGrid';
import {ApplicationUploaderEl} from './ApplicationUploaderEl';
import {ApplicationUploadStartedEvent} from '../browse/ApplicationUploadStartedEvent';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {DropzoneContainer} from '@enonic/lib-admin-ui/ui/uploader/UploaderEl';
import {ButtonEl} from '@enonic/lib-admin-ui/dom/ButtonEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {UploadFailedEvent} from '@enonic/lib-admin-ui/ui/uploader/UploadFailedEvent';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {UploadStartedEvent} from '@enonic/lib-admin-ui/ui/uploader/UploadStartedEvent';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';

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

        this.marketAppsTreeGrid.reload();
    }

    protected initElements() {
        super.initElements();

        this.statusMessage = new StatusMessage();

        this.applicationInput = new ApplicationInput(this.getCancelAction(), 'large').setPlaceholder(i18n('dialog.install.search'));

        this.clearButton = new ButtonEl();

        this.dropzoneContainer = new DropzoneContainer(true);

        this.marketAppsTreeGrid = new MarketAppsTreeGrid((item, args) => {
            if (!item.isVisible()) {
                return false;
            }

            const marketApp = item.getData();
            if (marketApp.isEmpty()) {
                // true for an empty app because it is the empty node that triggers loading
                return true;
            }

            const inputValue = args?.searchString?.toLowerCase() || '';

            const displayName = marketApp.getDisplayName().toLowerCase();
            const description = marketApp.getDescription().toLowerCase();

            return displayName.indexOf(inputValue) >= 0 || description.indexOf(inputValue) >= 0;
        });
    }

    protected postInitElements() {
        super.postInitElements();
        this.setElementToFocusOnShow(this.applicationInput);
    }

    protected initListeners() {
        super.initListeners();

        this.applicationInput.onTextValueChanged(() => {
            const searchString = this.applicationInput.getValue();
            const hasValue = !StringHelper.isEmpty(searchString);
            this.clearButton.setVisible(hasValue);
            this.marketAppsTreeGrid.setFilterArgs({searchString});
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
            this.toggleStatusMessage(this.marketAppsTreeGrid.isDataViewEmpty());
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
            this.clearButton.hide();
            this.applicationInput.getTextInput().giveFocus();
        });

        this.initUploaderListeners();
        this.initDragAndDropUploaderEvents();

        this.onShown(() => {
            this.clearButton.hide();
        });

        this.marketAppsTreeGrid.onShown(() => {
            const isLoading = this.hasClass('loading');
            if (isLoading) {
                this.marketAppsTreeGrid.mask();
            }
        });

        this.marketAppsTreeGrid.onRowCountChanged((event, data) => {
            const isLoading = this.hasClass('loading');
            if (!isLoading) {
                this.toggleStatusMessage(data.current < 1);
            }
        });
    }

    private toggleStatusMessage(showStatus: boolean) {
        if (showStatus) {
            this.statusMessage.showNoResult();
            if (this.getBody().isVisible()) {
                this.getBody().hide();
            }
        } else {
            this.statusMessage.hide();
            if (!this.getBody().isVisible()) {
                this.getBody().show();
                this.marketAppsTreeGrid.getGrid().resizeCanvas();
            }
        }
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
            const target = event.target as HTMLElement;

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
