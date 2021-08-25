import {ResourceRequest} from 'lib-admin-ui/rest/ResourceRequest';
import {UrlHelper} from '../util/UrlHelper';
import {ApplicationJson} from 'lib-admin-ui/application/json/ApplicationJson';
import {Application} from 'lib-admin-ui/application/Application';

export class ApplicationResourceRequest<PARSED_TYPE>
    extends ResourceRequest<PARSED_TYPE> {

    constructor() {
        super();
        this.addRequestPathElements('application');
    }

    getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    fromJsonToApplication(json: ApplicationJson): Application {
        return Application.fromJson(json);
    }
}
