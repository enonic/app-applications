import {ApplicationResourceRequest} from './ApplicationResourceRequest';
import {ApplicationInstallResult} from './ApplicationInstallResult';
import {HttpMethod} from '@enonic/lib-admin-ui/rest/HttpMethod';
import {ApplicationInstallResultJson} from './json/ApplicationInstallResultJson';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';


export class InstallUrlApplicationRequest
    extends ApplicationResourceRequest<ApplicationInstallResult> {

    private applicationUrl: string;

    constructor(applicationUrl: string) {
        super();
        this.setMethod(HttpMethod.POST);
        this.applicationUrl = applicationUrl;
        this.setHeavyOperation(true);
        this.addRequestPathElements('installUrl');
    }

    getParams(): object {
        return {
            URL: this.applicationUrl
        };
    }

    protected parseResponse(response: JsonResponse<ApplicationInstallResultJson>): ApplicationInstallResult {
        return ApplicationInstallResult.fromJson(response.getResult());
    }
}
