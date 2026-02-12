import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ResourceRequest} from '@enonic/lib-admin-ui/rest/ResourceRequest';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ApplicationInstallResult} from './ApplicationInstallResult';
import {HttpMethod} from '@enonic/lib-admin-ui/rest/HttpMethod';
import {ApplicationInstallResultJson} from './json/ApplicationInstallResultJson';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';


export class InstallUrlApplicationRequest
    extends ResourceRequest<ApplicationInstallResult> {

    private readonly applicationUrl: string;

    constructor(applicationUrl: string) {
        super();
        this.setMethod(HttpMethod.POST);
        this.applicationUrl = applicationUrl;
        this.setHeavyOperation(true);
    }

    getParams(): object {
        return {
            URL: this.applicationUrl
        };
    }

    getRequestPath(): Path {
        return Path.fromString(CONFIG.getString('applicationInstallApiUrl'));
    }

    protected parseResponse(response: JsonResponse<ApplicationInstallResultJson>): ApplicationInstallResult {
        return ApplicationInstallResult.fromJson(response.getResult());
    }
}
