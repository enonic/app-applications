import * as Q from 'q';
import {MarketApplicationResponse} from 'lib-admin-ui/application/MarketApplicationResponse';
import {ListMarketApplicationsRequest} from 'lib-admin-ui/application/ListMarketApplicationsRequest';
import {CONFIG} from 'lib-admin-ui/util/Config';

export class MarketApplicationFetcher {

    static fetchApps(from: number = 0, size: number = -1): Q.Promise<MarketApplicationResponse> {
        return new ListMarketApplicationsRequest()
            .setUrl(CONFIG.getString('marketUrl'))
            .setStart(from)
            .setCount(size)
            .setVersion(CONFIG.getString('xpVersion'))
            .sendAndParse();
    }
}
