import {Application} from 'lib-admin-ui/application/Application';
import {UploaderEl, UploaderElConfig} from 'lib-admin-ui/ui/uploader/UploaderEl';
import {UriHelper} from 'lib-admin-ui/util/UriHelper';
import {ApplicationInstallResultJson} from 'lib-admin-ui/application/json/ApplicationInstallResultJson';
import {ApplicationInstallResult} from 'lib-admin-ui/application/ApplicationInstallResult';
import {AEl} from 'lib-admin-ui/dom/AEl';
import {Element} from 'lib-admin-ui/dom/Element';

export class ApplicationUploaderEl
    extends UploaderEl<Application> {

    private failure: string;

    constructor(config: UploaderElConfig) {

        if (config.url == null) {
            config.url = UriHelper.getRestUri('application/install');
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
        return new AEl().setUrl(UriHelper.getRestUri('application/' + value), '_blank');
    }

    protected getErrorMessage(): string {
        return 'The application could not be installed';
    }
}
