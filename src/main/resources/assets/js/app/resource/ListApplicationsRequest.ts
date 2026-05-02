import {ListApplicationsRequest as LibListAppsRequest} from '@enonic/lib-admin-ui/application/ListApplicationsRequest';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {UrlHelper} from '../util/UrlHelper';
import {SystemAppsHelper} from '../SystemAppsHelper';

interface ApplicationJsonExt extends ApplicationJson {
    title?: string;
    system?: boolean;
}

interface ListApplicationsJson {
    applications: ApplicationJsonExt[];
}

export class ListApplicationsRequest
    extends LibListAppsRequest {

    getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    protected parseResponse(response: JsonResponse<ListApplicationsJson>): Application[] {
        const result = response.getResult();
        const helper = SystemAppsHelper.get();
        result.applications?.forEach((app: ApplicationJsonExt) => {
            app.displayName = app.title || app.key;
            helper.setSystemFlag(app.key, !!app.system);
        });
        return Application.fromJsonArray(result.applications);
    }
}
