import ApplicationResourceRequest = api.application.ApplicationResourceRequest;
import ApplicationKey = api.application.ApplicationKey;

export class ApplicationActionRequest
    extends ApplicationResourceRequest<void, void> {

    private applicationKeys: ApplicationKey[];
    private action: string;

    constructor(applicationKeys: ApplicationKey[], action: string) {
        super();
        super.setMethod('POST');
        this.applicationKeys = applicationKeys;
        this.action = action;
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromParent(super.getResourcePath(), this.action);
    }

    getParams(): Object {
        return {
            key: ApplicationKey.toStringArray(this.applicationKeys)
        };
    }

    sendAndParse(): wemQ.Promise<void> {

        const result = wemQ.defer<void>();

        this.send().catch(e => result.reject(e));

        return result.promise;
    }
}
