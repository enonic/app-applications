import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ApplicationInfo} from './ApplicationInfo';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {ApplicationResourceRequest} from './ApplicationResourceRequest';

export class GetApplicationInfoRequest
    extends ApplicationResourceRequest<ApplicationInfo> {

    private applicationKey: ApplicationKey;

    constructor(applicationKey: ApplicationKey) {
        super();
        this.applicationKey = applicationKey;
        this.addRequestPathElements('info');
    }

    getParams(): object {
        return {
            applicationKey: this.applicationKey.toString()
        };
    }

    fromJson(json: ApplicationInfoJson): ApplicationInfo {
        return ApplicationInfo.fromJson(json);
    }

    protected parseResponse(response: JsonResponse<ApplicationInfoJson>): ApplicationInfo {
        return this.fromJson(response.getResult());
    }
}
