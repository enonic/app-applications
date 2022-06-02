import {UriHelper} from '@enonic/lib-admin-ui/util/UriHelper';

export class UrlHelper {

    static getRestUri(path: string): string {
        return UriHelper.getAdminUri(UriHelper.joinPath('rest-v2', 'apps', UriHelper.relativePath(path)));
    }
}
