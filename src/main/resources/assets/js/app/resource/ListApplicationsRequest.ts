import {ListApplicationsRequest as LibListAppsRequest} from '@enonic/lib-admin-ui/application/ListApplicationsRequest';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {UrlHelper} from '../util/UrlHelper';

interface ApplicationJsonWithTitle extends ApplicationJson {
    title?: string;
}

interface ListApplicationsJson {
    applications: ApplicationJsonWithTitle[];
}

export class ListApplicationsRequest
    extends LibListAppsRequest {

    getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    protected parseResponse(response: JsonResponse<ListApplicationsJson>): Application[] {
        const result = response.getResult();
        result.applications?.forEach((app: ApplicationJsonWithTitle) => {
            app.displayName = app.title || app.key;
        });
        return Application.fromJsonArray(result.applications);
    }
}
