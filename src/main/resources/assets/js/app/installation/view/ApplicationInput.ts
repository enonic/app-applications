import {ApplicationUploaderEl} from '../ApplicationUploaderEl';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {CompositeFormInputEl} from '@enonic/lib-admin-ui/dom/CompositeFormInputEl';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {UploadStartedEvent} from '@enonic/lib-admin-ui/ui/uploader/UploadStartedEvent';
import {UploadItem} from '@enonic/lib-admin-ui/ui/uploader/UploadItem';
import {KeyHelper} from '@enonic/lib-admin-ui/ui/KeyHelper';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {UploadFailedEvent} from '@enonic/lib-admin-ui/ui/uploader/UploadFailedEvent';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {InstallUrlApplicationRequest} from '../../resource/InstallUrlApplicationRequest';
import {ApplicationInstallResult} from '../../resource/ApplicationInstallResult';

export class ApplicationInput
    extends CompositeFormInputEl {

    private static LAST_KEY_PRESS_TIMEOUT: number = 100;

    private textInput: InputEl;

    private applicationUploaderEl: ApplicationUploaderEl;

    private cancelAction: Action;

    private textValueChangedListeners: {(): void}[] = [];

    private appInstallStartedListeners: { (): void }[] = [];

    private appInstallFinishedListeners: {(): void}[] = [];

    private appInstallFailedListeners: {(message: string): void}[] = [];

    private static APPLICATION_ADDRESS_MASK: string = '^(http|https)://\\S+';

    constructor(cancelAction: Action, className?: string, originalValue?: string) {

        super();

        this.setWrappedInput(this.textInput = new InputEl('text'));
        this.setAdditionalElements(this.applicationUploaderEl = new ApplicationUploaderEl({
            name: 'application-input-uploader',
            allowDrop: true,
            showResult: false,
            allowMultiSelection: true,
            deferred: false,
            value: originalValue,
            showCancel: false
        }));

        this.cancelAction = cancelAction;

        this.applicationUploaderEl.onUploadStarted((event: UploadStartedEvent<Application>) => {
            let names = event.getUploadItems().map((uploadItem: UploadItem<Application>) => {
                return uploadItem.getName();
            });
            this.textInput.setValue(names.join(', '));
        });

        this.applicationUploaderEl.getUploadButton().getEl().setTabIndex(0);

        this.applicationUploaderEl.getUploadButton().onKeyDown((event: KeyboardEvent) => {
            if (KeyHelper.isSpace(event)) {
                this.applicationUploaderEl.showFileSelectionDialog();
            }
        });

        this.addClass('file-input' + (className ? ' ' + className : ''));
        this.initUrlEnteredHandler();
    }

    public getValue(): string {
        return this.textInput.getValue();
    }

    private initUrlEnteredHandler() {
        const keyDownHandler: () => void = AppHelper.debounce(() => this.startInstall(), ApplicationInput.LAST_KEY_PRESS_TIMEOUT);

        this.onKeyDown((event) => {
            switch (event.keyCode) {
            case 9: //TAB
                break;
            case 13:
                if (this.isUrlTyped()) {
                    this.installWithUrl(this.textInput.getValue());
                } else {
                    keyDownHandler();
                }
                break;
            case 27: //esc
                break;
            default :
                keyDownHandler();
                break;
            }
        });
    }

    isUrlTyped() {
        const value = this.textInput.getValue();
        return StringHelper.testRegex(ApplicationInput.APPLICATION_ADDRESS_MASK, value);
    }

    onAppInstallStarted(listener: () => void) {
        this.appInstallStartedListeners.push(listener);
    }

    unAppInstallStarted(listener: () => void) {
        this.appInstallStartedListeners = this.appInstallStartedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    setPlaceholder(placeholder: string): ApplicationInput {
        this.textInput.setPlaceholder(placeholder);
        return this;
    }

    getTextInput(): InputEl {
        return this.textInput;
    }

    reset(): ApplicationInput {
        this.textInput.reset();
        this.applicationUploaderEl.reset();
        this.notifyTextValueChanged();
        return this;
    }

    stop(): ApplicationInput {
        this.applicationUploaderEl.stop();
        return this;
    }

    getUploader(): ApplicationUploaderEl {
        return this.applicationUploaderEl;
    }

    onUploadStarted(listener: (event: UploadStartedEvent<Application>) => void) {
        this.applicationUploaderEl.onUploadStarted(listener);
    }

    unUploadStarted(listener: (event: UploadStartedEvent<Application>) => void) {
        this.applicationUploaderEl.unUploadStarted(listener);
    }

    onUploadFailed(listener: (event: UploadFailedEvent<Application>) => void) {
        this.applicationUploaderEl.onUploadFailed(listener);
    }

    unUploadFailed(listener: (event: UploadFailedEvent<Application>) => void) {
        this.applicationUploaderEl.unUploadFailed(listener);
    }

    onTextValueChanged(listener: () => void) {
        this.textValueChangedListeners.push(listener);
    }

    unTextValueChanged(listener: () => void) {
        this.textValueChangedListeners = this.textValueChangedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyTextValueChanged() {
        this.textValueChangedListeners.forEach((listener) => {
            listener();
        });
    }

    private startInstall() {
        if (!StringHelper.isEmpty(this.textInput.getValue())) {
            if (!this.isUrlTyped()) {
                this.notifyTextValueChanged();
            } else {
                this.notifyAppInstallFinished();
            }
        } else {
            this.notifyTextValueChanged();
        }
    }

    private installWithUrl(url: string) {
        this.notifyAppInstallStarted();
        this.disable();

        new InstallUrlApplicationRequest(url).sendAndParse().then((result: ApplicationInstallResult) => {
            const failure: string = result.getFailure();

            if (!failure) {
                this.notifyAppInstallFinished();
                this.cancelAction.execute();
            } else {
                this.notifyAppInstallFailed(failure);
            }

            this.enable();
        }).catch((reason: any) => {
            DefaultErrorHandler.handle(reason);
            this.notifyAppInstallFailed(reason);
            this.enable();
        });
    }

    private notifyAppInstallStarted() {
        this.appInstallStartedListeners.forEach((listener) => {
            listener();
        });
    }

    onAppInstallFinished(listener: () => void) {
        this.appInstallFinishedListeners.push(listener);
    }

    unAppInstallFinished(listener: () => void) {
        this.appInstallFinishedListeners = this.appInstallFinishedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyAppInstallFinished() {
        this.appInstallFinishedListeners.forEach((listener) => {
            listener();
        });
    }

    onAppInstallFailed(listener: (message: string) => void) {
        this.appInstallFailedListeners.push(listener);
    }

    unAppInstallFailed(listener: (message: string) => void) {
        this.appInstallFailedListeners = this.appInstallFailedListeners.filter((curr) => {
            return listener !== curr;
        });
    }

    private notifyAppInstallFailed(message: string) {
        this.appInstallFailedListeners.forEach((listener) => {
            listener(message);
        });
    }

    private disable() {
        this.addClass('disabled');
        this.textInput.getEl().setDisabled(true);
    }

    private enable() {
        this.removeClass('disabled');
        this.textInput.getEl().setDisabled(false);
    }
}
