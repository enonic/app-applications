import {Application} from '@enonic/lib-admin-ui/application/Application';
import {UploaderEl, UploaderElConfig} from '@enonic/lib-admin-ui/ui/uploader/UploaderEl';
import {AEl} from '@enonic/lib-admin-ui/dom/AEl';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ApplicationInstallResultJson} from '../resource/json/ApplicationInstallResultJson';
import {ApplicationInstallResult} from '../resource/ApplicationInstallResult';
import {UrlHelper} from '../util/UrlHelper';
import {UploadItem} from '@enonic/lib-admin-ui/ui/uploader/UploadItem';

export class ApplicationUploaderEl
    extends UploaderEl<Application> {

    private failure: string;

    constructor(config: UploaderElConfig) {

        if (config.url == null) {
            config.url = UrlHelper.getRestUri('application/install');
        }

        if (config.allowExtensions == null) {
            config.allowExtensions = [{title: 'Application files', extensions: 'jar,zip'}];
        }

        super(config);

        this.addClass('application-uploader-el');
    }

    createModel(serverResponse: ApplicationInstallResultJson): Application {
        if (!serverResponse) {
            return null;
        }

        let result = ApplicationInstallResult.fromJson(serverResponse);

        this.failure = result.getFailure();

        return result.getApplication();
    }

    getFailure(): string {
        return this.failure;
    }

    getModelValue(item: Application): string {
        return item.getId();
    }

    createResultItem(value: string): Element {
        return new AEl().setUrl(UrlHelper.getRestUri(`application/${value}`), '_blank');
    }

    protected getErrorMessage(): string {
        return 'The application could not be installed';
    }

    protected isAllowedToUpload(id: number, name: string): boolean {
        return !this.uploadedItems.some((item: UploadItem<Application>) => item.getFileName() === name);
    }
}
