import Q from 'q';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {HttpMethod} from '@enonic/lib-admin-ui/rest/HttpMethod';
import {ResourceRequest} from '@enonic/lib-admin-ui/rest/ResourceRequest';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {Path} from '@enonic/lib-admin-ui/rest/Path';

export class ApplicationActionRequest
    extends ResourceRequest<void> {

    private applicationKeys: ApplicationKey[];

    private action: string;

    constructor(applicationKeys: ApplicationKey[], action: string) {
        super();
        super.setMethod(HttpMethod.POST);
        this.applicationKeys = applicationKeys;
        this.action = action;
    }

    getParams(): object {
        return {
            key: ApplicationKey.toStringArray(this.applicationKeys)
        };
    }

    getRequestPath(): Path {
        return Path.fromString(CONFIG.getString(`serverAppApi.${this.action}`));
    }

    sendAndParse(): Q.Promise<void> {

        const result = Q.defer<void>();

        this.send().catch(e => result.reject(e));

        return result.promise;
    }
}
