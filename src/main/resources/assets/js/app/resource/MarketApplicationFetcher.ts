import * as Q from 'q';
import {ListMarketApplicationsRequest} from './ListMarketApplicationsRequest';
import {MarketApplicationResponse} from './MarketApplicationResponse';

export class MarketApplicationFetcher {

    static fetchApps(version: string, from: number = 0, size: number = -1): Q.Promise<MarketApplicationResponse> {
        return new ListMarketApplicationsRequest()
            .setStart(from)
            .setCount(size)
            .setVersion(version)
            .sendAndParse();
    }
}
