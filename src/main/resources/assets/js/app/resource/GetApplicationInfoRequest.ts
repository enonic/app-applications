import ApplicationResourceRequest = api.application.ApplicationResourceRequest;
import ApplicationKey = api.application.ApplicationKey;
import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ApplicationInfo} from './ApplicationInfo';

export class GetApplicationInfoRequest
    extends ApplicationResourceRequest<ApplicationInfoJson, ApplicationInfo> {

    private applicationKey: ApplicationKey;

    constructor(applicationKey: ApplicationKey) {
        super();
        this.applicationKey = applicationKey;
        super.setMethod('GET');
    }

    getParams(): Object {
        return {
            applicationKey: this.applicationKey.toString()
        };
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromParent(super.getResourcePath(), 'info');
    }

    fromJson(json: ApplicationInfoJson): ApplicationInfo {
        return ApplicationInfo.fromJson(json);
    }

    sendAndParse(): wemQ.Promise<ApplicationInfo> {

        return this.send().then((response: api.rest.JsonResponse<ApplicationInfoJson>) => {
            return this.fromJson(response.getResult());
        });
    }
}
