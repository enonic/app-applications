import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ApplicationInfo} from './ApplicationInfo';
import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {Path} from 'lib-admin-ui/rest/Path';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';

export class GetApplicationInfoRequest
    extends ApplicationResourceRequest<ApplicationInfoJson, ApplicationInfo> {

    private applicationKey: ApplicationKey;

    constructor(applicationKey: ApplicationKey) {
        super();
        this.applicationKey = applicationKey;
    }

    getParams(): Object {
        return {
            applicationKey: this.applicationKey.toString()
        };
    }

    getRequestPath(): Path {
        return Path.fromParent(super.getResourcePath(), 'info');
    }

    fromJson(json: ApplicationInfoJson): ApplicationInfo {
        return ApplicationInfo.fromJson(json);
    }

    sendAndParse(): Q.Promise<ApplicationInfo> {

        return this.send().then((response: JsonResponse<ApplicationInfoJson>) => {
            return this.fromJson(response.getResult());
        });
    }
}
