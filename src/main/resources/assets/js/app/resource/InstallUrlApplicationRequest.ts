import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ResourceRequest} from '@enonic/lib-admin-ui/rest/ResourceRequest';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {HttpMethod} from '@enonic/lib-admin-ui/rest/HttpMethod';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';

export class InstallUrlApplicationRequest
    extends ResourceRequest<Application> {

    private readonly applicationUrl: string;

    private readonly sha512: string;

    constructor(applicationUrl: string, sha512?: string) {
        super();
        this.setMethod(HttpMethod.POST);
        this.applicationUrl = applicationUrl;
        this.sha512 = sha512;
        this.setHeavyOperation(true);
    }

    getParams(): object {
        return {
            URL: this.applicationUrl,
            ...(this.sha512 && {sha512: this.sha512})
        };
    }

    getRequestPath(): Path {
        return Path.fromString(CONFIG.getString('serverAppApi.installUrl'));
    }

    protected parseResponse(response: JsonResponse<ApplicationJson>): Application {
        return Application.fromJson(response.getResult());
    }
}
