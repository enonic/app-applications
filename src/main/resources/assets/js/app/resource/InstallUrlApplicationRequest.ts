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
        return Path.fromString(CONFIG.getString('serverAppApi.installUrl'));
    }

    protected parseResponse(response: JsonResponse<ApplicationJson>): Application {
        return Application.fromJson(response.getResult());
    }
}
