import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {ApplicationResourceRequest} from './ApplicationResourceRequest';

export class ListApplicationKeysRequest
    extends ApplicationResourceRequest<ApplicationKey[]> {

    private searchQuery: string;

    constructor(apiName: string = 'listKeys') {
        super();

        this.addRequestPathElements(apiName);
    }

    getParams(): object {
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
