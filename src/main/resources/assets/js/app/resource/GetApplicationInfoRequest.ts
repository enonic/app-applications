import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ApplicationInfo} from './ApplicationInfo';
import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';

export class GetApplicationInfoRequest
    extends ApplicationResourceRequest<ApplicationInfo> {

    private applicationKey: ApplicationKey;

    constructor(applicationKey: ApplicationKey) {
        super();
        this.applicationKey = applicationKey;
        this.addRequestPathElements('info');
    }

    getParams(): Object {
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
