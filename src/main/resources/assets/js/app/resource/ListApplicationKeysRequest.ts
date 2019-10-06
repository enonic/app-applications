import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {Path} from 'lib-admin-ui/rest/Path';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';

export class ListApplicationKeysRequest
    extends ApplicationResourceRequest<string[], ApplicationKey[]> {

    private searchQuery: string;
    private apiName: string;

    constructor(apiName: string = 'listKeys') {
        super();
        super.setMethod('GET');

        this.apiName = apiName;
    }

    getParams(): Object {
        return {
            query: this.searchQuery
        };
    }

    setSearchQuery(query: string): ListApplicationKeysRequest {
        this.searchQuery = query;
        return this;
    }

    getRequestPath(): Path {
        return Path.fromParent(super.getResourcePath(), this.apiName);
    }

    sendAndParse(): Q.Promise<ApplicationKey[]> {

        return this.send().then((response: JsonResponse<string[]>) => {
            return response.getResult().map(application => ApplicationKey.fromString(application));
        });
    }
}
