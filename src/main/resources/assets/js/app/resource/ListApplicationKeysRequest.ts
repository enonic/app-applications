import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';

export class ListApplicationKeysRequest
    extends ApplicationResourceRequest<ApplicationKey[]> {

    private searchQuery: string;

    constructor(apiName: string = 'listKeys') {
        super();

        this.addRequestPathElements(apiName);
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

    protected parseResponse(response: JsonResponse<string[]>): ApplicationKey[] {
        return response.getResult().map(application => ApplicationKey.fromString(application));
    }
}
