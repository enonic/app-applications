import * as Q from 'q';
import {MarketApplicationResponse} from 'lib-admin-ui/application/MarketApplicationResponse';
import {ListMarketApplicationsRequest} from 'lib-admin-ui/application/ListMarketApplicationsRequest';

export class MarketApplicationFetcher {

    static fetchApps(version: string, from: number = 0, size: number = -1): Q.Promise<MarketApplicationResponse> {
        return new ListMarketApplicationsRequest()
            .setStart(from)
            .setCount(size)
            .setVersion(version)
            .sendAndParse();
    }
}
