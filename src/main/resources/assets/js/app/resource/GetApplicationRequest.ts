import {GetApplicationRequest as LibGetAppRequest} from '@enonic/lib-admin-ui/application/GetApplicationRequest';
import {UrlHelper} from '../util/UrlHelper';

export class GetApplicationRequest
    extends LibGetAppRequest {

    getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }
}
