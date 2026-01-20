import Q from 'q';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {MarketApplicationResponse} from '../MarketApplicationResponse';
import {ListMarketApplicationsRequest} from '../ListMarketApplicationsRequest';

export class MarketApplicationFetcher {

    static fetchApps(): Q.Promise<MarketApplicationResponse> {
        return new ListMarketApplicationsRequest()
            .setUrl(CONFIG.getString('marketApi'))
            .sendAndParse();
    }
}
