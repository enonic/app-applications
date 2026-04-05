import {GetApplicationRequest as LibGetAppRequest} from '@enonic/lib-admin-ui/application/GetApplicationRequest';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {ApplicationCache} from '@enonic/lib-admin-ui/application/ApplicationCache';
import {UrlHelper} from '../util/UrlHelper';

interface ApplicationJsonWithTitle extends ApplicationJson {
    title?: string;
}

export class GetApplicationRequest
    extends LibGetAppRequest {

    getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    protected parseResponse(response: JsonResponse<ApplicationJsonWithTitle>): Application {
        const json = response.getResult();
        json.displayName = json.title || json.key;
        const app = Application.fromJson(json);
        ApplicationCache.get().put(app);
        return app;
    }
}
