import * as Q from 'q';
import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {HttpMethod} from 'lib-admin-ui/rest/HttpMethod';

export class ApplicationActionRequest
    extends ApplicationResourceRequest<void> {

    private applicationKeys: ApplicationKey[];

    constructor(applicationKeys: ApplicationKey[], action: string) {
        super();
        super.setMethod(HttpMethod.POST);
        this.applicationKeys = applicationKeys;

        this.addRequestPathElements(action);
    }

    getParams(): Object {
        return {
            key: ApplicationKey.toStringArray(this.applicationKeys)
        };
    }

    sendAndParse(): Q.Promise<void> {

        const result = Q.defer<void>();

        this.send().catch(e => result.reject(e));

        return result.promise;
    }
}
