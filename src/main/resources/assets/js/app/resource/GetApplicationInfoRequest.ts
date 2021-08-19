import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ApplicationInfo} from './ApplicationInfo';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {CmsApplicationResourceRequest} from './CmsApplicationResourceRequest';

export class GetApplicationInfoRequest
    extends CmsApplicationResourceRequest<ApplicationInfo> {

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
