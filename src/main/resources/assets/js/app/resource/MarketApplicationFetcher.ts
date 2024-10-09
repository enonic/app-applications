import * as Q from 'q';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {MarketApplicationResponse} from '../MarketApplicationResponse';
import {ListMarketApplicationsRequest} from '../ListMarketApplicationsRequest';

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
